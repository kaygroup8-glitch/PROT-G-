export interface TranscriberCallbacks {
  onTranscriptChange: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onStateChange: (isListening: boolean) => void;
}

export interface IVoiceTranscriber {
  isSupported(): boolean;
  start(callbacks: TranscriberCallbacks): Promise<void>;
  stop(): void;
  isListening(): boolean;
}

export interface AudioCaptureCallbacks {
  onVolumeChange: (volume: number) => void;
  onAudioData?: (blob: Blob) => void;
  onError: (error: string) => void;
}
