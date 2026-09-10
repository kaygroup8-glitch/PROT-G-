import { TranscriberCallbacks } from './types';
import { AssemblyAITranscriber } from './AssemblyAITranscriber';

/**
 * Core Voice Manager.
 * AssemblyAI is the sole voice transcription engine.
 */
export class VoiceManager {
  private assemblyAITranscriber: AssemblyAITranscriber;

  constructor() {
    this.assemblyAITranscriber = new AssemblyAITranscriber();
  }

  public isVoiceSupported(): boolean {
    return this.assemblyAITranscriber.isSupported();
  }

  public async start(
    callbacks: TranscriberCallbacks & { onVolumeChange?: (vol: number) => void }
  ): Promise<void> {
    await this.assemblyAITranscriber.start(callbacks);
  }

  public stop(): void {
    this.assemblyAITranscriber.stop();
  }

  public isListening(): boolean {
    return this.assemblyAITranscriber.isListening();
  }

  public isProcessing(): boolean {
    return this.assemblyAITranscriber.getIsProcessing();
  }
}
