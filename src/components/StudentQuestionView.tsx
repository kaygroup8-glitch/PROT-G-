import React, { useState, useEffect, useRef } from 'react';
import { ConceptChallenge, ConversationTurn } from '../types';
import { VoiceManager } from '../services/voice/VoiceManager';
import { ProtegeMark } from './ProtegeMark';
import { AliveOrb } from './AliveOrb';
import { soundService } from '../services/soundService';
import {
  ArrowRightIcon,
  LightbulbIcon,
  MicIcon,
  PencilQuillIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from './Icons';
import { voiceGuide } from '../services/voiceGuideService';

interface StudentQuestionViewProps {
  concept: ConceptChallenge;
  studentReflection: string;
  helpfulSuggestion?: string;
  targetedQuestion: string;
  isConceptUnderstood?: boolean;
  masteredPercentage?: number;
  stageLabel?: string;
  turns: ConversationTurn[];
  onAnswerQuestion: (answerText: string, inputMethod: 'voice' | 'text') => void;
  onProceedToReconstruction: () => void;
  isLoading: boolean;
  onOpenHistory?: () => void;
}

export const StudentQuestionView: React.FC<StudentQuestionViewProps> = ({
  concept,
  studentReflection,
  helpfulSuggestion,
  targetedQuestion,
  isConceptUnderstood = false,
  masteredPercentage = 35,
  stageLabel = 'Connecting Core Mechanisms',
  turns,
  onAnswerQuestion,
  onProceedToReconstruction,
  isLoading,
  onOpenHistory,
}) => {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showThread, setShowThread] = useState(false);
  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const voiceManagerRef = useRef<VoiceManager | null>(null);

  useEffect(() => {
    const unsubscribe = voiceGuide.subscribe((speaking) => {
      setIsSpeakingGuide(speaking);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const textToSpeak = `${studentReflection} ${helpfulSuggestion ? helpfulSuggestion + ' ' : ''}${targetedQuestion}`;
    voiceGuide.speak(textToSpeak);
    voiceManagerRef.current = new VoiceManager();
    return () => {
      voiceManagerRef.current?.stop();
    };
  }, [targetedQuestion, studentReflection, helpfulSuggestion]);

  const toggleRecording = async () => {
    if (!voiceManagerRef.current) return;
    setVoiceError(null);
    soundService.playSoftClick();

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
            setAnswer((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
          },
          onError: (err: string) => {
            console.warn('Voice error in question view:', err);
            setVoiceError(err);
            setIsRecording(false);
            setIsTranscribing(false);
            setVolume(0);
          },
          onVolumeChange: (vol: number) => {
            setVolume(vol);
          },
          onStateChange: (listening: boolean) => {
            setIsRecording(listening);
            if (!listening) setVolume(0);
          },
        });
      } catch (err) {
        console.error('Mic initialization failed:', err);
        setVoiceError('Microphone access failed. Please verify browser permissions.');
        setIsRecording(false);
        setIsTranscribing(false);
        setVolume(0);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isLoading) return;
    soundService.playSuccessChime();
    onAnswerQuestion(answer.trim(), mode);
    setAnswer('');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#09090B] flex flex-col justify-between selection:bg-zinc-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ProtegeMark size={26} highlight />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wider">
                Active Session
              </span>
              <span className="text-[10px] text-zinc-300">/</span>
              <span className="text-xs font-semibold text-zinc-900">{concept.title}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="btn-duo-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer text-zinc-700 hover:text-zinc-900"
              title="View your saved history"
            >
              <BookOpenIcon size={14} className="text-zinc-600" />
              <span className="hidden sm:inline">History</span>
            </button>
          )}

          <button
            onClick={() => {
              soundService.playSoftClick();
              onProceedToReconstruction();
            }}
            className="btn-duo-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer text-zinc-700 hover:text-zinc-900"
          >
            <span>Reconstruct Model</span>
            <ArrowRightIcon size={13} />
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col items-center space-y-5">
        {/* Concept Metadata Bar with Image Thumbnail */}
        {concept.imageUrl && (
          <div className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white border border-zinc-200 shadow-2xs">
            <div className="w-12 h-10 rounded overflow-hidden bg-zinc-100 shrink-0">
              <img
                src={concept.imageUrl}
                alt={concept.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">
                {concept.domain}
              </div>
              <div className="text-xs font-bold text-zinc-900 truncate">
                {concept.title}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {masteredPercentage}% Mastery
              </span>
            </div>
          </div>
        )}

        {/* Living Apprentice Orb */}
        <div className="w-full flex flex-col items-center space-y-2.5">
          <div className="flex flex-col items-center relative">
            <AliveOrb
              state={isLoading ? 'assimilating' : isRecording ? 'listening' : isSpeakingGuide ? 'speaking' : 'ready'}
              volume={volume}
              size={88}
            />
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-zinc-700 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200">
                {isLoading
                  ? 'Protégé is synthesizing...'
                  : isRecording
                  ? 'Listening via AssemblyAI...'
                  : isSpeakingGuide
                  ? 'Protégé is speaking'
                  : 'Socratic Dialogue Active'}
              </span>
            </div>
          </div>

          {/* Apprentice Comprehension Progress Bar */}
          <div className="w-full max-w-md bg-white p-3 rounded-lg border border-zinc-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                <SparklesIcon size={13} className="text-emerald-600" />
                <span>{stageLabel}</span>
              </span>
              <span className="font-medium text-zinc-600">
                {masteredPercentage}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full bg-zinc-900 transition-all duration-500 rounded-full"
                style={{ width: `${masteredPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Apprentice Comprehension Success Banner if Mastered */}
        {isConceptUnderstood && (
          <div className="w-full p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircleIcon size={20} className="shrink-0 text-emerald-600" />
              <div>
                <div className="text-sm font-bold text-zinc-900">
                  Causal Chain Mastered
                </div>
                <div className="text-xs text-zinc-600">
                  Protégé has assimilated the complete mechanism without gaps.
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                soundService.playSoftClick();
                onProceedToReconstruction();
              }}
              className="btn-duo-green px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>View Summary</span>
              <ArrowRightIcon size={13} />
            </button>
          </div>
        )}

        {/* Protégé's Response Card */}
        <div className="paper-card p-5 sm:p-6 w-full shadow-xs space-y-3.5 text-left">
          {/* Reflection */}
          {studentReflection && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                What Protégé Grasped:
              </div>
              <div className="text-xs sm:text-sm text-zinc-700 leading-relaxed border-l-2 border-zinc-300 pl-3 py-0.5 italic">
                &ldquo;{studentReflection}&rdquo;
              </div>
            </div>
          )}

          {/* Apprentice Hint */}
          {helpfulSuggestion && (
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 flex items-start gap-2">
              <SparklesIcon size={14} className="text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-900">Apprentice note: </span>
                <span>{helpfulSuggestion}</span>
              </div>
            </div>
          )}

          {/* Targeted Socratic Question */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
              <LightbulbIcon size={14} className="text-amber-600" />
              <span className="uppercase tracking-wider">Targeted Socratic Question:</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-zinc-950 leading-snug">
              &ldquo;{targetedQuestion}&rdquo;
            </p>
          </div>
        </div>

        {/* Answer Form: Voice & Type */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="paper-card p-4 sm:p-5 w-full space-y-4 text-left">
            {/* Mode Switcher */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <label className="block text-xs font-medium text-zinc-700">
                Your Explanation:
              </label>

              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    soundService.playSoftClick();
                    setMode('voice');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    mode === 'voice' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-500'
                  }`}
                >
                  <MicIcon size={13} />
                  <span>Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundService.playSoftClick();
                    setMode('text');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    mode === 'text' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-500'
                  }`}
                >
                  <PencilQuillIcon size={13} />
                  <span>Type</span>
                </button>
              </div>
            </div>

            {/* Voice Mode Mic Interface */}
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
                    aria-label={isRecording ? 'Stop speaking' : 'Start speaking'}
                  >
                    <MicIcon size={22} />
                  </button>

                  <div className="mt-2 text-xs font-medium text-zinc-900">
                    {isRecording ? 'Listening... Click when finished' : 'Click to explain using your voice'}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Transcribed via AssemblyAI Universal-2
                  </div>

                  {isTranscribing && (
                    <div className="mt-2 text-xs font-medium text-blue-600 animate-pulse flex items-center gap-1">
                      <SparklesIcon size={13} />
                      <span>Transcribing spoken explanation...</span>
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

            {/* Explanation Textarea */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                {mode === 'voice' ? 'Spoken Transcript (Editable)' : 'Step-by-Step Explanation'}
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Explain the causal process clearly. For instance: 'When the photon strikes chlorophyll, it excites electrons that split water...'"
                rows={4}
                disabled={isLoading}
                className="w-full p-3 rounded-lg bg-white border border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-zinc-500">
                {answer.trim().split(/\s+/).filter(Boolean).length} words
              </span>

              <button
                type="submit"
                disabled={!answer.trim() || isLoading}
                className="btn-duo-green px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Protégé is Thinking...</span>
                  </>
                ) : (
                  <>
                    <span>Send Explanation</span>
                    <ArrowRightIcon size={13} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Conversation Transcript Thread Drawer */}
        {turns && turns.length > 0 && (
          <div className="w-full paper-card p-4 border border-zinc-200 space-y-3 text-left">
            <button
              type="button"
              onClick={() => {
                soundService.playSoftClick();
                setShowThread(!showThread);
              }}
              className="w-full flex items-center justify-between text-xs font-medium text-zinc-900 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <BookOpenIcon size={14} className="text-zinc-700" />
                <span>Dialogue History ({turns.length} messages)</span>
              </span>
              <span className="flex items-center gap-1 text-zinc-500 text-[11px]">
                <span>{showThread ? 'Collapse' : 'Expand History'}</span>
                {showThread ? <ChevronUpIcon size={13} /> : <ChevronDownIcon size={13} />}
              </span>
            </button>

            {showThread && (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pt-2 border-t border-zinc-200 pr-1">
                {turns.map((turn, idx) => {
                  const isUser = turn.role === 'user';
                  return (
                    <div
                      key={turn.id || idx}
                      className={`p-3 rounded-lg text-xs space-y-1 ${
                        isUser
                          ? 'bg-zinc-100 border border-zinc-200 ml-4'
                          : 'bg-white border border-zinc-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-semibold">
                        <span className={isUser ? 'text-zinc-900' : 'text-zinc-700'}>
                          {isUser ? 'You (Teacher)' : 'Protégé (Apprentice)'}
                        </span>
                        <span className="text-zinc-500">
                          {turn.inputMethod === 'voice' ? 'Voice' : 'Typed'}
                        </span>
                      </div>
                      <p className="text-zinc-800 leading-relaxed whitespace-pre-wrap">{turn.text}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
