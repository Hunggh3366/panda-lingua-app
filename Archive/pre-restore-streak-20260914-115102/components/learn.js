/**
 * Learn Component — Minimalism & Swiss Design
 * Focus mode: Clean typographic flashcard, distraction-free pronunciation
 */
import { SRSService } from '../services/srs.js';
import { TTSService } from '../services/tts.js';

export const LearnComponent = {
  currentIndex: 0,
  sessionItems: [],

  render(container, onNavigate) {
    this.sessionItems = SRSService.getNewLearningItems(8);
    
    // If no new words, take a subset of review items for practice
    if (this.sessionItems.length === 0) {
      this.sessionItems = SRSService.getDueReviewItems().slice(0, 8);
    }
    
    if (this.sessionItems.length === 0) {
      // Empty state
      container.innerHTML = `
        <div class="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto animate-fadeIn min-h-[60vh]">
          <div class="w-12 h-12 rounded-full bg-surface-muted text-txt-main flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-2xl">check</span>
          </div>
          <h2 class="text-lg font-bold text-txt-main mb-1">Đã hoàn thành bài học</h2>
          <p class="text-xs text-txt-secondary mb-6">Bạn đã học hết toàn bộ từ mới của đợt này. Hãy chuyển sang làm bài kiểm tra hoặc ôn tập SRS.</p>
          <button id="btn-goto-quiz" class="w-full py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer">
            Luyện trắc nghiệm ngay
          </button>
        </div>
      `;
      container.querySelector('#btn-goto-quiz')?.addEventListener('click', () => onNavigate('quiz'));
      return;
    }

    this.currentIndex = 0;
    this.renderCard(container, onNavigate);
  },

  renderCard(container, onNavigate) {
    const item = this.sessionItems[this.currentIndex];
    const total = this.sessionItems.length;
    const currentNum = this.currentIndex + 1;
    const progressPercent = Math.round((currentNum / total) * 100);

    const html = `
      <div class="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-4 py-4 sm:py-6 animate-fadeIn min-h-[calc(100vh-120px)]">
        <!-- Top Controls & Progress -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <button id="btn-learn-back" class="p-2 -ml-2 rounded-lg text-txt-secondary hover:text-txt-main hover:bg-surface transition-colors cursor-pointer" title="Quay lại">
              <span class="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div class="text-center">
              <span class="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">${item.level}</span>
              <h2 class="text-xs font-bold text-txt-main">Học từ mới</h2>
            </div>
            <div class="w-8"></div>
          </div>

          <!-- Progress track -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px] text-txt-muted">
              <span>Từ ${currentNum} / ${total}</span>
              <span>${progressPercent}%</span>
            </div>
            <div class="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
              <div class="bg-brand h-1.5 rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
            </div>
          </div>

          <!-- Minimal Flashcard -->
          <div class="bg-surface rounded-2xl border border-line p-6 sm:p-8 space-y-6">
            <!-- Hanzi & Pinyin Focus -->
            <div class="flex flex-col items-center text-center space-y-2 py-4">
              <span class="text-base font-mono text-txt-secondary tracking-wide">${item.pinyin}</span>
              <h1 class="text-6xl sm:text-7xl font-semibold tracking-tight text-txt-main font-hanzi">
                ${item.hanzi}
              </h1>
              <button id="btn-play-word-audio" class="mt-2 w-10 h-10 rounded-full border border-line hover:border-brand flex items-center justify-center text-txt-main hover:bg-surface-subtle transition-all cursor-pointer shadow-xs active:scale-95" title="Nghe phát âm">
                <span class="material-symbols-outlined text-xl">volume_up</span>
              </button>
            </div>

            <!-- Meaning & Sentence Context -->
            <div class="space-y-3 pt-2 border-t border-line">
              <div class="bg-surface-subtle p-3.5 rounded-xl border border-line">
                <span class="text-[10px] font-semibold text-txt-muted uppercase tracking-wider block mb-0.5">Nghĩa tiếng Việt</span>
                <p class="text-sm font-semibold text-txt-main">${item.meaning}</p>
              </div>

              <div class="bg-surface-subtle p-3.5 rounded-xl border border-line space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">Ví dụ mẫu</span>
                  <button id="btn-play-example-audio" class="p-1 rounded text-txt-muted hover:text-txt-main transition-colors cursor-pointer" title="Nghe ví dụ">
                    <span class="material-symbols-outlined text-sm">volume_up</span>
                  </button>
                </div>
                <p class="text-sm font-medium text-txt-main font-hanzi">${item.example.hanzi}</p>
                <p class="text-xs text-txt-muted font-mono">${item.example.pinyin}</p>
                <p class="text-xs text-txt-secondary pt-0.5">${item.example.meaning}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="pt-4 pb-2">
          <button id="btn-learn-next" class="w-full py-3 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-xs">
            <span>${currentNum === total ? 'Hoàn thành & Kiểm tra ngay' : 'Từ tiếp theo'}</span>
            <span class="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    const playWordBtn = container.querySelector('#btn-play-word-audio');
    const playExampleBtn = container.querySelector('#btn-play-example-audio');

    // Auto-pronounce gently on load
    setTimeout(() => {
      TTSService.speak(item.hanzi, playWordBtn);
    }, 300);

    playWordBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      TTSService.speak(item.hanzi, playWordBtn);
    });

    playExampleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      TTSService.speak(item.example.hanzi, playExampleBtn);
    });

    container.querySelector('#btn-learn-back')?.addEventListener('click', () => {
      onNavigate('overview');
    });

    container.querySelector('#btn-learn-next')?.addEventListener('click', () => {
      SRSService.markAsLearned(item.id);

      if (this.currentIndex < this.sessionItems.length - 1) {
        this.currentIndex++;
        this.renderCard(container, onNavigate);
      } else {
        onNavigate('quiz');
      }
    });
  }
};
