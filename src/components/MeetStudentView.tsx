import React, { useEffect } from 'react';
import { ConceptChallenge } from '../types';
import { ProtegeMark } from './ProtegeMark';
import { AliveOrb } from './AliveOrb';
import { ArrowLeftIcon, ArrowRightIcon, SpeakerWaveIcon, SparkleIcon, PencilQuillIcon } from './Icons';
import { getStoredUserLearningProfile } from '../services/storageService';
import { voiceGuide } from '../services/voiceGuideService';

interface MeetStudentViewProps {
  concept: ConceptChallenge;
  onReady: () => void;
  onBack: () => void;
}

export const MeetStudentView: React.FC<MeetStudentViewProps> = ({ concept, onReady, onBack }) => {
  const profile = getStoredUserLearningProfile();
  const learnerName = profile.name || 'Teacher';

  useEffect(() => {
    voiceGuide.guideStep('meet-student', { conceptTitle: concept.title });
  }, [concept]);

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1E1B18] flex flex-col justify-between selection:bg-[#58CC02]/20 selection:text-[#1E1B18]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b-2 border-[#E5DFD3] border-b-4 border-b-[#D5CDBC] px-4 sm:px-8 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="btn-duo-white px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeftIcon size={14} />
          <span>Change Topic</span>
        </button>

        <div className="flex items-center gap-2">
          <ProtegeMark size={28} highlight />
          <span className="font-extrabold text-sm tracking-tight text-[#1E1B18]">
            Meeting Your Protégé
          </span>
        </div>

        <button
          onClick={() => voiceGuide.guideStep('meet-student', { conceptTitle: concept.title })}
          className="btn-duo-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-[#1CB0F6]"
          title="Replay spoken greeting"
        >
          <SpeakerWaveIcon size={14} />
          <span className="hidden sm:inline">Hear Greeting</span>
        </button>
      </header>

      {/* Main Meet Card */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 flex flex-col justify-center items-center text-center">
        {/* ChatGPT Style Voice Orb */}
        <div className="mb-6 flex justify-center">
          <AliveOrb state="idle" size={130} />
        </div>

        {/* Mascot Speech Bubble */}
        <div className="relative bg-[#FFFFFF] border-2 border-[#E5DFD3] border-b-4 border-[#D5CDBC] rounded-3xl p-6 sm:p-7 text-center mb-6 w-full shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#58CC02] bg-[#F2FAEC] px-3 py-0.5 rounded-full border border-[#58CC02]/30 inline-block mb-3">
            Unit: {concept.title}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E1B18] font-serif leading-snug">
            “Hi {learnerName}! I know nothing about {concept.title}.”
          </h1>
          <p className="text-xs sm:text-sm text-[#4A453E] mt-2 leading-relaxed">
            I don&apos;t have textbooks or internet tabs open. I will only understand what you explain to me right now.
          </p>
        </div>

        {/* Friendly Guidelines in Plain English */}
        <div className="paper-card p-5 sm:p-6 w-full text-left space-y-3.5 mb-8">
          <div className="text-xs font-bold uppercase tracking-wider text-[#7D766C] flex items-center gap-2">
            <PencilQuillIcon size={15} className="text-[#58CC02]" />
            <span>How This Session Works</span>
          </div>

          <div className="space-y-2.5 text-xs text-[#4A453E] leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#EBF7FF] text-[#1899D6] font-bold flex items-center justify-center shrink-0 text-[11px]">
                1
              </span>
              <span>
                <strong className="text-[#1E1B18]">Use simple words:</strong> Avoid relying on fancy jargon. If you use a technical term, explain what it means in everyday language.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#F2FAEC] text-[#46A302] font-bold flex items-center justify-center shrink-0 text-[11px]">
                2
              </span>
              <span>
                <strong className="text-[#1E1B18]">Connect cause and effect:</strong> Explain what happens first, why it happens, and what happens as a result.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#FFF8EE] text-[#CC7800] font-bold flex items-center justify-center shrink-0 text-[11px]">
                3
              </span>
              <span>
                <strong className="text-[#1E1B18]">Speak or type freely:</strong> Your speech will be transcribed cleanly by AssemblyAI. Speak naturally!
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onReady}
          id="ready-to-teach-button"
          className="btn-duo-green w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
        >
          <span>Step Up & Start Teaching</span>
          <ArrowRightIcon size={16} />
        </button>
      </main>

      {/* Simple Footer */}
      <footer className="border-t-2 border-[#E5DFD3] bg-[#FFFFFF] px-4 py-3 text-center text-xs text-[#7D766C]">
        Topic: <strong className="text-[#1E1B18]">{concept.title}</strong>
      </footer>
    </div>
  );
};
