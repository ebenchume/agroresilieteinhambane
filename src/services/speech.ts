/**
 * AgroResiliente Inhambane - Speech Synthesis Service
 * Provides natural Portuguese voice readout for smallholder farmers (accessibility).
 */

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState = false;
  private listeners: Set<(isSpeaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isAvailable(): boolean {
    return this.synth !== null;
  }

  public subscribe(listener: (isSpeaking: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isSpeakingState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(isSpeaking: boolean) {
    this.isSpeakingState = isSpeaking;
    this.listeners.forEach((l) => l(isSpeaking));
  }

  public speak(text: string, onEnd?: () => void): void {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Stop any ongoing speech
    this.stop();

    // Clean markdown/bullet points for smooth spoken speech
    const cleanText = text
      .replace(/[#*_`~>-]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-PT'; // Portuguese dialect
    utterance.rate = 0.95; // slightly slower for rural clarity
    utterance.pitch = 1.0;

    // Pick a Portuguese voice if available
    const voices = this.synth.getVoices();
    const ptVoice = voices.find(
      (v) => v.lang.startsWith('pt') || v.lang.includes('Portuguese')
    );
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onstart = () => {
      this.notify(true);
    };

    utterance.onend = () => {
      this.notify(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.notify(false);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
      this.currentUtterance = null;
    }
  }

  public toggle(text: string): void {
    if (this.isSpeakingState) {
      this.stop();
    } else {
      this.speak(text);
    }
  }
}

export const speechService = new SpeechService();
