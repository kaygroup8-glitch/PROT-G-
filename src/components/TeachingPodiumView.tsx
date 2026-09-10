import React, { useState, useEffect, useRef } from 'react';
import { ConceptChallenge } from '../types';
import { VoiceManager } from '../services/voice/VoiceManager';
import { AliveOrb } from './AliveOrb';
import { ProtegeMark } from './ProtegeMark';
import {
  MicIcon,
  PencilQuillIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AlertCircleIcon,
  SpeakerWaveIcon,
} from './Icons';
import { getStoredUserLearningProfile } from '../services/storageService';
import { voiceGuide } from '../services/voiceGuideService';

interface TeachingPodiumViewProps {
  concept: ConceptChallenge;
  onSendExplanation: (text: string, inputMethod: 'voice' | 'text') => void;
  isLoading: boolean;
  onBack: () => void;
}

export const TeachingPodiumView: React.FC<TeachingPodiumViewProps> = ({
  concept,
  onSendExplanation,
  isLoading,
  onBack,
}) => {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voiceManagerRef = useRef<VoiceManager | null>(null);

  const profile = getStoredUserLearningProfile();
  const teacherGreeting = profile.name || 'Teacher';

  useEffect(() => {
    voiceGuide.guideStep('teaching');
    voiceManagerRef.current = new VoiceManager();
    return () => {
      voiceManagerRef.current?.stop();
    };
  }, []);

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
            setInputText((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
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

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    if (isRecording) {
      voiceManagerRef.current?.stop();
      setIsRecording(false);
    }
    onSendExplanation(inputText.trim(), mode === 'voice' ? 'voice' : 'text');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#09090B] flex flex-col justify-between selection:bg-zinc-200">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-8 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="btn-duo-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-zinc-700 hover:text-zinc-900"
        >
          <ArrowLeftIcon size={13} />
          <span>Curriculum</span>
        </button>

        <div className="flex items-center gap-2">
          <ProtegeMark size={24} highlight />
          <span className="font-semibold text-xs text-zinc-900">
            Teaching: {concept.title}
          </span>
        </div>

        <button
          onClick={() => voiceGuide.guideStep('teaching')}
          className="btn-duo-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer text-zinc-700 hover:text-zinc-900"
          title="Hear guidance tips"
        >
          <SpeakerWaveIcon size={13} />
          <span className="hidden sm:inline">Tips</span>
        </button>
      </header>

      {/* Main Teaching Desk */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 flex flex-col justify-center items-center space-y-5">
        {/* Concept Banner with Real Photography */}
        {concept.imageUrl && (
          <div className="w-full rounded-xl overflow-hidden border border-zinc-200 bg-white shadow-xs">
            <div className="h-28 w-full overflow-hidden relative">
              <img
                src={concept.imageUrl}
                alt={concept.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-3.5">
                <div>
                  <div className="text-[10px] font-mono text-zinc-300 uppercase">
                    {concept.domain}
                  </div>
                  <h2 className="text-base font-bold text-white leading-tight">
                    {concept.title}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Living Apprentice Orb */}
        <div className="flex flex-col items-center">
          <AliveOrb
            state={isLoading ? 'assimilating' : isRecording ? 'listening' : 'idle'}
            volume={volume}
            size={90}
          />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-2">
            {isLoading
              ? 'Protégé assimilating...'
              : isRecording
              ? 'Listening via AssemblyAI...'
              : 'Apprentice ready'}
          </span>
        </div>

        {/* Paper Notebook Card */}
        <div className="paper-card p-5 sm:p-6 w-full shadow-xs space-y-4 text-left">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                {teacherGreeting}&apos;s Podium
              </span>
              <h3 className="text-sm font-bold text-zinc-900 mt-0.5">
                Explain {concept.title}
              </h3>
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
              <button
                type="button"
                onClick={() => setMode('voice')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  mode === 'voice' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-500'
                }`}
              >
                <MicIcon size={13} />
                <span>Voice</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('text')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  mode === 'text' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-500'
                }`}
              >
                <PencilQuillIcon size={13} />
                <span>Type</span>
              </button>
            </div>
          </div>

          {/* Voice Mode Controls */}
          {mode === 'voice' && (
            <div className="space-y-3">
              <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-center">
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isLoading || isTranscribing}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    isRecording
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'btn-duo-green'
                  }`}
                  aria-label={isRecording ? 'Stop recording' : 'Start speaking'}
                >
                  <MicIcon size={22} />
                </button>

                <div className="mt-2 text-xs font-medium text-zinc-900">
                  {isRecording ? 'Listening... Click when finished' : 'Click to start explaining'}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  Powered by AssemblyAI Universal-2 speech recognition
                </div>

                {isTranscribing && (
                  <div className="mt-2 text-xs font-medium text-blue-600 animate-pulse">
                    Transcribing your speech...
                  </div>
                )}
              </div>

              {voiceError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                  <AlertCircleIcon size={15} className="shrink-0 mt-0.5" />
                  <span>{voiceError}</span>
                </div>
              )}
            </div>
          )}

          {/* Text/Transcript Area */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              {mode === 'voice' ? 'Spoken Transcript' : 'Written Explanation'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Explain what causes what. For instance: 'When this process starts, the input is converted because...'"
              rows={4}
              className="w-full p-3 rounded-lg border border-zinc-300 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 resize-none transition-colors leading-relaxed"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-1 flex items-center justify-between gap-4">
            <span className="text-[11px] text-zinc-500">
              {inputText.trim() ? `${inputText.trim().split(/\s+/).length} words ready` : 'Speak or type your explanation'}
            </span>

            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="btn-duo-green px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              <span>{isLoading ? 'Protégé is thinking...' : 'Teach Protégé'}</span>
              <ArrowRightIcon size={13} />
            </button>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-zinc-200 bg-white px-4 py-3 text-center text-xs text-zinc-500">
        Explain what causes what. Focus on first principles and observable mechanisms.
      </footer>
    </div>
  );
};
