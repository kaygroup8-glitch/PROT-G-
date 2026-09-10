import React, { useState, useEffect, useRef } from 'react';
import { ProtegeMark } from './ProtegeMark';
import { ArrowRightIcon, ArrowLeftIcon, SparkleIcon, BookOpenIcon, LeafIcon, RocketIcon, ScaleCoinsIcon } from './Icons';
import { UserProfile, saveStoredProfile } from '../services/userProfile';
import { saveStoredUserLearningProfile, getStoredUserLearningProfile } from '../services/storageService';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [focusGoal, setFocusGoal] = useState('Deep Understanding');
  const [preferredDomain, setPreferredDomain] = useState('Science & Physics');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && step === 1) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const teacherName = name.trim() || 'Teacher';
      const profile: UserProfile = {
        name: teacherName,
        focusGoal,
        preferredDomain,
        experienceLevel: 'Curious Learner',
        createdAt: new Date().toISOString(),
      };
      saveStoredProfile(profile);

      // Also update storageService state
      const learningState = getStoredUserLearningProfile();
      learningState.name = teacherName;
      learningState.focusGoal = focusGoal;
      saveStoredUserLearningProfile(learningState);

      onComplete(profile);
    }
  };

  const goals = [
    {
      id: 'Deep Understanding',
      title: 'Deep Understanding',
      desc: 'Master hard concepts by explaining them simply without jargon.',
      icon: <SparkleIcon size={18} className="text-[#FF9600]" />,
    },
    {
      id: 'First-Principles Communication',
      title: 'Clear Communication',
      desc: 'Practice explaining complex ideas clearly to anyone.',
      icon: <BookOpenIcon size={18} className="text-[#1CB0F6]" />,
    },
    {
      id: 'Exam & Interview Prep',
      title: 'Exam & Interview Prep',
      desc: 'Discover your blind spots before your test or technical interview.',
      icon: <RocketIcon size={18} className="text-[#58CC02]" />,
    },
  ];

  const domains = [
    {
      id: 'Tech, AI & Cryptography',
      title: 'Tech, AI & Cryptography',
      desc: 'Public key padlocks, LLM transformer tokens, distributed consensus',
      icon: <RocketIcon size={18} className="text-[#1CB0F6]" />,
    },
    {
      id: 'Science, Physics & Space',
      title: 'Science, Physics & Space',
      desc: 'Rocket propulsion in vacuum, Doppler cosmic redshift, quantum waves',
      icon: <SparkleIcon size={18} className="text-[#FF9600]" />,
    },
    {
      id: 'Biology, Medicine & Neuroscience',
      title: 'Biology, Medicine & Neuroscience',
      desc: 'Photosynthesis solar energy, mRNA immune memory, neuron synapses',
      icon: <LeafIcon size={18} className="text-[#58CC02]" />,
    },
    {
      id: 'Economics, Markets & Human Systems',
      title: 'Economics, Markets & Human Systems',
      desc: 'Supply-demand price discovery, exponential compounding, banking credit',
      icon: <ScaleCoinsIcon size={18} className="text-[#AF52DE]" />,
    },
    {
      id: 'Philosophy, Logic & First Principles',
      title: 'Philosophy, Logic & First Principles',
      desc: 'Bayesian probability updating, the hard problem of consciousness, Occam’s razor',
      icon: <BookOpenIcon size={18} className="text-[#FF4B4B]" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FFFFFF] border-2 border-[#E5DFD3] border-b-6 border-[#D5CDBC] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#1E1B18]"
        role="dialog"
        aria-modal="true"
      >
        {/* Step Progress Bar (Duolingo Style) */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2.5 rounded-full flex-1 transition-all duration-300 ${
                s <= step ? 'bg-[#58CC02]' : 'bg-[#E5DFD3]'
              }`}
            />
          ))}
        </div>

        {/* Mascot / Protégé Speech Bubble */}
        <div className="flex items-start gap-3.5 mb-6">
          <ProtegeMark size={42} highlight />
          <div className="relative bg-[#FAF7F0] border-2 border-[#E5DFD3] rounded-2xl p-3.5 text-xs text-[#1E1B18] shadow-xs flex-1">
            <span className="font-bold text-[#58CC02] block mb-0.5">Your Protégé</span>
            {step === 1 && "Hi! I know nothing until you teach me. What should I call you?"}
            {step === 2 && "Nice to meet you! What would you like to achieve today?"}
            {step === 3 && "What kind of topics would you love to start teaching?"}
            {/* Speech bubble tail */}
            <div className="absolute -left-2 top-3 w-3 h-3 bg-[#FAF7F0] border-l-2 border-b-2 border-[#E5DFD3] rotate-45" />
          </div>
        </div>

        {/* STEP 1: Name */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7D766C] mb-2">
                Your Name or Nickname
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                placeholder="e.g. Alex, Sam, Prof. Feynman"
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5DFD3] bg-[#FAF7F0] text-sm text-[#1E1B18] placeholder-[#A59F94] focus:outline-none focus:border-[#58CC02] focus:bg-white transition-all font-medium"
              />
            </div>
            <p className="text-xs text-[#7D766C]">
              Your student will address you by this name during your teaching sessions.
            </p>
          </div>
        )}

        {/* STEP 2: Goal */}
        {step === 2 && (
          <div className="space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#7D766C] mb-1">
              Select Your Learning Goal
            </span>
            {goals.map((g) => {
              const isSelected = focusGoal === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => setFocusGoal(g.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                    isSelected
                      ? 'bg-[#F2FAEC] border-[#58CC02] border-b-4 shadow-xs'
                      : 'bg-[#FFFFFF] border-[#E5DFD3] hover:bg-[#FAF7F0]'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-[#E5DFD3] shrink-0">
                    {g.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#1E1B18]">{g.title}</div>
                    <div className="text-[11px] text-[#7D766C] leading-snug mt-0.5">{g.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 3: Domain */}
        {step === 3 && (
          <div className="space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#7D766C] mb-1">
              Favorite Subject Area
            </span>
            {domains.map((d) => {
              const isSelected = preferredDomain === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setPreferredDomain(d.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                    isSelected
                      ? 'bg-[#F2FAEC] border-[#58CC02] border-b-4 shadow-xs'
                      : 'bg-[#FFFFFF] border-[#E5DFD3] hover:bg-[#FAF7F0]'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-[#E5DFD3] shrink-0">
                    {d.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#1E1B18]">{d.title}</div>
                    <div className="text-[11px] text-[#7D766C] leading-snug mt-0.5">{d.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 pt-4 border-t border-[#E5DFD3] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-duo-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeftIcon size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="btn-duo-green px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <span>{step === 3 ? "Let's Get Started!" : 'Continue'}</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
