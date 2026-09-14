/**
 * Spaced Repetition System (SRS) Domain Logic
 * Implements SuperMemo SM-2 inspired interval scheduling
 */
import { HSK_VOCABULARY } from '../data/hsk-vocab.js';
import { StorageService } from './storage.js';

export const SRSService = {
  /**
   * Calculate next review schedule based on rating
   * @param {Object} currentProgress 
   * @param {'hard' | 'good' | 'easy'} rating 
   * @returns {Object} updated progress fields
   */
  calculateNextSchedule(currentProgress, rating) {
    let repetition = currentProgress.repetition || 0;
    let easeFactor = currentProgress.easeFactor || 2.5;
    let interval = currentProgress.interval || 0;
    const now = Date.now();

    if (rating === 'hard') {
      // Repeat today
      repetition = 0;
      interval = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 'good') {
      repetition += 1;
      if (repetition === 1) {
        interval = 1;
      } else if (repetition === 2) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    } else if (rating === 'easy') {
      repetition += 1;
      easeFactor += 0.15;
      if (repetition === 1) {
        interval = 3;
      } else if (repetition === 2) {
        interval = 6;
      } else {
        interval = Math.max(3, Math.round(interval * easeFactor * 1.3));
      }
    }

    const nextReviewTimestamp = now + interval * 24 * 60 * 60 * 1000;
    const status = repetition >= 3 ? 'mastered' : 'learning';

    return {
      repetition,
      easeFactor,
      interval,
      status,
      lastReviewedAt: new Date(now).toISOString(),
      nextReviewAt: new Date(nextReviewTimestamp).toISOString()
    };
  },

  /**
   * Process a review response and persist it
   */
  processReview(vocabId, rating) {
    let beforeState = null;
    let afterState = null;

    const res = StorageService.updateWordProgress(vocabId, (current) => {
      beforeState = { ...current };
      const schedule = this.calculateNextSchedule(current, rating);
      afterState = { ...current, ...schedule };
      return afterState;
    });

    if (beforeState && afterState) {
      StorageService.logSRSReview(vocabId, rating, beforeState, afterState);
    }

    return res;
  },

  /**
   * Get all vocabulary items that are due for SRS review today
   */
  getDueReviewItems() {
    const progress = StorageService.getProgress();
    const now = Date.now();
    const vocabs = StorageService.getVocabularies();

    return vocabs.filter(item => {
      const wordProg = progress[item.id];
      if (!wordProg || wordProg.status === 'new') return false;
      if (!wordProg.nextReviewAt) return true;
      return new Date(wordProg.nextReviewAt).getTime() <= now;
    });
  },

  /**
   * Get fresh/new vocabulary items ready for learning
   */
  getNewLearningItems(limit = 10) {
    const progress = StorageService.getProgress();
    const vocabs = StorageService.getVocabularies();

    return vocabs.filter(item => {
      const wordProg = progress[item.id];
      return !wordProg || wordProg.status === 'new';
    }).slice(0, limit);
  },

  /**
   * Mark word as learned during a new learning session
   */
  markAsLearned(vocabId) {
    return StorageService.updateWordProgress(vocabId, (current) => {
      return {
        ...current,
        status: 'learning',
        repetition: 1,
        interval: 1,
        lastReviewedAt: new Date().toISOString(),
        nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    });
  }
};
