import React, { useEffect } from 'react';
import { ConceptChallenge, SecondAttemptDiffResult } from '../types';
import { ProtegeMark } from './ProtegeMark';
import {
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  RotateCcwIcon,
  StarXpIcon,
  SpeakerWaveIcon,
  FlameStreakIcon,
} from './Icons';
import { awardConceptMastery, getStoredUserLearningProfile } from '../services/storageService';
import { voiceGuide } from '../services/voiceGuideService';

interface DiffResultViewProps {
  concept: ConceptChallenge;
  diffResult: SecondAttemptDiffResult;
  onNewSession: () => void;
  onTryAnotherConcept: () => void;
}

export const DiffResultView: React.FC<DiffResultViewProps> = ({
  concept,
  diffResult,
  onNewSession,
  onTryAnotherConcept,
}) => {
  const isRepaired = diffResult.repaired;

  useEffect(() => {
    if (isRepaired) {
      awardConceptMastery(concept.id, 50);
      voiceGuide.guideStep('diff-result');
    }
  }, [concept.id, isRepaired]);

  const profile = getStoredUserLearningProfile();

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1E1B18] flex flex-col justify-between selection:bg-[#58CC02]/20 selection:text-[#1E1B18]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b-2 border-[#E5DFD3] border-b-4 border-b-[#D5CDBC] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ProtegeMark size={28} highlight={isRepaired} />
          <div>
            <span className="font-extrabold text-sm tracking-tight text-[#1E1B18] block">
              {isRepaired ? 'Mastery Achieved!' : 'Causal Audit'}
            </span>
            <span className="text-[11px] text-[#7D766C]">
              {concept.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 text-xs font-bold text-[#8F6B00] bg-[#FFFDF0] px-2.5 py-1 rounded-xl border border-[#D4A100]/30">
            <StarXpIcon size={14} />
            <span>+50 XP</span>
          </div>

          <button
            onClick={onNewSession}
            className="btn-duo-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-[#7D766C]"
          >
            <RotateCcwIcon size={13} />
            <span className="hidden sm:inline">Try Again</span>
          </button>
        </div>
      </header>

      {/* Main Diff Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8 w-full flex-1 space-y-8">
        {/* Celebration / Outcome Card */}
        <div className="paper-card p-6 sm:p-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold">
            {isRepaired ? (
              <span className="bg-[#F2FAEC] text-[#46A302] border border-[#58CC02]/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                <CheckCircleIcon size={16} />
                <span>Verified Causal Connection</span>
              </span>
            ) : (
              <span className="bg-[#FFF2F2] text-[#D70015] border border-[#FFD0D0] px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                <AlertCircleIcon size={16} />
                <span>Connection Still Incomplete</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E1B18] tracking-tight font-serif">
            {isRepaired ? (
              <>
                The puzzle piece is <span className="text-[#58CC02]">connected!</span>
              </>
            ) : (
              <>The connection is still missing.</>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
            {diffResult.explanationOfRepair}
          </p>
        </div>

        {/* BEFORE VS AFTER Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Attempt 1 (Before) */}
          <div className="paper-card p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7D766C]">
                Attempt 1 • Before
              </span>
              <span className="text-[10px] font-bold text-[#D70015] bg-[#FFF2F2] px-2 py-0.5 rounded-md">
                Skipped Link
              </span>
            </div>

            <p className="text-xs text-[#4A453E] italic p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DFD3] leading-relaxed">
              &ldquo;{diffResult.beforeSnippet || 'Missing causal explanation'}&rdquo;
            </p>

            <p className="text-[11px] text-[#7D766C]">
              You named the terms, but did not describe the cause connecting them.
            </p>
          </div>

          {/* Attempt 2 (After) */}
          <div className="paper-card p-6 space-y-3 border-2 border-[#58CC02]/40">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#58CC02]">
                Attempt 2 • Repaired
              </span>
              <span className="text-[10px] font-bold text-[#46A302] bg-[#F2FAEC] px-2 py-0.5 rounded-md">
                Connected!
              </span>
            </div>

            <p className="text-xs text-[#1E1B18] font-medium p-3 rounded-2xl bg-[#F2FAEC] border border-[#58CC02]/30 leading-relaxed">
              &ldquo;{diffResult.afterSnippet || diffResult.evidenceQuote}&rdquo;
            </p>

            <p className="text-[11px] text-[#46A302]">
              You explicitly articulated the causal mechanism. Protégé understands!
            </p>
          </div>
        </div>

        {/* Reconstructed Causal Chain */}
        {diffResult.reconstructedChain && diffResult.reconstructedChain.length > 0 && (
          <div className="paper-card p-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#58CC02] block">
              Complete Causal Circuit
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {diffResult.reconstructedChain.map((node, i) => (
                <React.Fragment key={i}>
                  <div className="px-3.5 py-2 rounded-2xl bg-[#FAF7F0] border-2 border-[#E5DFD3] text-xs font-bold text-[#1E1B18] shadow-xs">
                    {node}
                  </div>
                  {i < diffResult.reconstructedChain.length - 1 && (
                    <ArrowRightIcon size={14} className="text-[#58CC02]" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-[#E5DFD3]">
          <button
            onClick={onNewSession}
            className="btn-duo-white w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcwIcon size={14} />
            <span>Practice Another Explanation</span>
          </button>

          <button
            onClick={onTryAnotherConcept}
            className="btn-duo-green w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>Choose Next Unit to Master</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#E5DFD3] bg-[#FFFFFF] px-4 py-3 text-center text-xs text-[#7D766C]">
        Streak active • <strong className="text-[#1E1B18]">{profile.streakDays} days in a row!</strong>
      </footer>
    </div>
  );
};
