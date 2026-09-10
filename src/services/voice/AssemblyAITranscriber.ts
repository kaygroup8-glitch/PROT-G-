import { IVoiceTranscriber, TranscriberCallbacks } from './types';
import { AudioCaptureService } from './AudioCaptureService';

/**
 * Core AssemblyAI Voice Transcriber.
 * Captures clean audio through AudioCaptureService, monitors live volume levels,
 * and passes the complete recording to the server AssemblyAI pipeline.
 */
export class AssemblyAITranscriber implements IVoiceTranscriber {
  private audioCapture: AudioCaptureService;
  private listening: boolean = false;
  private isProcessing: boolean = false;
  private callbacks: TranscriberCallbacks | null = null;

  constructor() {
    this.audioCapture = new AudioCaptureService();
  }

  public isSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  public async start(
    callbacks: TranscriberCallbacks & { onVolumeChange?: (vol: number) => void }
  ): Promise<void> {
    if (!this.isSupported()) {
      callbacks.onError('Microphone recording is not supported in this browser environment.');
      return;
    }

    this.callbacks = callbacks;
    this.listening = true;
    this.isProcessing = false;
    this.callbacks.onStateChange(true);

    try {
      await this.audioCapture.startCapture({
        onVolumeChange: (vol) => {
          if (callbacks.onVolumeChange) {
            callbacks.onVolumeChange(vol);
          }
        },
        onAudioData: (blob) => {
          this.processAudioBlob(blob);
        },
        onError: (err) => {
          this.listening = false;
          this.callbacks?.onError(err);
          this.callbacks?.onStateChange(false);
        },
      });
    } catch (err: unknown) {
      this.listening = false;
      this.callbacks?.onStateChange(false);
      const msg = err instanceof Error ? err.message : 'Microphone initialization failed.';
      callbacks.onError(msg);
    }
  }

  public stop(): void {
    if (!this.listening) return;
    this.listening = false;
    this.callbacks?.onStateChange(false);
    this.audioCapture.stopCapture();
  }

  public isListening(): boolean {
    return this.listening;
  }

  public getIsProcessing(): boolean {
    return this.isProcessing;
  }

  private async processAudioBlob(blob: Blob): Promise<void> {
    if (blob.size < 500) {
      // Audio clip is too short or empty
      return;
    }

    this.isProcessing = true;
    try {
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': blob.type || 'audio/webm',
        },
        body: blob,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server transcription failed (${response.status})`);
      }

      const data = await response.json();
      if (data.transcript && data.transcript.trim()) {
        // Send single, clean final transcript
        this.callbacks?.onTranscriptChange(data.transcript.trim(), true);
      } else if (data.error) {
        this.callbacks?.onError(data.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transcription request failed.';
      this.callbacks?.onError(msg);
    } finally {
      this.isProcessing = false;
    }
  }
}
