import { JourneyStep } from '../types';
import { getStoredUserLearningProfile } from './storageService';

type VoiceStateListener = (isSpeaking: boolean, currentText: string) => void;

class VoiceGuideService {
  private isSpeaking: boolean = false;
  private currentText: string = '';
  private listeners: Set<VoiceStateListener> = new Set();
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map();
  private abortController: AbortController | null = null;

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking, this.currentText);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(speaking: boolean, text: string) {
    this.isSpeaking = speaking;
    this.currentText = text;
    this.listeners.forEach((l) => l(speaking, text));
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.notify(false, '');
  }

  public async speak(text: string, force: boolean = false): Promise<void> {
    const profile = getStoredUserLearningProfile();
    if (!profile.voiceGuideEnabled && !force) {
      return;
    }

    this.stop();

    this.abortController = new AbortController();
    const { signal } = this.abortController;

    try {
      let audioUrl = this.audioCache.get(text);

      if (!audioUrl) {
        // Fetch neural voice audio from server
        const response = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          signal,
        });

        if (!response.ok) {
          throw new Error(`Voice server error: ${response.status}`);
        }

        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);
        this.audioCache.set(text, audioUrl);
      }

      if (signal.aborted) return;

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onplay = () => {
        this.notify(true, text);
      };

      audio.onended = () => {
        this.notify(false, '');
        this.currentAudio = null;
      };

      audio.onerror = () => {
        // Fallback to browser SpeechSynthesis on audio element error
        this.speakWithBrowserSynth(text);
      };

      await audio.play();
    } catch (err: unknown) {
      if (signal.aborted) return;
      console.info('Neural voice server fallback to browser speech synthesis:', err);
      this.speakWithBrowserSynth(text);
    }
  }

  private speakWithBrowserSynth(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.08; // friendly apprentice cadence

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('Daniel'))
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onstart = () => this.notify(true, text);
      utterance.onend = () => this.notify(false, '');
      utterance.onerror = () => this.notify(false, '');
      window.speechSynthesis.speak(utterance);
    } else {
      this.notify(false, '');
    }
  }

  public guideStep(step: JourneyStep, context?: { conceptTitle?: string; question?: string; gapTitle?: string }): void {
    const profile = getStoredUserLearningProfile();
    if (!profile.voiceGuideEnabled) return;

    let message = '';
    switch (step) {
      case 'landing':
        message = `Welcome to Protégé! Pick any topic you want to master. When you explain it in your own words, I'll listen and help you find any missing puzzle pieces.`;
        break;
      case 'select-concept':
        message = `Choose a topic from your roadmap below. Teach me from the ground up, and let's see how deep your understanding really is!`;
        break;
      case 'meet-student':
        message = context?.conceptTitle
          ? `Hi! I'm your protégé for ${context.conceptTitle}. I have no textbooks and zero prior knowledge. Teach me like you're explaining it to a friend.`
          : `Hi! I'm your protégé. I have no textbooks and zero prior knowledge. Teach me simply!`;
        break;
      case 'teaching':
        message = `I am ready and listening. Speak or type your explanation. Focus on how the cause and effect work step by step.`;
        break;
      case 'question':
        message = context?.question
          ? `Thank you! I followed parts of what you said, but I have one curious question: ${context.question}`
          : `Thank you! I have one targeted question to help connect the ideas.`;
        break;
      case 'reconstruction':
        message = `Here are my honest notes! Take a look at what came through clearly, and notice the puzzle piece where I got stuck.`;
        break;
      case 'reteach-gap':
        message = context?.gapTitle
          ? `Now let's bridge the missing connection: ${context.gapTitle}. What is the exact cause that links these two parts?`
          : `Let's bridge the missing connection. Explain the cause that links these two parts together.`;
        break;
      case 'diff-result':
        message = `Incredible work! You connected the missing link. You've truly mastered this concept.`;
        break;
      default:
        break;
    }

    if (message) {
      this.speak(message);
    }
  }
}

export const voiceGuide = new VoiceGuideService();
