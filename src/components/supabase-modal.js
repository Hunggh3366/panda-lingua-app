/**
 * Supabase Configuration Modal Component — Minimalism & Swiss Design
 */
import { supabaseService } from '../services/supabase.js';
import { StorageService } from '../services/storage.js';

export const SupabaseModalComponent = {
  render(onSuccess) {
    const existing = document.getElementById('supabase-modal-backdrop');
    if (existing) existing.remove();

    const config = supabaseService.getConfig();
    const isConfigured = supabaseService.isConfigured();

    const modalEl = document.createElement('div');
    modalEl.id = 'supabase-modal-backdrop';
    modalEl.className = 'fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn';

    modalEl.innerHTML = `
      <div class="bg-surface rounded-2xl border border-line shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-line flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-txt-main">Cấu hình Supabase</h3>
            <p class="text-[11px] text-txt-muted">Đồng bộ đám mây và bảo vệ dữ liệu</p>
          </div>
          <button id="btn-close-modal" class="p-1 rounded-lg text-txt-muted hover:text-txt-main hover:bg-surface-subtle transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 overflow-y-auto space-y-4 flex-1">
          <!-- Connection Status Alert -->
          <div id="modal-conn-alert" class="p-3 rounded-xl border border-line bg-surface-subtle flex items-start gap-2.5 text-xs text-txt-secondary">
            <span class="material-symbols-outlined text-base mt-0.5 text-txt-main">${isConfigured ? 'cloud_done' : 'info'}</span>
            <div>
              <p class="font-semibold text-txt-main">${isConfigured ? 'Đang kích hoạt chế độ Cloud' : 'Chế độ lưu trữ cục bộ (Local Storage)'}</p>
              <p class="text-[11px] text-txt-muted mt-0.5">${isConfigured ? 'Dữ liệu đang được đồng bộ với Supabase.' : 'Nhập Project URL và Anon Key để đồng bộ đa thiết bị.'}</p>
            </div>
          </div>

          <!-- Quick Accordion Guide -->
          <details class="bg-surface-subtle border border-line rounded-xl p-3 text-xs text-txt-main">
            <summary class="font-medium cursor-pointer flex items-center justify-between select-none">
              <span>Hướng dẫn kết nối Supabase</span>
              <span class="material-symbols-outlined text-sm">expand_more</span>
            </summary>
            <ol class="list-decimal list-inside space-y-1 mt-2 text-[11px] text-txt-secondary">
              <li>Mở SQL Editor trên Supabase Dashboard.</li>
              <li>Chạy mã trong file <code class="bg-surface px-1 py-0.5 rounded font-mono border border-line">supabase/schema.sql</code>.</li>
              <li>Chạy file <code class="bg-surface px-1 py-0.5 rounded font-mono border border-line">supabase/seed.sql</code> để tạo từ vựng mẫu.</li>
              <li>Dán <b>Project URL</b> và <b>anon key</b> vào ô bên dưới.</li>
            </ol>
          </details>

          <!-- Input Fields -->
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-txt-main mb-1">Project URL</label>
              <input 
                type="text" 
                id="input-supabase-url" 
                placeholder="https://xyz.supabase.co" 
                value="${config.url || ''}"
                class="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-txt-main focus:outline-none focus:border-brand font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-txt-main mb-1">Anon Public Key</label>
              <input 
                type="password" 
                id="input-supabase-anon-key" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                value="${config.anonKey || ''}"
                class="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-txt-main focus:outline-none focus:border-brand font-mono"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3.5 border-t border-line bg-surface-subtle flex items-center justify-between gap-2">
          <button 
            id="btn-test-connection" 
            class="px-3 py-2 bg-surface border border-line text-txt-main hover:bg-surface-muted text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span class="material-symbols-outlined text-sm">network_check</span>
            <span>Kiểm tra kết nối</span>
          </button>

          <button 
            id="btn-save-sync" 
            class="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Lưu & Đồng bộ</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    const closeModal = () => modalEl.remove();
    modalEl.querySelector('#btn-close-modal')?.addEventListener('click', closeModal);
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal();
    });

    const alertEl = modalEl.querySelector('#modal-conn-alert');
    const urlInput = modalEl.querySelector('#input-supabase-url');
    const keyInput = modalEl.querySelector('#input-supabase-anon-key');

    // Test Connection
    modalEl.querySelector('#btn-test-connection')?.addEventListener('click', async () => {
      const testBtn = modalEl.querySelector('#btn-test-connection');
      const url = urlInput.value.trim();
      const key = keyInput.value.trim();

      if (!url || !key) {
        alertEl.innerHTML = `<span class="material-symbols-outlined text-base mt-0.5 text-rose-600">error</span><div class="text-xs text-rose-600 font-medium">Vui lòng điền đủ Project URL và Anon Key.</div>`;
        return;
      }

      testBtn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">sync</span><span>Đang kiểm tra...</span>`;
      supabaseService.saveCustomConfig(url, key);
      const res = await supabaseService.testConnection();

      if (res.success) {
        alertEl.innerHTML = `<span class="material-symbols-outlined text-base mt-0.5 text-teal-600">check_circle</span><div class="text-xs text-teal-900 font-medium">${res.message}</div>`;
      } else {
        alertEl.innerHTML = `<span class="material-symbols-outlined text-base mt-0.5 text-rose-600">error</span><div class="text-xs text-rose-600 font-medium">${res.message}</div>`;
      }
      testBtn.innerHTML = `<span class="material-symbols-outlined text-sm">network_check</span><span>Kiểm tra kết nối</span>`;
    });

    // Save & Sync
    modalEl.querySelector('#btn-save-sync')?.addEventListener('click', async () => {
      const saveBtn = modalEl.querySelector('#btn-save-sync');
      const url = urlInput.value.trim();
      const key = keyInput.value.trim();

      saveBtn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">sync</span><span>Đang đồng bộ...</span>`;

      supabaseService.saveCustomConfig(url, key);
      if (url && key) {
        await StorageService.syncFromCloud();
      }

      closeModal();
      if (onSuccess) onSuccess();
    });
  }
};
