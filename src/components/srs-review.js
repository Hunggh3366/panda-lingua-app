/**
 * SRS Review Component — Minimalism & Swiss Design
 * Distraction-free 3D flipcard for spaced repetition
 */
import { SRSService } from '../services/srs.js';
import { TTSService } from '../services/tts.js';
import { StorageService } from '../services/storage.js';

export const SRSReviewComponent = {
  reviewItems: [],
  currentIndex: 0,
  isFlipped: false,

  render(container, onNavigate) {
    this.reviewItems = SRSService.getDueReviewItems();

    // If no due reviews, pick a sample set of learned words for demonstration
    if (this.reviewItems.length === 0) {
      this.reviewItems = StorageService.getVocabularies().slice(0, 6);
    }

    this.currentIndex = 0;
    this.isFlipped = false;
    this.renderCard(container, onNavigate);
  },

  renderCard(container, onNavigate) {
    if (this.currentIndex >= this.reviewItems.length) {
      this.renderCompleted(container, onNavigate);
      return;
    }

    const item = this.reviewItems[this.currentIndex];
    const total = this.reviewItems.length;
    const currentNum = this.currentIndex + 1;
    const progressPercent = Math.round((currentNum / total) * 100);

    const html = `
      <div class="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-4 py-4 sm:py-6 animate-fadeIn min-h-[calc(100vh-120px)]">
        <div class="space-y-4">
          <!-- Header Area -->
          <div class="flex items-center justify-between">
            <button id="btn-srs-back" class="p-2 -ml-2 rounded-lg text-txt-secondary hover:text-txt-main hover:bg-surface transition-colors cursor-pointer" title="Quay lại">
              <span class="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div class="text-center">
              <span class="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">${item.level}</span>
              <h2 class="text-xs font-bold text-txt-main">Ôn tập định kỳ SRS</h2>
            </div>
            <div class="w-8"></div>
          </div>

          <!-- Progress track -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px] text-txt-muted">
              <span>Thẻ ${currentNum} / ${total}</span>
              <span>${progressPercent}%</span>
            </div>
            <div class="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
              <div class="bg-brand h-1.5 rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
            </div>
          </div>

          <p id="srs-hint-text" class="text-center text-xs text-txt-muted">
            ${this.isFlipped ? 'Đánh giá mức độ nhớ của bạn bên dưới' : 'Chạm thẻ để lật xem đáp án'}
          </p>

          <!-- 3D Flip Card Container -->
          <div class="perspective-1000 w-full aspect-[4/3] sm:aspect-square relative cursor-pointer select-none" id="srs-card-interactive">
            <div id="srs-flip-inner" class="srs-card-flip w-full h-full rounded-2xl border border-line ${this.isFlipped ? 'flipped' : ''}">
              
              <!-- Front Face (Hanzi) -->
              <div class="srs-card-front bg-surface rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
                <span class="text-[10px] font-semibold text-txt-muted uppercase tracking-wider mb-4">Chữ Hán</span>
                <h1 class="text-6xl sm:text-7xl font-semibold tracking-tight text-txt-main font-hanzi">
                  ${item.hanzi}
                </h1>
                <div class="mt-8 flex items-center gap-1.5 text-txt-muted text-xs">
                  <span class="material-symbols-outlined text-sm">touch_app</span>
                  <span>Chạm để lật</span>
                </div>
              </div>

              <!-- Back Face (Answer) -->
              <div class="srs-card-back bg-surface border-2 border-brand rounded-2xl p-6 flex flex-col items-center justify-between text-center shadow-xs">
                <div class="space-y-1">
                  <h2 class="text-4xl sm:text-5xl font-semibold text-txt-main font-hanzi">${item.hanzi}</h2>
                  <span class="text-lg font-mono text-txt-secondary block">${item.pinyin}</span>
                </div>

                <div class="w-full py-2.5 px-4 bg-surface-subtle border border-line rounded-xl">
                  <span class="text-[10px] text-txt-muted uppercase font-semibold block">Nghĩa tiếng Việt</span>
                  <p class="text-sm font-semibold text-txt-main mt-0.5">${item.meaning}</p>
                </div>

                <button id="btn-srs-audio" class="flex items-center gap-1.5 px-4 py-2 rounded-full border border-line hover:border-brand bg-surface text-txt-main text-xs font-medium transition-colors cursor-pointer" onclick="event.stopPropagation();">
                  <span class="material-symbols-outlined text-sm">volume_up</span>
                  <span>Phát âm</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- Rating Buttons (Hard / Good / Easy) -->
        <div class="pt-4 pb-2 space-y-3">
          <div class="grid grid-cols-3 gap-2">
            <!-- Hard -->
            <button id="btn-rate-hard" class="flex flex-col items-center justify-center py-2.5 px-2 bg-surface border border-line hover:border-rose-300 text-txt-main hover:bg-rose-50/40 rounded-xl transition-all cursor-pointer">
              <span class="text-xs font-semibold">Khó</span>
              <span class="text-[10px] text-txt-muted mt-0.5">Lặp lại</span>
            </button>

            <!-- Good -->
            <button id="btn-rate-good" class="flex flex-col items-center justify-center py-2.5 px-2 bg-surface border border-line hover:border-txt-main text-txt-main hover:bg-surface-subtle rounded-xl transition-all cursor-pointer">
              <span class="text-xs font-semibold">Vừa</span>
              <span class="text-[10px] text-txt-muted mt-0.5">+1 ngày</span>
            </button>

            <!-- Easy -->
            <button id="btn-rate-easy" class="flex flex-col items-center justify-center py-2.5 px-2 bg-brand text-white hover:bg-brand-hover rounded-xl transition-all cursor-pointer shadow-xs">
              <span class="text-xs font-semibold">Dễ</span>
              <span class="text-[10px] text-white/80 mt-0.5">+3 ngày</span>
            </button>
          </div>

          <p class="text-center text-[11px] text-txt-muted">
            Ôn ngắt quãng theo thuật toán Ebbinghaus.
          </p>
        </div>
      </div>
    `;

    container.innerHTML = html;

    const cardEl = container.querySelector('#srs-card-interactive');
    const flipInner = container.querySelector('#srs-flip-inner');
    const hintText = container.querySelector('#srs-hint-text');
    const srsAudioBtn = container.querySelector('#btn-srs-audio');

    cardEl?.addEventListener('click', () => {
      this.isFlipped = !this.isFlipped;
      if (this.isFlipped) {
        flipInner?.classList.add('flipped');
        if (hintText) hintText.innerHTML = 'Đánh giá mức độ nhớ của bạn bên dưới';
        TTSService.speak(item.hanzi, srsAudioBtn);
      } else {
        flipInner?.classList.remove('flipped');
        if (hintText) hintText.innerHTML = 'Chạm thẻ để lật xem đáp án';
      }
    });

    srsAudioBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      TTSService.speak(item.hanzi, srsAudioBtn);
    });

    container.querySelector('#btn-srs-back')?.addEventListener('click', () => {
      onNavigate('overview');
    });

    const handleRating = (rating) => {
      SRSService.processReview(item.id, rating);
      this.currentIndex++;
      this.isFlipped = false;
      this.renderCard(container, onNavigate);
    };

    container.querySelector('#btn-rate-hard')?.addEventListener('click', () => handleRating('hard'));
    container.querySelector('#btn-rate-good')?.addEventListener('click', () => handleRating('good'));
    container.querySelector('#btn-rate-easy')?.addEventListener('click', () => handleRating('easy'));
  },

  renderCompleted(container, onNavigate) {
    const html = `
      <div class="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto animate-fadeIn min-h-[70vh]">
        <div class="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center mb-4 shadow-xs">
          <span class="material-symbols-outlined text-2xl text-brand-accent">done_all</span>
        </div>

        <h2 class="text-xl font-bold tracking-tight text-txt-main mb-1">Hoàn thành phiên ôn tập</h2>
        <p class="text-xs text-txt-secondary mb-6">Bạn đã ôn tập toàn bộ các thẻ đến hạn hôm nay. Bộ nhớ dài hạn đã được củng cố.</p>

        <div class="w-full space-y-2.5">
          <button id="btn-goto-stats" class="w-full py-3 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs">
            Xem biểu đồ tiến độ
          </button>
          <button id="btn-srs-home" class="w-full py-2.5 bg-surface border border-line text-txt-main text-xs font-medium rounded-xl hover:bg-surface-subtle transition-colors cursor-pointer">
            Về trang chủ
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    container.querySelector('#btn-goto-stats')?.addEventListener('click', () => onNavigate('stats'));
    container.querySelector('#btn-srs-home')?.addEventListener('click', () => onNavigate('overview'));
  }
};
