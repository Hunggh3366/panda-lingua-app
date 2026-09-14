/**
 * Storage Service - Manages hybrid persistence (Supabase Cloud + LocalStorage Offline Cache)
 */
import { HSK_VOCABULARY } from '../data/hsk-vocab.js';
import { supabaseService } from './supabase.js';

const STORAGE_KEYS = {
  PROGRESS: 'panda_lingua_progress',
  STATS: 'panda_lingua_stats',
  SESSION: 'panda_lingua_session',
  LAST_SYNC: 'panda_lingua_last_sync'
};

export const StorageService = {
  // Local in-memory vocab cache (can be enriched from Supabase)
  vocabularies: [...HSK_VOCABULARY],

  // Initialize storage with reasonable initial data if empty
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PROGRESS)) {
      const initialProgress = {};
      
      // Mark first 6 items as already learned/in-progress for realistic initial stats
      this.vocabularies.forEach((item, index) => {
        if (index < 6) {
          initialProgress[item.id] = {
            vocabId: item.id,
            status: 'mastered',
            repetition: 2,
            easeFactor: 2.5,
            interval: 1,
            lastReviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            nextReviewAt: new Date(Date.now() - 3600000).toISOString() // Due for review today!
          };
        } else if (index < 12) {
          initialProgress[item.id] = {
            vocabId: item.id,
            status: 'learning',
            repetition: 1,
            easeFactor: 2.5,
            interval: 1,
            lastReviewedAt: new Date(Date.now() - 86400000).toISOString(),
            nextReviewAt: new Date(Date.now() - 7200000).toISOString() // Due for review today!
          };
        } else {
          initialProgress[item.id] = {
            vocabId: item.id,
            status: 'new',
            repetition: 0,
            easeFactor: 2.5,
            interval: 0,
            lastReviewedAt: null,
            nextReviewAt: null
          };
        }
      });
      this.saveProgress(initialProgress);
    }

    if (!localStorage.getItem(STORAGE_KEYS.STATS)) {
      const initialStats = {
        streakDays: 5,
        lastActiveDate: new Date().toISOString().split('T')[0],
        totalLearned: 12,
        quizAccuracy: 85,
        totalQuizAttempts: 24,
        correctQuizAttempts: 21,
        weeklyHistory: [
          { day: 'T2', count: 18 },
          { day: 'T3', count: 25 },
          { day: 'T4', count: 12 },
          { day: 'T5', count: 32 },
          { day: 'T6', count: 20 },
          { day: 'T7', count: 28 },
          { day: 'CN', count: 35 }
        ]
      };
      this.saveStats(initialStats);
    }

    // Trigger async sync from Supabase if connected
    this.syncFromCloud();
  },

  // Asynchronous sync from Supabase database
  async syncFromCloud() {
    if (!supabaseService.isConfigured()) return false;

    try {
      // 1. Sync Vocabularies if available on Supabase
      const cloudVocabs = await supabaseService.fetchVocabularies();
      if (cloudVocabs && cloudVocabs.length > 0) {
        this.vocabularies = cloudVocabs;
      }

      // 2. Sync Progress
      const cloudProgress = await supabaseService.fetchUserProgress();
      if (cloudProgress && Object.keys(cloudProgress).length > 0) {
        const localProgress = this.getProgress();
        const mergedProgress = { ...localProgress, ...cloudProgress };
        this.saveProgress(mergedProgress);
      }

      // 3. Sync User Stats
      const cloudStats = await supabaseService.fetchUserStats();
      if (cloudStats) {
        const localStats = this.getStats();
        const mergedStats = {
          ...localStats,
          streakDays: cloudStats.streak_days || localStats.streakDays,
          longestStreak: cloudStats.longest_streak || localStats.longestStreak,
          totalLearned: cloudStats.total_learned || localStats.totalLearned,
          totalQuizAttempts: cloudStats.total_quiz_attempts || localStats.totalQuizAttempts,
          correctQuizAttempts: cloudStats.correct_quiz_attempts || localStats.correctQuizAttempts,
          quizAccuracy: cloudStats.quiz_accuracy || localStats.quizAccuracy
        };
        this.saveStats(mergedStats);
      }

      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    } catch (err) {
      console.warn('⚠️ Sync from cloud error:', err);
      return false;
    }
  },

  getVocabularies() {
    return this.vocabularies && this.vocabularies.length > 0 ? this.vocabularies : HSK_VOCABULARY;
  },

  getProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS)) || {};
    } catch {
      return {};
    }
  },

  saveProgress(progress) {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  },

  updateWordProgress(vocabId, updateFn) {
    const progress = this.getProgress();
    const current = progress[vocabId] || {
      vocabId,
      status: 'new',
      repetition: 0,
      easeFactor: 2.5,
      interval: 0,
      lastReviewedAt: null,
      nextReviewAt: null
    };

    const updated = updateFn(current);
    progress[vocabId] = updated;
    this.saveProgress(progress);
    this.recalculateStats();

    // Async sync to Supabase
    supabaseService.saveWordProgress(vocabId, updated);

    return progress[vocabId];
  },

  getStats() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS)) || {
        streakDays: 5,
        totalLearned: 12,
        quizAccuracy: 85,
        weeklyHistory: []
      };
    } catch {
      return { streakDays: 5, totalLearned: 12, quizAccuracy: 85, weeklyHistory: [] };
    }
  },

  saveStats(stats) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    // Async sync to Supabase
    supabaseService.saveUserStats(stats);
  },

  recordQuizResult(isCorrect) {
    const stats = this.getStats();
    stats.totalQuizAttempts = (stats.totalQuizAttempts || 0) + 1;
    if (isCorrect) {
      stats.correctQuizAttempts = (stats.correctQuizAttempts || 0) + 1;
    }
    stats.quizAccuracy = Math.round((stats.correctQuizAttempts / stats.totalQuizAttempts) * 100);
    this.saveStats(stats);
  },

  recordQuizSession(quizSession) {
    supabaseService.recordQuizSession(quizSession);
  },

  logSRSReview(vocabId, rating, scheduleBefore, scheduleAfter) {
    supabaseService.logSRSReview(vocabId, rating, scheduleBefore, scheduleAfter);
  },

  recalculateStats() {
    const progress = this.getProgress();
    const stats = this.getStats();
    const learnedCount = Object.values(progress).filter(p => p.status === 'mastered' || p.status === 'learning').length;
    stats.totalLearned = learnedCount;
    this.saveStats(stats);
  },

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    this.init();
  }
};

