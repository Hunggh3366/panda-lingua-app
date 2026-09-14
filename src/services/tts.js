/**
 * Text-to-Speech (TTS) Service & Sound FX for Mandarin Chinese
 * Uses dual-engine: High-Quality Native Audio Endpoint + Web Speech API Fallback
 */

let currentAudio = null;

export const TTSService = {
  /**
   * Speak Chinese text (Hanzi or sentence)
   * @param {string} text Chinese text to speak
   * @param {HTMLElement} [buttonElement] Optional button to show playing animation
   */
  speak(text, buttonElement = null) {
    if (!text) return;

    // Visual feedback on button if provided
    if (buttonElement) {
      buttonElement.classList.add('animate-pulse', 'text-[#4CAF7D]', 'scale-110');
      const icon = buttonElement.querySelector('.material-symbols-outlined');
      if (icon) icon.classList.add('text-[#4CAF7D]');
    }

    const cleanupButton = () => {
      if (buttonElement) {
        buttonElement.classList.remove('animate-pulse', 'text-[#4CAF7D]', 'scale-110');
        const icon = buttonElement.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.remove('text-[#4CAF7D]');
      }
    };

    // Stop any existing playing audio
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Primary Engine: Native Chinese Audio Stream
    const encoded = encodeURIComponent(text.trim());
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encoded}&le=zh`;
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    audio.onended = () => {
      cleanupButton();
      currentAudio = null;
    };

    audio.onerror = () => {
      // Fallback 1: Google TTS
      const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encoded}`;
      const fallbackAudio = new Audio(fallbackUrl);
      currentAudio = fallbackAudio;

      fallbackAudio.onended = () => {
        cleanupButton();
        currentAudio = null;
      };

      fallbackAudio.onerror = () => {
        // Fallback 2: Web Speech Synthesis API
        this.speakWithWebSpeech(text, cleanupButton);
      };

      fallbackAudio.play().catch(() => {
        this.speakWithWebSpeech(text, cleanupButton);
      });
    };

    audio.play().catch(() => {
      // Autoplay or network block fallback
      this.speakWithWebSpeech(text, cleanupButton);
    });
  },

  /**
   * Fallback using browser's Web Speech API
   */
  speakWithWebSpeech(text, onComplete) {
    if (!('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.startsWith('zh') || v.lang === 'zh-CN' || v.lang === 'cmn-Hans-CN');
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    utterance.onend = () => {
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(utterance);
  }
};

/**
 * Sound FX Synthesizer using Web Audio API for UI feedback (Correct / Wrong)
 */
export const SoundFX = {
  ctx: null,

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  },

  playTone(freq, type, duration, delay = 0) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {}
  },

  correct() {
    // Chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
    this.playTone(523.25, 'sine', 0.15, 0);
    this.playTone(659.25, 'sine', 0.15, 0.08);
    this.playTone(783.99, 'sine', 0.25, 0.16);
  },

  wrong() {
    // Boop: G3 (196Hz) -> Eb3 (155Hz)
    this.playTone(196.00, 'triangle', 0.18, 0);
    this.playTone(155.56, 'triangle', 0.25, 0.12);
  }
};
