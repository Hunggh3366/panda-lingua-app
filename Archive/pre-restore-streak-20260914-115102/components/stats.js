/**
 * Stats Component — Minimalism & Swiss Design
 * Linear/Stripe inspired analytics dashboard
 */
import { StorageService } from '../services/storage.js';
import { supabaseService } from '../services/supabase.js';

export const StatsComponent = {
  render(container, onNavigate) {
    const stats = StorageService.getStats();
    const progress = StorageService.getProgress();
    const vocabs = StorageService.getVocabularies();

    const hsk1Items = vocabs.filter(v => v.level === 'HSK1');
    const hsk1Learned = hsk1Items.filter(v => progress[v.id] && progress[v.id].status !== 'new').length;
    const hsk1Percent = hsk1Items.length > 0 ? Math.min(100, Math.round((hsk1Learned / hsk1Items.length) * 100)) : 0;

    const hsk2Items = vocabs.filter(v => v.level === 'HSK2');
    const hsk2Learned = hsk2Items.filter(v => progress[v.id] && progress[v.id].status !== 'new').length;
    const hsk2Percent = hsk2Items.length > 0 ? Math.min(100, Math.round((hsk2Learned / hsk2Items.length) * 100)) : 0;

    const isConnected = supabaseService.isConfigured();
    const lastSyncTime = localStorage.getItem('panda_lingua_last_sync');
    const lastSyncDisplay = lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa đồng bộ';

    const weekly = stats.weeklyHistory || [
      { day: 'T2', count: 18 },
      { day: 'T3', count: 25 },
      { day: 'T4', count: 12 },
      { day: 'T5', count: 32 },
      { day: 'T6', count: 20 },
      { day: 'T7', count: 28 },
      { day: 'CN', count: 35 }
    ];

    const maxCount = Math.max(...weekly.map(w => w.count), 40);

    const html = `
      <div class="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-txt-main">Tiến độ học tập</h1>
            <p class="text-xs sm:text-sm text-txt-secondary mt-0.5">Dữ liệu tổng hợp từ các phiên học và bài kiểm tra.</p>
          </div>
        </div>

        <!-- Metrics Strip -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="bg-surface border border-line rounded-2xl p-5">
            <span class="text-xs text-txt-muted block mb-1">Từ vựng đã thuộc</span>
            <div class="text-3xl font-bold tracking-tight text-txt-main">${stats.totalLearned}</div>
            <span class="text-[11px] text-txt-muted mt-1 block">Trên tổng số 300 từ HSK 1–2</span>
          </div>

          <div class="bg-surface border border-line rounded-2xl p-5">
            <span class="text-xs text-txt-muted block mb-1">Chuỗi ngày liên tiếp</span>
            <div class="text-3xl font-bold tracking-tight text-txt-main">${stats.streakDays}</div>
            <span class="text-[11px] text-txt-muted mt-1 block">Duy trì học tập mỗi ngày</span>
          </div>

          <div class="bg-surface border border-line rounded-2xl p-5">
            <span class="text-xs text-txt-muted block mb-1">Độ chính xác trắc nghiệm</span>
            <div class="text-3xl font-bold tracking-tight text-txt-main">${stats.quizAccuracy || 85}%</div>
            <span class="text-[11px] text-brand-accent mt-1 block">Hiệu suất ghi nhớ cao</span>
          </div>
        </div>

        <!-- Weekly Activity Chart -->
        <div class="bg-surface border border-line rounded-2xl p-5 sm:p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-bold text-txt-main">Lượt ôn tập 7 ngày qua</h2>
              <p class="text-xs text-txt-muted">Số lượt trả lời thẻ thành công mỗi ngày</p>
            </div>
            <span class="text-xs font-medium text-txt-muted">
              Tổng: ${weekly.reduce((acc, curr) => acc + curr.count, 0)} lượt
            </span>
          </div>

          <!-- Chart bars -->
          <div class="flex items-end justify-between h-40 gap-2 sm:gap-4 pt-6 select-none">
            ${weekly.map((w, idx) => {
              const heightPercent = Math.round((w.count / maxCount) * 100);
              const isToday = idx === weekly.length - 1;
              return `
                <div class="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                  <div class="w-full bg-surface-muted rounded-t-md relative h-full flex items-end overflow-hidden">
                    <div 
                      class="w-full ${isToday ? 'bg-brand' : 'bg-txt-secondary/40 group-hover:bg-txt-secondary'} rounded-t-md transition-all duration-500 relative" 
                      style="height: ${heightPercent}%"
                    >
                      <div class="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-txt-muted opacity-0 group-hover:opacity-100 transition-opacity">
                        ${w.count}
                      </div>
                    </div>
                  </div>
                  <span class="text-[11px] ${isToday ? 'font-bold text-txt-main' : 'text-txt-muted'}">${w.day}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Level Breakdown -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="bg-surface border border-line rounded-2xl p-5 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-txt-main">Cấp độ HSK 1</span>
              <span class="text-txt-muted">${hsk1Learned}/${hsk1Items.length} từ (${hsk1Percent}%)</span>
            </div>
            <div class="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
              <div class="bg-brand h-1.5 rounded-full transition-all duration-500" style="width: ${hsk1Percent}%"></div>
            </div>
          </div>

          <div class="bg-surface border border-line rounded-2xl p-5 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-txt-main">Cấp độ HSK 2</span>
              <span class="text-txt-muted">${hsk2Learned}/${hsk2Items.length} từ (${hsk2Percent}%)</span>
            </div>
            <div class="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
              <div class="bg-brand-accent h-1.5 rounded-full transition-all duration-500" style="width: ${hsk2Percent}%"></div>
            </div>
          </div>
        </div>

        <!-- Cloud Sync & Data Management -->
        <div class="bg-surface border border-line rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center text-txt-main">
              <span class="material-symbols-outlined text-lg">${isConnected ? 'cloud_done' : 'cloud_off'}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-txt-main">Đồng bộ Supabase</span>
                <span class="text-[10px] font-medium px-2 py-0.5 rounded-full ${isConnected ? 'bg-teal-50 text-teal-900' : 'bg-surface-muted text-txt-secondary'}">
                  ${isConnected ? 'Cloud Active' : 'Local Storage'}
                </span>
              </div>
              <p class="text-[11px] text-txt-muted mt-0.5">Lần đồng bộ gần nhất: ${lastSyncDisplay}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-sync-now" class="px-3.5 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
              <span class="material-symbols-outlined text-sm">sync</span>
              <span>Đồng bộ ngay</span>
            </button>
            <button id="btn-open-supabase-config" class="px-3 py-2 bg-surface border border-line hover:border-brand text-txt-main text-xs font-medium rounded-xl transition-colors cursor-pointer">
              Cấu hình
            </button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="flex items-center justify-between px-2 text-[11px] text-txt-muted">
          <span>Dữ liệu được lưu an toàn tại máy cục bộ & Supabase.</span>
          <button id="btn-reset-data" class="text-rose-600 hover:text-rose-700 hover:underline cursor-pointer font-medium">
            Đặt lại dữ liệu mẫu
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    container.querySelector('#btn-sync-now')?.addEventListener('click', async () => {
      const syncBtn = container.querySelector('#btn-sync-now');
      if (syncBtn) {
        syncBtn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">sync</span><span>Đang đồng bộ...</span>`;
      }
      await StorageService.syncFromCloud();
      setTimeout(() => {
        this.render(container, onNavigate);
      }, 400);
    });

    container.querySelector('#btn-open-supabase-config')?.addEventListener('click', () => {
      window.openSupabaseModal && window.openSupabaseModal();
    });

    container.querySelector('#btn-reset-data')?.addEventListener('click', () => {
      if (confirm("Bạn có chắc chắn muốn đặt lại dữ liệu học tập về ban đầu?")) {
        StorageService.resetAllData();
        this.render(container, onNavigate);
      }
    });
  }
};
