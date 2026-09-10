import React, { useState, useEffect } from 'react';
import { ConceptChallenge, ConversationTurn, ReconstructionResult } from '../types';
import { ProtegeMark } from './ProtegeMark';
import {
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  RotateCcwIcon,
  BookOpenIcon,
  SpeakerWaveIcon,
  QuoteIcon,
  PencilQuillIcon,
} from './Icons';
import { voiceGuide } from '../services/voiceGuideService';

interface ReconstructionViewProps {
  concept: ConceptChallenge;
  report: ReconstructionResult;
  history: ConversationTurn[];
  onReteachGap: () => void;
  onRestart: () => void;
}

export const ReconstructionView: React.FC<ReconstructionViewProps> = ({
  concept,
  report,
  history,
  onReteachGap,
  onRestart,
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const missing = report.missingRelationship;
  const isFullChain = report.verdict === 'FULL_CAUSAL_CHAIN_ESTABLISHED';

  useEffect(() => {
    voiceGuide.guideStep('reconstruction');
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1E1B18] flex flex-col justify-between selection:bg-[#58CC02]/20 selection:text-[#1E1B18]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b-2 border-[#E5DFD3] border-b-4 border-b-[#D5CDBC] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ProtegeMark size={28} highlight />
          <div>
            <span className="font-extrabold text-sm tracking-tight text-[#1E1B18] block">
              Protégé&apos;s Notebook
            </span>
            <span className="text-[11px] text-[#7D766C]">
              {concept.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => voiceGuide.guideStep('reconstruction')}
            className="btn-duo-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-[#1CB0F6]"
            title="Hear notes read aloud"
          >
            <SpeakerWaveIcon size={14} />
            <span className="hidden sm:inline">Hear Notes</span>
          </button>

          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="btn-duo-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpenIcon size={14} />
            <span>{showTranscript ? 'Hide Transcript' : 'Transcript'}</span>
          </button>

          <button
            onClick={onRestart}
            className="btn-duo-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-[#7D766C]"
          >
            <RotateCcwIcon size={14} />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </header>

      {/* Main Notebook */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 w-full flex-1 space-y-8">
        {/* Headline Card */}
        <div className="paper-card p-6 sm:p-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold">
            {isFullChain ? (
              <span className="bg-[#F2FAEC] text-[#46A302] border border-[#58CC02]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircleIcon size={14} />
                <span>Complete Understanding Established!</span>
              </span>
            ) : (
              <span className="bg-[#FFF8EE] text-[#CC7800] border border-[#FF9600]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <AlertCircleIcon size={14} />
                <span>One Missing Causal Bridge Detected</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E1B18] tracking-tight font-serif">
            {isFullChain ? (
              "You explained every piece and how they connect!"
            ) : (
              <>You explained the pieces, but skipped the bridge between them.</>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
            {report.summary || "Here is exactly how your apprentice reconstructed your lesson."}
          </p>
        </div>

        {/* Protégé Synthesis Speech Box */}
        <div className="paper-card p-6 border-l-6 border-l-[#58CC02] space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#58CC02] flex items-center gap-1.5">
            <PencilQuillIcon size={14} />
            <span>Protégé&apos;s Summary of Your Words:</span>
          </div>
          <p className="text-xs sm:text-sm text-[#1E1B18] leading-relaxed italic">
            &ldquo;{report.studentSynthesis}&rdquo;
          </p>
        </div>

        {/* Two Notebook Sections: Pieces Taught vs Missing Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Column 1: What Came Through */}
          <div className="paper-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#58CC02] flex items-center gap-1.5">
                <CheckCircleIcon size={15} />
                <span>What I Understood</span>
              </span>
              <span className="text-[11px] font-bold text-[#7D766C]">
                {report.piecesExplained.filter((p) => p.status === 'explained').length} of {report.piecesExplained.length} parts
              </span>
            </div>

            <div className="space-y-3">
              {report.piecesExplained.map((piece) => {
                const isClear = piece.status === 'explained';
                return (
                  <div
                    key={piece.nodeId}
                    className={`p-3.5 rounded-2xl border-2 transition-all ${
                      isClear ? 'bg-[#F2FAEC] border-[#58CC02]/40' : 'bg-[#FAF7F0] border-[#E5DFD3]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E1B18]">{piece.label}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isClear ? 'bg-white text-[#46A302]' : 'bg-white text-[#7D766C]'
                        }`}
                      >
                        {isClear ? 'Explained' : 'Missing'}
                      </span>
                    </div>
                    {piece.evidenceQuote && (
                      <p className="text-[11px] text-[#4A453E] mt-1.5 line-clamp-2 italic">
                        &ldquo;{piece.evidenceQuote}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: The Missing Causal Link */}
          <div className="paper-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF9600] flex items-center gap-1.5">
                <AlertCircleIcon size={15} />
                <span>The Missing Connection</span>
              </span>
              <span className="text-[11px] font-bold text-[#CC7800] bg-[#FFF8EE] px-2 py-0.5 rounded-full">
                Key Gap
              </span>
            </div>

            {missing ? (
              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl bg-[#FFF8EE] border-2 border-[#FF9600]/40 space-y-2">
                  <div className="text-xs font-bold text-[#CC7800]">
                    {missing.fromLabel} ➔ {missing.toLabel}
                  </div>
                  <h4 className="text-sm font-bold text-[#1E1B18]">{missing.gapTitle}</h4>
                  <p className="text-xs text-[#4A453E] leading-relaxed">{missing.gapDescription}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DFD3] text-xs text-[#4A453E] space-y-1">
                  <span className="font-bold text-[#1E1B18] block">Where I got confused:</span>
                  <p className="italic leading-relaxed">&ldquo;{missing.studentConfusionRationale}&rdquo;</p>
                </div>

                {missing.directEvidenceQuote && (
                  <div className="text-[11px] text-[#7D766C]">
                    <span className="font-bold">What you said: </span>
                    <span className="italic">&ldquo;{missing.directEvidenceQuote}&rdquo;</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-[#46A302] p-4 bg-[#F2FAEC] rounded-2xl border border-[#58CC02]/30">
                All causal bridges were articulated in your explanation!
              </div>
            )}
          </div>
        </div>

        {/* Expandable Transcript */}
        {showTranscript && (
          <div className="paper-card p-6 space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7D766C]">
              Your Teaching Transcript
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {history.map((turn, i) => (
                <div
                  key={turn.id || i}
                  className={`p-3 rounded-2xl text-xs ${
                    turn.role === 'user'
                      ? 'bg-[#F2FAEC] border border-[#58CC02]/30 text-[#1E1B18]'
                      : 'bg-[#FAF7F0] border border-[#E5DFD3] text-[#4A453E]'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                    {turn.role === 'user' ? 'You (Teacher)' : 'Protégé'}
                  </span>
                  <p className="leading-relaxed">{turn.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Duolingo Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-[#E5DFD3]">
          <div className="text-xs text-[#7D766C] text-center sm:text-left">
            {isFullChain ? 'You nailed the explanation.' : 'One short explanation to close the loop!'}
          </div>

          <button
            onClick={onReteachGap}
            id="reteach-gap-button"
            className="btn-duo-green w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
          >
            <span>{isFullChain ? 'Review Causal Mastery' : 'Bridge the Missing Gap (+50 XP)'}</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#E5DFD3] bg-[#FFFFFF] px-4 py-3 text-center text-xs text-[#7D766C]">
        Topic: <strong className="text-[#1E1B18]">{concept.title}</strong>
      </footer>
    </div>
  );
};
