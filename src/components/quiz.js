/**
 * Quiz Component — Minimalism & Swiss Design
 * Distraction-free multiple choice questions with subtle feedback
 */
import { StorageService } from '../services/storage.js';
import { TTSService, SoundFX } from '../services/tts.js';

export const QuizComponent = {
  questions: [],
  currentIndex: 0,
  score: 0,
  selectedAnswer: null,
  isAnswered: false,
  sessionDetails: [],
  startTime: null,

  generateQuestions(count = 5) {
    const vocabList = StorageService.getVocabularies();
    const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    return selected.map(item => {
      const distractors = vocabList
        .filter(v => v.id !== item.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(v => v.meaning);

      const options = [...distractors, item.meaning].sort(() => 0.5 - Math.random());

      return {
        item,
        correctMeaning: item.meaning,
        options
      };
    });
  },

  render(container, onNavigate) {
    this.questions = this.generateQuestions(5);
    this.currentIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.isAnswered = false;
    this.sessionDetails = [];
    this.startTime = Date.now();

    this.renderQuestion(container, onNavigate);
  },

  renderQuestion(container, onNavigate) {
    if (this.currentIndex >= this.questions.length) {
      this.renderSummary(container, onNavigate);
      return;
    }

    const currentQ = this.questions[this.currentIndex];
    const total = this.questions.length;
    const qNum = this.currentIndex + 1;
    const progressPercent = Math.round((qNum / total) * 100);

    const html = `
      <div class="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-4 py-4 sm:py-6 animate-fadeIn min-h-[calc(100vh-120px)]">
        <!-- Header & Progress -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <button id="btn-quiz-back" class="p-2 -ml-2 rounded-lg text-txt-secondary hover:text-txt-main hover:bg-surface transition-colors cursor-pointer" title="Hủy bài kiểm tra">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
            <div class="text-center">
              <span class="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">${currentQ.item.level}</span>
              <h2 class="text-xs font-bold text-txt-main">Luyện trắc nghiệm</h2>
            </div>
            <div class="w-8"></div>
          </div>

          <!-- Progress -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px] text-txt-muted">
              <span>Câu hỏi ${qNum} / ${total}</span>
              <span class="font-medium text-txt-main">Điểm: ${this.score}</span>
            </div>
            <div class="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
              <div class="bg-brand h-1.5 rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
            </div>
          </div>

          <!-- Prompt Card -->
          <div class="bg-surface rounded-2xl border border-line p-6 sm:p-8 flex flex-col items-center text-center space-y-2">
            <span class="text-sm font-mono text-txt-secondary">${currentQ.item.pinyin}</span>
            <div class="flex items-center justify-center gap-3">
              <h1 class="text-5xl sm:text-6xl font-semibold tracking-tight text-txt-main font-hanzi">
                ${currentQ.item.hanzi}
              </h1>
              <button id="btn-quiz-prompt-audio" class="p-2 rounded-full border border-line text-txt-main hover:border-brand hover:bg-surface-subtle transition-colors cursor-pointer" title="Phát âm">
                <span class="material-symbols-outlined text-base">volume_up</span>
              </button>
            </div>
            <p class="text-xs text-txt-muted pt-1">Chọn nghĩa tiếng Việt chính xác</p>
          </div>

          <!-- Options List -->
          <div class="space-y-2" id="quiz-options-list">
            ${currentQ.options.map((opt) => `
              <button 
                data-option="${opt}"
                class="quiz-option-btn w-full bg-surface border border-line rounded-xl p-3.5 text-left flex justify-between items-center text-xs font-medium text-txt-main hover:border-txt-main hover:bg-surface-subtle transition-all cursor-pointer select-none"
              >
                <span>${opt}</span>
                <span class="option-icon material-symbols-outlined text-base opacity-0">check</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Footer Action -->
        <div class="pt-4 pb-2">
          <button 
            id="btn-quiz-next" 
            class="w-full py-3 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-xs ${this.isAnswered ? '' : 'hidden'}"
          >
            <span>${qNum === total ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
            <span class="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    const promptAudioBtn = container.querySelector('#btn-quiz-prompt-audio');
    promptAudioBtn?.addEventListener('click', () => {
      TTSService.speak(currentQ.item.hanzi, promptAudioBtn);
    });

    container.querySelector('#btn-quiz-back')?.addEventListener('click', () => {
      onNavigate('overview');
    });

    const optionButtons = container.querySelectorAll('.quiz-option-btn');
    optionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isAnswered) return;
        this.isAnswered = true;

        const chosen = btn.getAttribute('data-option');
        const isCorrect = chosen === currentQ.correctMeaning;

        if (isCorrect) {
          this.score++;
          SoundFX.correct();
          btn.classList.remove('border-line', 'bg-surface');
          btn.classList.add('bg-teal-50', 'border-brand-accent', 'text-teal-950', 'font-semibold');
          const icon = btn.querySelector('.option-icon');
          icon.innerText = 'check';
          icon.classList.remove('opacity-0');
          icon.classList.add('text-brand-accent', 'opacity-100');
        } else {
          SoundFX.wrong();
          btn.classList.remove('border-line', 'bg-surface');
          btn.classList.add('bg-rose-50', 'border-rose-400', 'text-rose-950', 'font-semibold');
          const icon = btn.querySelector('.option-icon');
          icon.innerText = 'close';
          icon.classList.remove('opacity-0');
          icon.classList.add('text-rose-600', 'opacity-100');

          // Highlight the right option cleanly
          optionButtons.forEach(otherBtn => {
            if (otherBtn.getAttribute('data-option') === currentQ.correctMeaning) {
              otherBtn.classList.remove('border-line', 'bg-surface');
              otherBtn.classList.add('bg-teal-50/60', 'border-brand-accent', 'text-teal-950');
              const correctIcon = otherBtn.querySelector('.option-icon');
              correctIcon.innerText = 'check';
              correctIcon.classList.remove('opacity-0');
              correctIcon.classList.add('text-brand-accent', 'opacity-100');
            }
          });
        }

        StorageService.recordQuizResult(isCorrect);
        this.sessionDetails.push({
          vocabId: currentQ.item.id,
          selectedOption: chosen,
          correctOption: currentQ.correctMeaning,
          isCorrect
        });

        const nextBtn = container.querySelector('#btn-quiz-next');
        if (nextBtn) {
          nextBtn.classList.remove('hidden');
          nextBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    container.querySelector('#btn-quiz-next')?.addEventListener('click', () => {
      this.currentIndex++;
      this.isAnswered = false;
      this.renderQuestion(container, onNavigate);
    });
  },

  renderSummary(container, onNavigate) {
    const total = this.questions.length;
    const percent = Math.round((this.score / total) * 100);
    const durationSeconds = this.startTime ? Math.round((Date.now() - this.startTime) / 1000) : 0;

    StorageService.recordQuizSession({
      type: 'daily_quiz',
      totalQuestions: total,
      correctCount: this.score,
      accuracyPercent: percent,
      durationSeconds,
      details: this.sessionDetails
    });

    const html = `
      <div class="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto animate-fadeIn min-h-[70vh]">
        <div class="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center mb-4 shadow-xs">
          <span class="material-symbols-outlined text-2xl text-brand-accent">task_alt</span>
        </div>

        <h2 class="text-xl font-bold tracking-tight text-txt-main mb-1">Kết quả kiểm tra</h2>
        <p class="text-xs text-txt-secondary mb-6">Bạn hoàn thành ${total} câu hỏi trong ${durationSeconds} giây.</p>

        <!-- Metrics Box -->
        <div class="w-full bg-surface border border-line rounded-2xl p-4 mb-6 grid grid-cols-2 divide-x divide-line">
          <div class="text-center px-2">
            <span class="text-[10px] text-txt-muted uppercase font-semibold block mb-1">Chính xác</span>
            <div class="text-2xl font-bold text-txt-main">${percent}%</div>
          </div>
          <div class="text-center px-2">
            <span class="text-[10px] text-txt-muted uppercase font-semibold block mb-1">Số câu đúng</span>
            <div class="text-2xl font-bold text-txt-main">${this.score}/${total}</div>
          </div>
        </div>

        <div class="w-full space-y-2.5">
          <button id="btn-goto-srs" class="w-full py-3 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs">
            Tiếp tục: Ôn tập SRS
          </button>
          <button id="btn-quiz-retry" class="w-full py-2.5 bg-surface border border-line text-txt-main text-xs font-medium rounded-xl hover:bg-surface-subtle transition-colors cursor-pointer">
            Luyện tập lại
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    container.querySelector('#btn-goto-srs')?.addEventListener('click', () => onNavigate('srs'));
    container.querySelector('#btn-quiz-retry')?.addEventListener('click', () => this.render(container, onNavigate));
  }
};
