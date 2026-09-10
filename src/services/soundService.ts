// Sound Service: Web Audio API synthesized soft tactile clicks & audio controls
class SoundService {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;
  private ambientEnabled: boolean = false; // Background sound permanently disabled
  private ambientVolume: number = 0;
  private clickEnabled: boolean = true;
  private ambientNodes: {
    oscillators: OscillatorNode[];
    gain: GainNode;
    modulator?: OscillatorNode;
    noise?: AudioBufferSourceNode;
  } | null = null;

  constructor() {
    // Explicitly enforce background sound is disabled
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('protege_ambient_sound_enabled', 'false');
      }
    } catch {
      // ignore
    }

    // Auto-attach global soft click listener on any button or interactive element
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'click',
        (e: MouseEvent) => {
          const target = e.target as HTMLElement | null;
          if (!target) return;
          const interactive = target.closest(
            'button, a, [role="button"], input[type="radio"], input[type="checkbox"], select, summary, .cursor-pointer'
          );
          if (interactive) {
            this.playSoftClick();
          }
        },
        { capture: true, passive: true }
      );

      // Audio context unlock for clicks only (no background sound)
      const unlockAudio = () => {
        this.ensureContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    return this.ctx;
  }

  /**
   * Premium soft tactile button click sound (warm acoustic tap, non-fatiguing)
   */
  public playSoftClick(): void {
    if (!this.clickEnabled) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Soft low-pass filter to eliminate harsh high-frequency pops
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(250, now + 0.035);

      // Fast, subtle pitch envelope (220Hz -> 75Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.035);

      // Smooth exponential decay volume envelope
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.038);
    } catch {
      // Audio autoplay policy guard
    }
  }

  /**
   * Soft melodic chime for successful connection
   */
  public playSuccessChime(): void {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [392, 523.25, 659.25]; // G4, C5, E5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.0001, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.07, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.45);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Background ambient sound is disabled.
   */
  public startAmbient(): void {
    // Disabled
    this.stopAmbient();
  }

  /**
   * Stop and eliminate any ambient background sound immediately
   */
  public stopAmbient(): void {
    try {
      if (this.ambientGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.setValueAtTime(0, now);
        this.ambientGain.disconnect();
        this.ambientGain = null;
      }
      if (this.ambientNodes) {
        this.ambientNodes.oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // ignore
          }
        });
        this.ambientNodes = null;
      }
      this.isAmbientPlaying = false;
      this.ambientEnabled = false;
    } catch {
      this.isAmbientPlaying = false;
      this.ambientEnabled = false;
    }
  }

  public toggleAmbient(): boolean {
    this.stopAmbient();
    return false;
  }

  public setAmbientVolume(_vol: number): void {
    this.ambientVolume = 0;
  }

  public isAmbientActive(): boolean {
    return false;
  }

  public getAmbientVolume(): number {
    return 0;
  }

  public isClickActive(): boolean {
    return this.clickEnabled;
  }

  public toggleClick(): boolean {
    this.clickEnabled = !this.clickEnabled;
    return this.clickEnabled;
  }
}

export const soundService = new SoundService();
