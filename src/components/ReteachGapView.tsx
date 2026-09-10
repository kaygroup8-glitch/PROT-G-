import React, { useState, useEffect, useRef } from 'react';
import { ConceptChallenge, MissingRelationshipBreakdown } from '../types';
import { VoiceManager } from '../services/voice/VoiceManager';
import { ProtegeMark } from './ProtegeMark';
import { AliveOrb } from './AliveOrb';
import {
  MicIcon,
  PencilQuillIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AlertCircleIcon,
  SpeakerWaveIcon,
  SparkleIcon,
} from './Icons';
import { voiceGuide } from '../services/voiceGuideService';

interface ReteachGapViewProps {
  concept: ConceptChallenge;
  missingRelationship: MissingRelationshipBreakdown | null;
  onSendRetest: (explanation: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

export const ReteachGapView: React.FC<ReteachGapViewProps> = ({
  concept,
  missingRelationship,
  onSendRetest,
  isLoading,
  onBack,
}) => {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voiceManagerRef = useRef<VoiceManager | null>(null);

  useEffect(() => {
    voiceGuide.guideStep('reteach-gap', { gapTitle: missingRelationship?.gapTitle });
    voiceManagerRef.current = new VoiceManager();
    return () => {
      voiceManagerRef.current?.stop();
    };
  }, [missingRelationship]);

  const toggleRecording = async () => {
    if (!voiceManagerRef.current) return;
    setVoiceError(null);

    if (isRecording) {
      setIsRecording(false);
      setVolume(0);
      setIsTranscribing(true);
      voiceManagerRef.current.stop();
    } else {
      try {
        setIsRecording(true);
        setIsTranscribing(false);
        await voiceManagerRef.current.start({
          onTranscriptChange: (transcript: string) => {
            setIsTranscribing(false);
            setText((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
          },
          onError: (err: string) => {
            console.warn('Voice error:', err);
            setVoiceError(err);
            setIsRecording(false);
            setIsTranscribing(false);
            setVolume(0);
          },
          onStateChange: (listening: boolean) => {
            setIsRecording(listening);
            if (!listening) setVolume(0);
          },
          onVolumeChange: (vol: number) => {
            setVolume(vol);
          },
        });
      } catch (err) {
        console.error('Failed to start voice capture:', err);
        const msg = err instanceof Error ? err.message : 'Microphone could not be accessed.';
        setVoiceError(`${msg} Please check permissions or switch to typing mode.`);
        setIsRecording(false);
        setIsTranscribing(false);
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    if (isRecording) {
      voiceManagerRef.current?.stop();
      setIsRecording(false);
    }
    onSendRetest(text.trim());
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1E1B18] flex flex-col justify-between selection:bg-[#58CC02]/20 selection:text-[#1E1B18]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b-2 border-[#E5DFD3] border-b-4 border-b-[#D5CDBC] px-4 sm:px-8 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="btn-duo-white px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeftIcon size={14} />
          <span>Notebook</span>
        </button>

        <div className="flex items-center gap-2">
          <ProtegeMark size={28} highlight />
          <span className="font-extrabold text-sm tracking-tight text-[#1E1B18]">
            Bridge the Missing Link
          </span>
        </div>

        <button
          onClick={() => voiceGuide.guideStep('reteach-gap', { gapTitle: missingRelationship?.gapTitle })}
          className="btn-duo-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-[#1CB0F6]"
          title="Hear guidance"
        >
          <SpeakerWaveIcon size={14} />
          <span className="hidden sm:inline">Tips</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 flex flex-col justify-center items-center">
        {/* ChatGPT Style Voice Orb */}
        <div className="mb-6 flex flex-col items-center">
          <AliveOrb
            state={isLoading ? 'assimilating' : isRecording ? 'listening' : 'idle'}
            volume={volume}
            size={110}
          />
        </div>

        {/* Paper Notebook Card */}
        <div className="paper-card p-6 sm:p-8 w-full shadow-sm space-y-5">
          {/* Target Gap Header */}
          <div className="p-4 rounded-2xl bg-[#FFF8EE] border-2 border-[#FF9600]/40 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#CC7800] bg-white px-2.5 py-0.5 rounded-full border border-[#FF9600]/30 inline-block">
              Target Connection
            </span>
            <h3 className="text-base font-bold text-[#1E1B18]">
              {missingRelationship
                ? `${missingRelationship.fromLabel} ➔ ${missingRelationship.toLabel}`
                : 'The Missing Causal Mechanism'}
            </h3>
            <p className="text-xs text-[#4A453E] leading-relaxed">
              {missingRelationship?.gapDescription ||
                'Explain how these two ideas connect causally so your apprentice can complete the circuit.'}
            </p>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7D766C]">
              Your Second Attempt
            </span>

            <div className="flex items-center gap-1.5 bg-[#FAF7F0] p-1 rounded-2xl border border-[#E5DFD3]">
              <button
                type="button"
                onClick={() => setMode('voice')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'voice' ? 'bg-white shadow-xs text-[#1CB0F6]' : 'text-[#7D766C]'
                }`}
              >
                <MicIcon size={13} />
                <span>Voice</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('text')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'text' ? 'bg-white shadow-xs text-[#58CC02]' : 'text-[#7D766C]'
                }`}
              >
                <PencilQuillIcon size={13} />
                <span>Type</span>
              </button>
            </div>
          </div>

          {/* Voice Mode */}
          {mode === 'voice' && (
            <div className="space-y-3">
              <div className="flex flex-col items-center justify-center p-4 bg-[#FAF7F0] rounded-2xl border border-[#E5DFD3] text-center">
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isLoading || isTranscribing}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    isRecording
                      ? 'bg-[#FF453A] border-4 border-[#D70015] text-white animate-pulse'
                      : 'btn-duo-green'
                  }`}
                >
                  <MicIcon size={24} />
                </button>
                <div className="mt-2 text-xs font-bold text-[#1E1B18]">
                  {isRecording ? 'Listening... Tap when done' : 'Tap to speak the missing link'}
                </div>
                {isTranscribing && (
                  <div className="text-xs font-bold text-[#1CB0F6] mt-1 animate-pulse">
                    Transcribing with AssemblyAI...
                  </div>
                )}
              </div>

              {voiceError && (
                <div className="p-3 rounded-2xl bg-[#FFF2F2] border border-[#FFD0D0] flex items-start gap-2 text-xs text-[#D70015]">
                  <AlertCircleIcon size={16} className="shrink-0 mt-0.5" />
                  <span>{voiceError}</span>
                </div>
              )}
            </div>
          )}

          {/* Text Area */}
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Explain what connects the two parts together in 1-2 clear sentences..."
              rows={4}
              className="w-full p-4 rounded-2xl border-2 border-[#E5DFD3] bg-[#FAF7F0] text-sm text-[#1E1B18] placeholder-[#A59F94] focus:outline-none focus:border-[#58CC02] focus:bg-white font-medium resize-none transition-all leading-relaxed"
            />
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <span className="text-xs text-[#7D766C]">
              {text.trim() ? `${text.trim().split(/\s+/).length} words ready` : 'Focus strictly on the cause'}
            </span>

            <button
              onClick={handleSend}
              disabled={!text.trim() || isLoading}
              className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer ${
                text.trim() && !isLoading
                  ? 'btn-duo-green'
                  : 'bg-[#E5DFD3] text-[#7D766C] cursor-not-allowed border-b-4 border-[#D5CDBC]'
              }`}
            >
              <span>{isLoading ? 'Auditing Repair...' : 'Connect Link & Claim Mastery'}</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#E5DFD3] bg-[#FFFFFF] px-4 py-3 text-center text-xs text-[#7D766C]">
        Topic: <strong className="text-[#1E1B18]">{concept.title}</strong>
      </footer>
    </div>
  );
};
