import React, { useState, useEffect, useRef } from 'react';
import { ConceptChallenge } from '../types';
import {
  DOMAIN_TRACKS,
  getPersonalizedRoadmap,
  createCustomConcept,
  DomainTrackInfo,
} from '../data/curatedConcepts';
import { ProtegeMark } from './ProtegeMark';
import {
  BookOpenIcon,
  ArrowRightIcon,
  SparkleIcon,
  CheckCircleIcon,
  FlameStreakIcon,
  StarXpIcon,
  SpeakerWaveIcon,
  MicIcon,
  PencilQuillIcon,
} from './Icons';
import { getStoredUserLearningProfile, UserLearningProfile } from '../services/storageService';
import { getStoredProfile, UserProfile } from '../services/userProfile';
import { voiceGuide } from '../services/voiceGuideService';
import { VoiceManager } from '../services/voice/VoiceManager';

interface ConceptSelectViewProps {
  onSelectConcept: (concept: ConceptChallenge) => void;
  onViewLanding?: () => void;
  onOpenPreferences?: () => void;
  onOpenHistory?: () => void;
}

export const ConceptSelectView: React.FC<ConceptSelectViewProps> = ({
  onSelectConcept,
  onViewLanding,
  onOpenPreferences,
  onOpenHistory,
}) => {
  const [tab, setTab] = useState<'curated' | 'custom'>('curated');
  const [customTitle, setCustomTitle] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [profile, setProfile] = useState<UserLearningProfile>(getStoredUserLearningProfile());
  const [userPref, setUserPref] = useState<UserProfile | null>(getStoredProfile());
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [aiConcepts, setAiConcepts] = useState<ConceptChallenge[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGenMessage, setAiGenMessage] = useState<string | null>(null);

  // Voice recording for custom topic input
  const [isRecordingCustom, setIsRecordingCustom] = useState(false);
  const [isTranscribingCustom, setIsTranscribingCustom] = useState(false);
  const voiceManagerRef = useRef<VoiceManager | null>(null);

  useEffect(() => {
    const currentLearning = getStoredUserLearningProfile();
    const currentPref = getStoredProfile();
    setProfile(currentLearning);
    setUserPref(currentPref);

    const initialDomain = currentPref?.preferredDomain || DOMAIN_TRACKS[0].id;
    setSelectedDomainId(initialDomain);

    // Load any cached AI generated concepts for this domain
    const cachedAi = localStorage.getItem(`protege_ai_roadmap_${initialDomain}`);
    if (cachedAi) {
      try {
        setAiConcepts(JSON.parse(cachedAi));
      } catch {
        // ignore parse error
      }
    }

    voiceGuide.guideStep('select-concept');
    voiceManagerRef.current = new VoiceManager();
    return () => {
      voiceManagerRef.current?.stop();
    };
  }, []);

  const currentTrack: DomainTrackInfo =
    DOMAIN_TRACKS.find(
      (t) =>
        t.id.toLowerCase() === selectedDomainId.toLowerCase() ||
        t.shortName.toLowerCase() === selectedDomainId.toLowerCase()
    ) || DOMAIN_TRACKS[0];

  const { roadmapConcepts } = getPersonalizedRoadmap(
    selectedDomainId,
    userPref?.focusGoal,
    aiConcepts
  );

  const handleDomainChange = (trackId: string) => {
    setSelectedDomainId(trackId);
    setAiGenMessage(null);
    const cachedAi = localStorage.getItem(`protege_ai_roadmap_${trackId}`);
    if (cachedAi) {
      try {
        setAiConcepts(JSON.parse(cachedAi));
      } catch {
        setAiConcepts([]);
      }
    } else {
      setAiConcepts([]);
    }
  };

  const handleGenerateAiChallenges = async () => {
    setIsGeneratingAi(true);
    setAiGenMessage(null);
    try {
      const res = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            name: userPref?.name || profile.name || 'Teacher',
            preferredDomain: currentTrack.id,
            focusGoal: userPref?.focusGoal || 'Deep Understanding',
          },
        }),
      });

      if (!res.ok) throw new Error('AI Roadmap synthesis failed');
      const data = await res.json();
      if (Array.isArray(data.concepts) && data.concepts.length > 0) {
        const newConcepts = data.concepts;
        setAiConcepts(newConcepts);
        localStorage.setItem(`protege_ai_roadmap_${currentTrack.id}`, JSON.stringify(newConcepts));
        setAiGenMessage(`Added ${newConcepts.length} personalized challenges for your ${currentTrack.shortName} track.`);
      }
    } catch (err) {
      console.warn('Could not generate AI roadmap:', err);
      setAiGenMessage('Curriculum refreshed with track challenges.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const toggleCustomRecording = async () => {
    if (!voiceManagerRef.current) return;

    if (isRecordingCustom) {
      setIsRecordingCustom(false);
      setIsTranscribingCustom(true);
      voiceManagerRef.current.stop();
    } else {
      try {
        setIsRecordingCustom(true);
        setIsTranscribingCustom(false);
        await voiceManagerRef.current.start({
          onTranscriptChange: (transcript: string) => {
            setIsTranscribingCustom(false);
            setCustomTitle((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
          },
          onError: (err: string) => {
            console.warn('Voice error in custom topic:', err);
            setIsRecordingCustom(false);
            setIsTranscribingCustom(false);
          },
          onStateChange: (listening: boolean) => {
            setIsRecordingCustom(listening);
          },
        });
      } catch (err) {
        console.error('Failed to start voice capture:', err);
        setIsRecordingCustom(false);
        setIsTranscribingCustom(false);
      }
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    const concept = createCustomConcept(customTitle, customDomain || currentTrack.name);
    onSelectConcept(concept);
  };

  const stages: { stage: 1 | 2 | 3; title: string; subtitle: string }[] = [
    { stage: 1, title: 'Stage 1: Foundational Anchor', subtitle: 'Starting models and observable physical premises' },
    { stage: 2, title: 'Stage 2: Core Causal Process', subtitle: 'The transformative mechanical engine of the concept' },
    { stage: 3, title: 'Stage 3: Advanced Frontier', subtitle: 'Deep systemic dynamics and emergent phenomena' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#09090B] flex flex-col justify-between selection:bg-zinc-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ProtegeMark size={28} highlight />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-900">PROTÉGÉ</span>
              <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                Curriculum
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 hidden sm:block">
              Choose a concept to teach
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* History Archive Button */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="btn-duo-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer text-zinc-700 hover:text-zinc-900"
              title="View your saved teaching history and transcripts"
            >
              <BookOpenIcon size={14} className="text-zinc-600" />
              <span className="hidden md:inline">History</span>
            </button>
          )}

          {/* Landing / Overview link */}
          {onViewLanding && (
            <button
              onClick={onViewLanding}
              className="btn-duo-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer text-zinc-700 hover:text-zinc-900"
              title="View methodology overview"
            >
              <span>Overview</span>
            </button>
          )}

          {/* Preferences Link */}
          {onOpenPreferences && (
            <button
              onClick={onOpenPreferences}
              className="btn-duo-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer text-zinc-700 hover:text-zinc-900"
              title="Update your learning goal or track preferences"
            >
              <PencilQuillIcon size={13} />
              <span className="hidden sm:inline">Preferences</span>
            </button>
          )}

          {/* Streak & XP */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-800">
              <FlameStreakIcon size={14} className="text-amber-600" />
              <span>{profile.streakDays || 1}d</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-800">
              <StarXpIcon size={14} className="text-amber-500" />
              <span>{profile.totalXp || 0} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Track Banner */}
        <div className="mb-6 p-6 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-medium">
                <span>{currentTrack.shortName} Track</span>
              </span>
              {userPref?.focusGoal && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200 text-xs">
                  <span>Goal: {userPref.focusGoal}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              {currentTrack.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
              {currentTrack.description} Step into the educator role and explain the fundamental causes without relying on buzzwords.
            </p>
          </div>

          {/* Action Buttons: AI Refresh & Audio Tips */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleGenerateAiChallenges}
              disabled={isGeneratingAi}
              className="btn-duo-green px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              title="Synthesize custom concept challenges matching your preferences"
            >
              <SparkleIcon size={14} className={isGeneratingAi ? 'animate-spin text-zinc-400' : ''} />
              <span>{isGeneratingAi ? 'Synthesizing...' : 'Tailor with AI'}</span>
            </button>

            <button
              onClick={() => voiceGuide.guideStep('select-concept')}
              className="btn-duo-white px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer text-zinc-700 hover:text-zinc-900"
              title="Hear voice guidance tips"
            >
              <SpeakerWaveIcon size={14} className="text-zinc-700" />
              <span className="hidden sm:inline">Tips</span>
            </button>
          </div>
        </div>

        {/* AI Synthesis Notice if active */}
        {aiGenMessage && (
          <div className="mb-6 p-3.5 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-between text-xs font-medium text-zinc-900">
            <div className="flex items-center gap-2">
              <SparkleIcon size={14} className="text-zinc-700" />
              <span>{aiGenMessage}</span>
            </div>
            <button
              onClick={() => setAiGenMessage(null)}
              className="text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Track Selector Pills */}
        <div className="mb-6 overflow-x-auto pb-2 flex items-center gap-2 scrollbar-none">
          {DOMAIN_TRACKS.map((track) => {
            const isSelected = track.id === selectedDomainId;

            return (
              <button
                key={track.id}
                onClick={() => handleDomainChange(track.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                }`}
              >
                <span>{track.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Switcher: Curated Track Roadmap vs Teach Any Custom Topic */}
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-3">
          <button
            onClick={() => setTab('curated')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              tab === 'curated'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Curated Curriculum ({roadmapConcepts.length})
          </button>

          <button
            onClick={() => setTab('custom')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'custom'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <MicIcon size={12} />
            <span>Teach Any Custom Topic</span>
          </button>
        </div>

        {/* Curated Roadmap by Stages */}
        {tab === 'curated' ? (
          <div className="space-y-8">
            {stages.map((stageInfo) => {
              const stageConcepts = roadmapConcepts.filter(
                (c) => (c.stage || 1) === stageInfo.stage
              );

              if (stageConcepts.length === 0) return null;

              return (
                <section key={stageInfo.stage} className="space-y-3">
                  {/* Stage Heading */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                      {stageInfo.stage}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
                        {stageInfo.title}
                      </h2>
                      <p className="text-xs text-zinc-500">
                        {stageInfo.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Concepts Grid for this Stage with Real Photography */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                    {stageConcepts.map((concept) => {
                      const isMastered = profile.completedConceptIds.includes(concept.id);

                      return (
                        <div
                          key={concept.id}
                          onClick={() => onSelectConcept(concept)}
                          className="paper-card overflow-hidden flex flex-col justify-between hover:border-zinc-300 transition-all cursor-pointer group"
                        >
                          {/* Image Banner */}
                          {concept.imageUrl && (
                            <div className="w-full h-36 overflow-hidden bg-zinc-100 relative">
                              <img
                                src={concept.imageUrl}
                                alt={concept.title}
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                                Stage {concept.stage || 1}
                              </div>

                              <div className="absolute top-2 right-2 flex items-center gap-1">
                                {concept.isAiPersonalized && (
                                  <span className="text-[10px] font-medium text-white bg-blue-600/80 backdrop-blur-xs px-2 py-0.5 rounded flex items-center gap-1">
                                    <SparkleIcon size={10} />
                                    <span>AI</span>
                                  </span>
                                )}

                                {isMastered && (
                                  <span className="text-[10px] font-medium text-white bg-emerald-600/90 backdrop-blur-xs px-2 py-0.5 rounded flex items-center gap-1">
                                    <CheckCircleIcon size={11} />
                                    <span>Mastered</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <h3 className="text-sm font-bold text-zinc-900 group-hover:text-zinc-700 transition-colors leading-snug">
                                {concept.title}
                              </h3>

                              <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
                                {concept.description}
                              </p>

                              {/* Protégé's naive prior preview */}
                              <div className="p-2.5 rounded-md bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600 leading-snug">
                                <span className="font-semibold text-zinc-900">Apprentice starting question: </span>
                                &ldquo;{concept.studentPriors.slice(0, 95)}...&rdquo;
                              </div>
                            </div>

                            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-900">
                              <span>Step up to teach</span>
                              <ArrowRightIcon size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* Custom Concept Builder with AssemblyAI Mic Integration */
          <div className="paper-card p-6 sm:p-8 max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center mx-auto border border-zinc-200">
                <BookOpenIcon size={20} />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">
                Teach Any Concept or Question
              </h2>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
                Type or speak any topic you are learning: from neural networks to quantum physics. Protégé will evaluate your mechanical explanation from scratch.
              </p>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Concept Title or Question
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. How does public-key cryptography work?"
                    className="w-full px-3.5 py-2.5 pr-11 rounded-lg border border-zinc-300 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 font-medium"
                    autoFocus
                  />
                  {/* Mic Button in input */}
                  <button
                    type="button"
                    onClick={toggleCustomRecording}
                    className={`absolute right-2 top-2 p-1.5 rounded-md transition-all cursor-pointer ${
                      isRecordingCustom
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'text-zinc-500 hover:text-zinc-900 bg-zinc-100 border border-zinc-200'
                    }`}
                    title={isRecordingCustom ? 'Stop speaking' : 'Speak concept title'}
                  >
                    <MicIcon size={14} />
                  </button>
                </div>

                {isRecordingCustom && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 animate-pulse">
                    Listening via AssemblyAI... Speak your concept title.
                  </p>
                )}
                {isTranscribingCustom && (
                  <p className="text-xs text-blue-600 font-medium mt-1.5 animate-pulse">
                    Transcribing with AssemblyAI...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Subject Domain (Optional)
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder={currentTrack.name}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={!customTitle.trim()}
                className={`w-full py-2.5 rounded-lg font-medium text-xs flex items-center justify-center gap-2 cursor-pointer ${
                  customTitle.trim()
                    ? 'btn-duo-green'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
              >
                <span>Step Up to Teach</span>
                <ArrowRightIcon size={13} />
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-zinc-200 bg-white px-4 py-3.5 text-center text-xs text-zinc-500">
        Protégé Feynman Simulator: The most reliable way to learn is to teach.
      </footer>
    </div>
  );
};
