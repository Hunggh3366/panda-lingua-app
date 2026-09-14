/**
 * Main Application Orchestrator
 */
import { StorageService } from './services/storage.js';
import { NavigationComponent } from './components/navigation.js';
import { OverviewComponent } from './components/overview.js';
import { LearnComponent } from './components/learn.js';
import { QuizComponent } from './components/quiz.js';
import { SRSReviewComponent } from './components/srs-review.js';
import { StatsComponent } from './components/stats.js';
import { SupabaseModalComponent } from './components/supabase-modal.js';

class App {
  constructor() {
    this.currentTab = 'overview';
    window.openSupabaseModal = () => {
      SupabaseModalComponent.render(() => {
        this.renderLayout();
        this.navigateTo(this.currentTab);
      });
    };
    this.init();
  }

  init() {
    StorageService.init();
    this.renderLayout();
    this.navigateTo(this.currentTab);
  }

  navigateTo(tabId) {
    this.currentTab = tabId;
    this.renderLayout();

    const mainContainer = document.getElementById('main-content-container');
    if (!mainContainer) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (tabId) {
      case 'overview':
        OverviewComponent.render(mainContainer, (nextTab) => this.navigateTo(nextTab));
        break;
      case 'learn':
        LearnComponent.render(mainContainer, (nextTab) => this.navigateTo(nextTab));
        break;
      case 'quiz':
        QuizComponent.render(mainContainer, (nextTab) => this.navigateTo(nextTab));
        break;
      case 'srs':
        SRSReviewComponent.render(mainContainer, (nextTab) => this.navigateTo(nextTab));
        break;
      case 'stats':
        StatsComponent.render(mainContainer, (nextTab) => this.navigateTo(nextTab));
        break;
      default:
        OverviewComponent.render(mainContainer, (nextTab) => this.navigateTo(nextTab));
        break;
    }
  }

  renderLayout() {
    const appRoot = document.getElementById('app');
    if (!appRoot) return;

    const nav = NavigationComponent.render(this.currentTab, (tab) => this.navigateTo(tab));

    // Render structure if not already rendered
    let layoutContainer = document.getElementById('layout-wrapper');
    if (!layoutContainer) {
      appRoot.innerHTML = `
        <div id="layout-wrapper" class="bg-[#FAFAF9] text-[#09090B] min-h-screen flex flex-col md:flex-row pb-20 md:pb-0">
          <div id="sidebar-slot"></div>
          <div class="flex-1 flex flex-col min-h-screen">
            <div id="header-slot"></div>
            <main id="main-content-container" class="flex-1 flex flex-col"></main>
          </div>
          <div id="bottom-nav-slot"></div>
        </div>
      `;
    }

    document.getElementById('sidebar-slot').innerHTML = nav.renderSidebar();
    document.getElementById('header-slot').innerHTML = nav.renderHeader();
    document.getElementById('bottom-nav-slot').innerHTML = nav.renderBottomNav();

    // Bind tab clicks for all navigation items
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          this.navigateTo(tab);
        }
      });
    });

    // Bind Supabase modal buttons
    document.getElementById('btn-header-supabase')?.addEventListener('click', () => {
      window.openSupabaseModal();
    });

    document.getElementById('btn-sidebar-supabase')?.addEventListener('click', () => {
      window.openSupabaseModal();
    });
  }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new App();
});
