/**
 * Overview Component — Minimalism & Swiss Design
 * Focused, distraction-free dashboard with 60-30-10 palette
 */
import { StorageService } from '../services/storage.js';
import { SRSService } from '../services/srs.js';

export const OverviewComponent = {
  render(container, onNavigate) {
    const stats = StorageService.getStats();
    const progress = StorageService.getProgress();
    const dueReviews = SRSService.getDueReviewItems();
    const newItems = SRSService.getNewLearningItems(10);
    const vocabs = StorageService.getVocabularies();
    
    // Calculate HSK progress
    const hsk1Items = vocabs.filter(v => v.level === 'HSK1');
    const hsk1Learned = hsk1Items.filter(v => progress[v.id] && progress[v.id].status !== 'new').length;
    const hsk1Percent = hsk1Items.length > 0 ? Math.min(100, Math.round((hsk1Learned / hsk1Items.length) * 100)) : 0;

    const html = `
      <div class="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
        
        <!-- Header & Primary Focus -->
        <section class="bg-surface rounded-2xl p-6 sm:p-8 border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-brand-accent"></span>
              <span class="text-xs font-semibold tracking-wide text-txt-muted uppercase">Lộ trình HSK 1</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-txt-main">
              Hôm nay cần học
            </h1>
            <p class="text-sm text-txt-secondary max-w-md">
              Bạn có <span class="font-semibold text-txt-main">${newItems.length} từ mới</span> và <span class="font-semibold text-txt-main">${dueReviews.length} thẻ đến hạn ôn tập</span>.
            </p>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button id="btn-start-learning" class="flex-1 sm:flex-none px-5 py-2.5 bg-brand hover:bg-brand-hover active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
              <span>Học từ mới</span>
              <span class="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            ${dueReviews.length > 0 ? `
              <button id="btn-quick-srs" class="flex-1 sm:flex-none px-4 py-2.5 bg-surface hover:bg-surface-subtle border border-line text-txt-main text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <span>Ôn tập (${dueReviews.length})</span>
              </button>
            ` : ''}
          </div>
        </section>

        <!-- Metric Indicators Strip (Swiss Typographic Grid) -->
        <section class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-surface rounded-xl p-4 border border-line">
            <span class="text-xs text-txt-muted block mb-1">Chuỗi ngày</span>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-bold tracking-tight text-txt-main">${stats.streakDays}</span>
              <span class="text-xs font-medium text-txt-muted">ngày</span>
            </div>
          </div>

          <div class="bg-surface rounded-xl p-4 border border-line">
            <span class="text-xs text-txt-muted block mb-1">Đã thuộc</span>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-bold tracking-tight text-txt-main">${stats.totalLearned}</span>
              <span class="text-xs font-medium text-txt-muted">từ</span>
            </div>
          </div>

          <div class="bg-surface rounded-xl p-4 border border-line">
            <span class="text-xs text-txt-muted block mb-1">Cần ôn SRS</span>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-bold tracking-tight text-txt-main">${dueReviews.length}</span>
              <span class="text-xs font-medium text-txt-muted">thẻ</span>
            </div>
          </div>

          <div class="bg-surface rounded-xl p-4 border border-line">
            <span class="text-xs text-txt-muted block mb-1">Độ chính xác</span>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-bold tracking-tight text-txt-main">${stats.quizAccuracy || 85}%</span>
              <span class="text-xs font-medium text-brand-accent">trắc nghiệm</span>
            </div>
          </div>
        </section>

        <!-- Core Study Modules -->
        <section class="space-y-3">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-xs font-bold uppercase tracking-wider text-txt-muted">Học phần</h2>
            <span class="text-xs text-txt-secondary">${hsk1Learned}/${hsk1Items.length} từ (${hsk1Percent}%)</span>
          </div>

          <!-- Progress track -->
          <div class="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
            <div class="bg-brand-accent h-1.5 rounded-full transition-all duration-500" style="width: ${Math.max(4, hsk1Percent)}%"></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <!-- Module 1: Learn -->
            <div id="card-module-learn" class="bg-surface rounded-xl p-4 border border-line hover:border-brand/40 transition-all cursor-pointer group">
              <div class="flex items-center justify-between mb-3">
                <span class="w-8 h-8 rounded-lg bg-surface-muted text-txt-main flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                  <span class="material-symbols-outlined text-lg">menu_book</span>
                </span>
                <span class="text-xs font-medium text-txt-muted group-hover:text-txt-main flex items-center gap-0.5">
                  Vào học
                  <span class="material-symbols-outlined text-sm">chevron_right</span>
                </span>
              </div>
              <h3 class="text-sm font-semibold text-txt-main">Học từ mới</h3>
              <p class="text-xs text-txt-secondary mt-0.5">Nạp flashcard chữ Hán, Pinyin và ví dụ ngữ cảnh.</p>
            </div>

            <!-- Module 2: Quiz -->
            <div id="card-module-quiz" class="bg-surface rounded-xl p-4 border border-line hover:border-brand/40 transition-all cursor-pointer group">
              <div class="flex items-center justify-between mb-3">
                <span class="w-8 h-8 rounded-lg bg-surface-muted text-txt-main flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                  <span class="material-symbols-outlined text-lg">edit_note</span>
                </span>
                <span class="text-xs font-medium text-txt-muted group-hover:text-txt-main flex items-center gap-0.5">
                  Luyện tập
                  <span class="material-symbols-outlined text-sm">chevron_right</span>
                </span>
              </div>
              <h3 class="text-sm font-semibold text-txt-main">Luyện trắc nghiệm</h3>
              <p class="text-xs text-txt-secondary mt-0.5">5 câu hỏi kiểm tra phản xạ nhận diện mặt chữ.</p>
            </div>

            <!-- Module 3: SRS Review -->
            <div id="card-module-srs" class="bg-surface rounded-xl p-4 border border-line hover:border-brand/40 transition-all cursor-pointer group">
              <div class="flex items-center justify-between mb-3">
                <span class="w-8 h-8 rounded-lg bg-surface-muted text-txt-main flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                  <span class="material-symbols-outlined text-lg">autorenew</span>
                </span>
                <span class="text-xs font-medium text-txt-muted group-hover:text-txt-main flex items-center gap-0.5">
                  ${dueReviews.length} thẻ
                  <span class="material-symbols-outlined text-sm">chevron_right</span>
                </span>
              </div>
              <h3 class="text-sm font-semibold text-txt-main">Ôn tập SRS</h3>
              <p class="text-xs text-txt-secondary mt-0.5">Thuật toán ngắt quãng giúp chống quên dài hạn.</p>
            </div>
          </div>
        </section>

      </div>
    `;

    container.innerHTML = html;

    // Event handlers
    container.querySelector('#btn-start-learning')?.addEventListener('click', () => onNavigate('learn'));
    container.querySelector('#btn-quick-srs')?.addEventListener('click', () => onNavigate('srs'));
    container.querySelector('#card-module-learn')?.addEventListener('click', () => onNavigate('learn'));
    container.querySelector('#card-module-quiz')?.addEventListener('click', () => onNavigate('quiz'));
    container.querySelector('#card-module-srs')?.addEventListener('click', () => onNavigate('srs'));
  }
};
