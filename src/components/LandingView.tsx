import React, { useState, useEffect } from 'react';
import { ProtegeMark } from './ProtegeMark';
import { AliveOrb } from './AliveOrb';
import { CURATED_CONCEPTS, DOMAIN_TRACKS } from '../data/curatedConcepts';
import { ConceptChallenge } from '../types';
import {
  FlameStreakIcon,
  StarXpIcon,
  SpeakerWaveIcon,
  SpeakerMuteIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  BookOpenIcon,
  MicIcon,
  SparkleIcon,
} from './Icons';
import {
  getStoredUserLearningProfile,
  toggleVoiceGuideSetting,
  UserLearningProfile,
} from '../services/storageService';
import { voiceGuide } from '../services/voiceGuideService';

interface LandingViewProps {
  onBegin: () => void;
  onSelectConcept: (concept: ConceptChallenge) => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
  onOpenOnboarding: () => void;
  onOpenHistory?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onBegin,
  onSelectConcept,
  onOpenLegal,
  onOpenOnboarding,
  onOpenHistory,
}) => {
  const [profile, setProfile] = useState<UserLearningProfile>(getStoredUserLearningProfile());
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(profile.voiceGuideEnabled);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    setProfile(getStoredUserLearningProfile());

    const unsubscribe = voiceGuide.subscribe((speaking) => {
      setIsVoiceSpeaking(speaking);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleVoice = () => {
    const updated = toggleVoiceGuideSetting();
    setVoiceEnabled(updated);
    if (updated) {
      voiceGuide.speak(
        `Voice guidance enabled. Explain concepts to me naturally, and I will show you what I understand.`,
        true
      );
    } else {
      voiceGuide.stop();
    }
  };

  const handleHearIntroduction = () => {
    voiceGuide.speak(
      `Hello. I am Protégé. I have zero textbooks and no assumptions. When you explain a topic to me, I map your reasoning and ask targeted questions to test where the causal chain breaks. Choose any concept to begin.`,
      true
    );
  };

  const categories = ['All', 'Tech & AI', 'Science & Physics', 'Biology & Medicine', 'Economics & Markets', 'Philosophy & Logic'];

  const filteredConcepts = CURATED_CONCEPTS.filter((concept) => {
    if (selectedCategory === 'All') return true;
    return concept.domain.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#09090B] flex flex-col justify-between selection:bg-zinc-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <ProtegeMark size={28} highlight />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-900">PROTÉGÉ</span>
              <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                Feynman Engine
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 hidden sm:block">
              Socratic Active Recall Assistant
            </span>
          </div>
        </div>

        {/* Header Actions & Metrics */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* History */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="btn-duo-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer text-zinc-700 hover:text-zinc-900"
              title="View your saved teaching history"
            >
              <BookOpenIcon size={14} className="text-zinc-600" />
              <span className="hidden sm:inline">History</span>
            </button>
          )}

          {/* Voice Guide Toggle */}
          <button
            onClick={handleToggleVoice}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer border transition-colors ${
              voiceEnabled
                ? 'bg-zinc-100 text-zinc-900 border-zinc-300'
                : 'bg-white text-zinc-400 border-zinc-200'
            }`}
            title={voiceEnabled ? 'Mute voice audio' : 'Enable voice audio'}
          >
            {voiceEnabled ? (
              <>
                <SpeakerWaveIcon size={14} className="text-zinc-800" />
                <span className="hidden sm:inline">Voice On</span>
              </>
            ) : (
              <>
                <SpeakerMuteIcon size={14} className="text-zinc-400" />
                <span className="hidden sm:inline">Voice Off</span>
              </>
            )}
          </button>

          {/* Daily Streak */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-800"
            title="Teaching Streak"
          >
            <FlameStreakIcon size={14} className="text-amber-600" />
            <span>{profile.streakDays}d</span>
          </div>

          {/* XP */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-800"
            title="Mastery Points"
          >
            <StarXpIcon size={14} className="text-amber-500" />
            <span>{profile.totalXp} XP</span>
          </div>

          {/* Start CTA */}
          <button
            onClick={onBegin}
            className="btn-duo-green hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
          >
            <span>Start Session</span>
            <ArrowRightIcon size={13} />
          </button>
        </div>
      </header>

      {/* Main Experience */}
      <main className="w-full flex-1 flex flex-col items-center">
        {/* =========================================================================
            HERO SECTION: High-density, professional typography with direct value prop
            ========================================================================= */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8 flex flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-xs text-xs text-zinc-700 mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-zinc-900">Socratic Method</span>
            <span className="text-zinc-300">/</span>
            <span>Speech Recognition via AssemblyAI</span>
          </div>

          {/* Direct, professional headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-950 max-w-3xl leading-tight">
            Master any concept by teaching it.
          </h1>

          {/* Clear, concise subtitle without fluff or em dashes */}
          <p className="mt-4 text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Explain complex topics in plain language. Protégé acts as an apprentice with zero prior knowledge: reconstructing your logic, exposing gaps, and asking targeted questions until full understanding is reached.
          </p>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center">
            <button
              onClick={onBegin}
              id="hero-begin-button"
              className="btn-duo-green w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm shadow-sm cursor-pointer"
            >
              <span>Choose a Topic to Teach</span>
              <ArrowRightIcon size={15} />
            </button>

            <button
              onClick={handleHearIntroduction}
              className="btn-duo-white w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm cursor-pointer"
            >
              <SpeakerWaveIcon size={15} className="text-zinc-700" />
              <span>Listen to Voice Intro</span>
            </button>
          </div>

          {/* =========================================================================
              STUDIO INTERACTIVE PREVIEW CARD (Real product snapshot with real imagery)
              ========================================================================= */}
          <div className="w-full max-w-5xl mt-10 rounded-xl border border-zinc-200 bg-white shadow-md overflow-hidden text-left">
            {/* Window Top Bar */}
            <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="text-xs font-mono text-zinc-500 ml-2">protege.session // biology.photosynthesis</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>AssemblyAI Universal-2 Active</span>
              </div>
            </div>

            {/* Session Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
              {/* Concept Visual Panel (4 cols) */}
              <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-zinc-50/50">
                <div>
                  <div className="relative rounded-lg overflow-hidden border border-zinc-200 mb-3 aspect-video bg-zinc-100">
                    <img
                      src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80"
                      alt="Chloroplast cellular structure"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded">
                      Curated Foundation
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Biology & Cellular Energy
                    </span>
                    <h3 className="text-base font-bold text-zinc-900">Photosynthesis & Solar Energy</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      How chloroplasts convert photons, water, and CO2 into chemical glucose and oxygen without external heat.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-200">
                  <div className="text-[11px] font-medium text-zinc-500 mb-1.5">Core Causal Requirements:</div>
                  <ul className="text-xs text-zinc-700 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <span>1. Photon capture & H2O photolysis</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <span>2. ATP & NADPH electron transport</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <span>3. Calvin cycle carbon fixation</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Socratic Exchange Preview (8 cols) */}
              <div className="lg:col-span-8 p-5 space-y-3">
                {/* Step 1: User Voice Explanation */}
                <div className="p-3.5 rounded-lg border border-zinc-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                      <MicIcon size={14} className="text-zinc-700" />
                      <span>Your Spoken Explanation</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">14.2s recorded</span>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed italic bg-zinc-50 p-2.5 rounded border border-zinc-100">
                    &ldquo;Plants take sunlight through green leaves, using the energy to combine carbon dioxide from the air into glucose sugar for food.&rdquo;
                  </p>
                </div>

                {/* Step 2: Protégé Reconstruction */}
                <div className="p-3.5 rounded-lg border border-zinc-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                      <ProtegeMark size={16} highlight={false} />
                      <span>Protégé Reconstruction</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">1 Missing Link Detected</span>
                  </div>
                  <div className="text-xs text-zinc-700 space-y-1">
                    <p>
                      <strong className="text-zinc-900">Grasped:</strong> Sunlight provides the activation energy; CO2 is converted to sugar.
                    </p>
                    <p className="text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 text-xs">
                      <strong>Gap:</strong> How does the plant acquire hydrogen atoms to form carbohydrates without splitting water?
                    </p>
                  </div>
                </div>

                {/* Step 3: Targeted Inquiry */}
                <div className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-900 text-white space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <SparkleIcon size={13} className="text-emerald-400" />
                      <span>Protégé Inquires</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Stage 2 of 3</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                    &ldquo;If light only brings energy and carbon dioxide provides carbon and oxygen, where do the hydrogen protons come from to assemble the glucose molecule?&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            STUDIO HIGHLIGHT: Interactive Voice Apprentice with Living Orb
            ========================================================================= */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            {/* The Living Voice Orb */}
            <div className="flex flex-col items-center justify-center p-2 shrink-0">
              <AliveOrb
                state={isVoiceSpeaking ? 'speaking' : 'idle'}
                volume={isVoiceSpeaking ? 0.65 : 0.08}
                size={110}
              />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-2.5">
                {isVoiceSpeaking ? 'Protégé Speaking...' : 'Apprentice Listening'}
              </span>
            </div>

            {/* Voice Console Explanatory Details */}
            <div className="flex-1 space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
                <MicIcon size={13} />
                <span>Zero-Fallback AssemblyAI Universal-2 Pipeline</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
                An AI apprentice that learns from your words.
              </h2>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Standard AI models evaluate answers against rigid rubrics. Protégé takes the inverse approach: it begins with an unformed mental model. Your explanations build its internal comprehension step by step, exposing whether you truly understand the underlying mechanism.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleHearIntroduction}
                  className="btn-duo-blue px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <SpeakerWaveIcon size={14} />
                  <span>Test Voice Response</span>
                </button>

                <button
                  onClick={onBegin}
                  className="btn-duo-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Select Curriculum</span>
                  <ArrowRightIcon size={13} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            THE 4-STEP FEYNMAN LOOP: Clean, balanced, minimal card row
            ========================================================================= */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 border-t border-zinc-200 text-left">
          <div className="mb-6">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Methodology
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 mt-1">
              How the Feynman Loop Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              Four structured phases to turn passive recall into solid causal understanding.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="paper-card p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-bold text-xs mb-2">
                  1
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">Choose a Concept</h4>
                <p className="text-xs text-zinc-600 leading-relaxed mt-1">
                  Select a foundation from physics, computing, biology, economics, or philosophy.
                </p>
              </div>
              <div className="text-[10px] font-mono text-zinc-400">01 // TARGET</div>
            </div>

            <div className="paper-card p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-bold text-xs mb-2">
                  2
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">Explain in Plain Words</h4>
                <p className="text-xs text-zinc-600 leading-relaxed mt-1">
                  Speak into your microphone or type. Focus on causes and effects without jargon.
                </p>
              </div>
              <div className="text-[10px] font-mono text-zinc-400">02 // EXPLAIN</div>
            </div>

            <div className="paper-card p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-bold text-xs mb-2">
                  3
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">Address Questions</h4>
                <p className="text-xs text-zinc-600 leading-relaxed mt-1">
                  Protégé asks targeted questions to clarify where your mechanical logic was unclear.
                </p>
              </div>
              <div className="text-[10px] font-mono text-zinc-400">03 // SOCRATIC</div>
            </div>

            <div className="paper-card p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-bold text-xs mb-2">
                  4
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">Close the Causal Gap</h4>
                <p className="text-xs text-zinc-600 leading-relaxed mt-1">
                  Teach the specific missing step. Once completed, your mastery record is saved locally.
                </p>
              </div>
              <div className="text-[10px] font-mono text-zinc-400">04 // MASTERY</div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CURATED FOUNDATIONS (With Real Editorial Images)
            ========================================================================= */}
        <section id="foundations" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 border-t border-zinc-200 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 gap-4">
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Curricula
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-950 mt-1">
                Explore Foundational Concepts
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                Select any subject to begin a structured teaching session.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Cards Grid with Real Photography */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConcepts.map((concept) => {
              const isMastered = profile.completedConceptIds.includes(concept.id);

              return (
                <div
                  key={concept.id}
                  onClick={() => onSelectConcept(concept)}
                  className="paper-card overflow-hidden flex flex-col justify-between hover:border-zinc-300 transition-all cursor-pointer group"
                >
                  {/* Real Editorial Image Thumbnail */}
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
                        {concept.domain.split(',')[0]}
                      </div>
                      {isMastered && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                          <CheckCircleIcon size={11} />
                          <span>Mastered</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">
                        Stage {concept.stage || 1}
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-zinc-700 transition-colors leading-snug mt-0.5">
                        {concept.title}
                      </h3>
                      <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2 mt-1">
                        {concept.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-900">
                      <span>Start Session</span>
                      <ArrowRightIcon size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={onBegin}
              className="btn-duo-white px-6 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>View Full Roadmaps & Custom Topics</span>
              <ArrowRightIcon size={13} />
            </button>
          </div>
        </section>
      </main>

      {/* Clean Technical Footer */}
      <footer className="border-t border-zinc-200 bg-white px-4 sm:px-8 py-5 mt-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ProtegeMark size={18} highlight />
            <span className="font-semibold text-zinc-900">PROTÉGÉ</span>
            <span>/ Socratic Learning Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>

          <div className="text-zinc-400">
            Session history stored locally on device.
          </div>
        </div>
      </footer>
    </div>
  );
};
