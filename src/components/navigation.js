/**
 * Navigation Component — Minimalism & Swiss Design
 * Single-purpose, uncluttered, WCAG compliant
 */
import { SRSService } from '../services/srs.js';
import { supabaseService } from '../services/supabase.js';

export const NavigationComponent = {
  render(currentTab, onNavigate) {
    const dueReviews = SRSService.getDueReviewItems();
    const isConnected = supabaseService.isConfigured();

    return {
      renderHeader() {
        return `
          <!-- Mobile Top App Bar -->
          <header class="md:hidden bg-surface/95 backdrop-blur-md flex justify-between items-center px-4 py-3 w-full sticky top-0 border-b border-line z-40">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-xs tracking-wider">
                PL
              </div>
              <div>
                <h1 class="text-sm font-bold tracking-tight text-txt-main">Panda Lingua</h1>
                <p class="text-[10px] text-txt-muted">HSK 1–2</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-header-supabase" class="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border border-line bg-surface text-txt-secondary hover:border-brand transition-colors cursor-pointer">
                <span class="w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-brand-accent' : 'bg-txt-subtle'}"></span>
                <span>${isConnected ? 'Cloud' : 'Local'}</span>
              </button>
            </div>
          </header>
        `;
      },

      renderSidebar() {
        const tabs = [
          { id: 'overview', label: 'Tổng quan', icon: 'dashboard' },
          { id: 'learn', label: 'Từ mới', icon: 'menu_book' },
          { id: 'quiz', label: 'Luyện tập', icon: 'edit_note' },
          { id: 'srs', label: 'Ôn tập SRS', icon: 'autorenew', badge: dueReviews.length },
          { id: 'stats', label: 'Tiến độ', icon: 'insights' }
        ];

        return `
          <!-- Desktop Side Navigation -->
          <nav class="hidden md:flex flex-col py-6 bg-surface h-screen w-64 border-r border-line flex-shrink-0 sticky top-0 select-none">
            <!-- Brand Mark -->
            <div class="px-5 mb-8 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
                PL
              </div>
              <div>
                <h2 class="text-sm font-bold tracking-tight text-txt-main">Panda Lingua</h2>
                <span class="text-[11px] font-medium text-txt-muted">Lộ trình HSK 1–2</span>
              </div>
            </div>

            <!-- Navigation Links -->
            <ul class="flex flex-col gap-1 px-3">
              ${tabs.map(tab => {
                const isActive = currentTab === tab.id;
                return `
                  <li>
                    <button 
                      data-tab="${tab.id}" 
                      class="nav-tab-btn w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                        isActive 
                          ? 'bg-brand text-white shadow-xs' 
                          : 'text-txt-secondary hover:bg-surface-subtle hover:text-txt-main'
                      }"
                    >
                      <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-lg ${isActive ? 'text-white' : 'text-txt-muted'}">${tab.icon}</span>
                        <span>${tab.label}</span>
                      </div>
                      ${tab.badge ? `
                        <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-surface-muted text-txt-secondary'
                        }">
                          ${tab.badge}
                        </span>
                      ` : ''}
                    </button>
                  </li>
                `;
              }).join('')}
            </ul>

            <!-- Supabase Cloud Connection Status Widget -->
            <div class="mt-auto px-4 flex flex-col gap-3">
              <button id="btn-sidebar-supabase" class="w-full text-left bg-surface-subtle rounded-xl p-3 border border-line hover:border-brand/40 transition-colors cursor-pointer group">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[11px] font-semibold text-txt-main flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-brand-accent' : 'bg-txt-subtle'}"></span>
                    ${isConnected ? 'Supabase Sync' : 'Lưu trữ Local'}
                  </span>
                  <span class="material-symbols-outlined text-xs text-txt-muted group-hover:text-txt-main transition-colors">settings</span>
                </div>
                <p class="text-[10px] text-txt-muted truncate">
                  ${isConnected ? 'Đang tự động đồng bộ' : 'Chạm để cấu hình cloud'}
                </p>
              </button>

              <div class="px-2 text-[10px] text-txt-subtle flex items-center justify-between">
                <span>Vibecode AG4C</span>
                <span>v2.0 Minimal</span>
              </div>
            </div>
          </nav>
        `;
      },

      renderBottomNav() {
        const tabs = [
          { id: 'overview', label: 'Tổng quan', icon: 'dashboard' },
          { id: 'learn', label: 'Từ mới', icon: 'menu_book' },
          { id: 'quiz', label: 'Luyện tập', icon: 'edit_note' },
          { id: 'srs', label: 'Ôn tập', icon: 'autorenew', badge: dueReviews.length },
          { id: 'stats', label: 'Tiến độ', icon: 'insights' }
        ];

        return `
          <!-- Mobile Bottom Navigation Bar -->
          <nav class="md:hidden fixed bottom-0 w-full z-50 bg-surface/95 backdrop-blur-md border-t border-line flex justify-around items-center h-14 px-2 select-none">
            ${tabs.map(tab => {
              const isActive = currentTab === tab.id;
              return `
                <button 
                  data-tab="${tab.id}" 
                  class="nav-tab-btn flex flex-col items-center justify-center flex-1 py-1 transition-colors relative cursor-pointer ${
                    isActive 
                      ? 'text-brand font-semibold' 
                      : 'text-txt-muted hover:text-txt-main'
                  }"
                >
                  <div class="relative flex items-center justify-center">
                    <span class="material-symbols-outlined text-xl">${tab.icon}</span>
                    ${tab.badge ? `
                      <span class="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-0.5 bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        ${tab.badge}
                      </span>
                    ` : ''}
                  </div>
                  <span class="text-[10px] tracking-tight mt-0.5">${tab.label}</span>
                </button>
              `;
            }).join('')}
          </nav>
        `;
      }
    };
  }
};
