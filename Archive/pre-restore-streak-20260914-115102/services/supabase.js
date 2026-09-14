/**
 * Supabase Service — Client Initialization & Database API Adapter
 */
import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'panda_supabase_custom_config';
const USER_ID_KEY = 'panda_lingua_user_id';

class SupabaseService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.userId = this.getOrCreateUserId();
    this.init();
  }

  // Get or generate persistent User UUID
  getOrCreateUserId() {
    let uid = localStorage.getItem(USER_ID_KEY);
    if (!uid) {
      uid = 'user_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem(USER_ID_KEY, uid);
    }
    return uid;
  }

  // Retrieve current config from ENV or localStorage
  getConfig() {
    let url = '';
    let anonKey = '';

    // Check Vite env
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      url = import.meta.env.VITE_SUPABASE_URL || '';
      anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    }

    // Check custom localStorage override (useful for browser testing without rebuild)
    try {
      const custom = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
      if (custom.url && custom.anonKey) {
        url = custom.url;
        anonKey = custom.anonKey;
      }
    } catch {
      // ignore
    }

    return { url: url.trim(), anonKey: anonKey.trim() };
  }

  // Save custom configuration from in-app modal
  saveCustomConfig(url, anonKey) {
    if (!url || !anonKey) {
      localStorage.removeItem(CONFIG_KEY);
    } else {
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
    }
    this.init();
  }

  init() {
    const { url, anonKey } = this.getConfig();
    if (url && anonKey && url.startsWith('http')) {
      try {
        this.client = createClient(url, anonKey, {
          auth: { persistSession: true, autoRefreshToken: true }
        });
      } catch (err) {
        console.warn('⚠️ Supabase init error:', err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  isConfigured() {
    const { url, anonKey } = this.getConfig();
    return Boolean(this.client && url && anonKey && !url.includes('your-project-id'));
  }

  // Test connection to Supabase
  async testConnection() {
    if (!this.isConfigured()) {
      return { success: false, message: 'Chưa cấu hình Supabase URL hoặc Anon Key.' };
    }
    try {
      const { data, error } = await this.client
        .from('vocabularies')
        .select('id')
        .limit(1);

      if (error) {
        return { success: false, message: error.message };
      }
      this.isConnected = true;
      return { success: true, message: 'Kết nối Supabase thành công!' };
    } catch (err) {
      this.isConnected = false;
      return { success: false, message: err.message || 'Không thể kết nối đến Supabase.' };
    }
  }

  // Fetch all vocabulary with examples
  async fetchVocabularies() {
    if (!this.isConfigured()) return null;
    try {
      const { data, error } = await this.client
        .from('vocabularies')
        .select(`
          id,
          hanzi,
          pinyin,
          meaning,
          level,
          category,
          vocabulary_examples (
            example_hanzi,
            example_pinyin,
            example_meaning
          )
        `)
        .order('id', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data.map(item => ({
        id: item.id,
        hanzi: item.hanzi,
        pinyin: item.pinyin,
        meaning: item.meaning,
        level: item.level,
        category: item.category,
        example: item.vocabulary_examples && item.vocabulary_examples.length > 0 ? {
          hanzi: item.vocabulary_examples[0].example_hanzi,
          pinyin: item.vocabulary_examples[0].example_pinyin,
          meaning: item.vocabulary_examples[0].example_meaning
        } : null
      }));
    } catch (err) {
      console.warn('⚠️ Could not fetch vocabularies from Supabase:', err);
      return null;
    }
  }

  // Fetch user learning progress
  async fetchUserProgress() {
    if (!this.isConfigured()) return null;
    try {
      const { data, error } = await this.client
        .from('user_vocab_progress')
        .select('*')
        .eq('user_id', this.userId);

      if (error) throw error;
      if (!data) return {};

      const progressMap = {};
      data.forEach(row => {
        progressMap[row.vocab_id] = {
          vocabId: row.vocab_id,
          status: row.status,
          repetition: row.repetition,
          easeFactor: Number(row.ease_factor),
          interval: row.interval_days,
          lastReviewedAt: row.last_reviewed_at,
          nextReviewAt: row.next_review_at,
          totalReviews: row.total_reviews,
          totalLapses: row.total_lapses
        };
      });
      return progressMap;
    } catch (err) {
      console.warn('⚠️ Could not fetch progress from Supabase:', err);
      return null;
    }
  }

  // Upsert a word progress
  async saveWordProgress(vocabId, progressData) {
    if (!this.isConfigured()) return;
    try {
      const payload = {
        user_id: this.userId,
        vocab_id: vocabId,
        status: progressData.status || 'learning',
        repetition: progressData.repetition || 0,
        ease_factor: progressData.easeFactor || 2.5,
        interval_days: progressData.interval || 0,
        last_reviewed_at: progressData.lastReviewedAt || new Date().toISOString(),
        next_review_at: progressData.nextReviewAt || null
      };

      const { error } = await this.client
        .from('user_vocab_progress')
        .upsert(payload, { onConflict: 'user_id,vocab_id' });

      if (error) console.warn('⚠️ Supabase saveWordProgress error:', error.message);
    } catch (err) {
      console.warn('⚠️ Supabase saveWordProgress exception:', err);
    }
  }

  // Log SRS review event
  async logSRSReview(vocabId, rating, scheduleBefore, scheduleAfter) {
    if (!this.isConfigured()) return;
    try {
      await this.client
        .from('srs_review_logs')
        .insert({
          user_id: this.userId,
          vocab_id: vocabId,
          rating,
          interval_before: scheduleBefore?.interval || 0,
          interval_after: scheduleAfter?.interval || 0,
          ease_factor_before: scheduleBefore?.easeFactor || 2.5,
          ease_factor_after: scheduleAfter?.easeFactor || 2.5,
          reviewed_at: new Date().toISOString()
        });

      // Also increment reviews_count for today's daily activities
      await this.incrementDailyActivity({ reviews_count: 1 });
    } catch (err) {
      console.warn('⚠️ Supabase logSRSReview error:', err);
    }
  }

  // Save Quiz Session and details
  async recordQuizSession(quizSession) {
    if (!this.isConfigured()) return;
    try {
      const { data: sessionRow, error: sessionErr } = await this.client
        .from('quiz_sessions')
        .insert({
          user_id: this.userId,
          session_type: quizSession.type || 'daily_quiz',
          total_questions: quizSession.totalQuestions,
          correct_count: quizSession.correctCount,
          accuracy_percent: quizSession.accuracyPercent,
          duration_seconds: quizSession.durationSeconds || 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionErr) throw sessionErr;

      if (quizSession.details && quizSession.details.length > 0 && sessionRow) {
        const detailsPayload = quizSession.details.map(d => ({
          session_id: sessionRow.id,
          vocab_id: d.vocabId,
          selected_option: d.selectedOption,
          correct_option: d.correctOption,
          is_correct: d.isCorrect,
          created_at: new Date().toISOString()
        }));

        await this.client.from('quiz_details').insert(detailsPayload);
      }

      // Also increment quiz_count in daily_activities
      await this.incrementDailyActivity({ quiz_count: 1 });
    } catch (err) {
      console.warn('⚠️ Supabase recordQuizSession error:', err);
    }
  }

  // Fetch or upsert user stats
  async fetchUserStats() {
    if (!this.isConfigured()) return null;
    try {
      const { data, error } = await this.client
        .from('user_stats')
        .select('*')
        .eq('user_id', this.userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('⚠️ Could not fetch user_stats from Supabase:', err);
      return null;
    }
  }

  async saveUserStats(stats) {
    if (!this.isConfigured()) return;
    try {
      await this.client
        .from('user_stats')
        .upsert({
          user_id: this.userId,
          streak_days: stats.streakDays || 1,
          longest_streak: stats.longestStreak || stats.streakDays || 1,
          last_active_date: stats.lastActiveDate || new Date().toISOString().split('T')[0],
          total_learned: stats.totalLearned || 0,
          total_quiz_attempts: stats.totalQuizAttempts || 0,
          correct_quiz_attempts: stats.correctQuizAttempts || 0,
          quiz_accuracy: stats.quizAccuracy || 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch (err) {
      console.warn('⚠️ Supabase saveUserStats error:', err);
    }
  }

  // Increment today's daily activity
  async incrementDailyActivity(increments = {}) {
    if (!this.isConfigured()) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await this.client
        .from('daily_activities')
        .select('*')
        .eq('user_id', this.userId)
        .eq('activity_date', today)
        .maybeSingle();

      const newWords = (existing?.new_words_count || 0) + (increments.new_words_count || 0);
      const reviews = (existing?.reviews_count || 0) + (increments.reviews_count || 0);
      const quizzes = (existing?.quiz_count || 0) + (increments.quiz_count || 0);

      await this.client
        .from('daily_activities')
        .upsert({
          user_id: this.userId,
          activity_date: today,
          new_words_count: newWords,
          reviews_count: reviews,
          quiz_count: quizzes
        }, { onConflict: 'user_id,activity_date' });
    } catch (err) {
      console.warn('⚠️ Supabase incrementDailyActivity error:', err);
    }
  }

  // Fetch past 7 days activities for stats chart
  async fetchWeeklyHistory() {
    if (!this.isConfigured()) return null;
    try {
      const { data, error } = await this.client
        .from('daily_activities')
        .select('*')
        .eq('user_id', this.userId)
        .order('activity_date', { ascending: false })
        .limit(7);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('⚠️ Could not fetch weekly history from Supabase:', err);
      return null;
    }
  }
}

export const supabaseService = new SupabaseService();
