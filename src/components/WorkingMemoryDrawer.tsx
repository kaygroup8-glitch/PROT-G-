import React from 'react';
import { X, BookOpen, GitCommit, HelpCircle, AlertTriangle, Cpu } from 'lucide-react';
import { StudentMentalModel } from '../types';

interface WorkingMemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mentalModel: StudentMentalModel | null;
  conceptTitle: string;
}

export const WorkingMemoryDrawer: React.FC<WorkingMemoryDrawerProps> = ({
  isOpen,
  onClose,
  mentalModel,
  conceptTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
      />

      <div className="relative z-10 w-full max-w-md bg-[#FAF8F5] border-l border-[#E8E2D8] shadow-2xl flex flex-col text-[#1D1B18]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E2D8] bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FAF5EE] text-[#B45309] border border-[#E8E2D8]">
              <Cpu size={18} />
            </div>
            <div>
              <div className="text-[10px] tracking-widest uppercase text-[#78716C] font-mono font-medium">
                Active Working Memory HUD
              </div>
              <h3 className="text-base font-semibold text-[#1D1B18] mt-0.5 truncate max-w-[240px]">
                {conceptTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#78716C] hover:text-[#1D1B18] hover:bg-[#EFEAE2] transition-colors"
            aria-label="Close working memory drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Prime Directive Notice */}
          <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E8E2D8] text-xs text-[#57534E] leading-relaxed">
            <strong className="font-semibold text-[#1D1B18] block mb-1">
              Deliberately Limited Student State:
            </strong>
            Protégé possesses zero pre-loaded domain knowledge for this session. It only retains premises you explicitly communicate.
          </div>

          {/* Current Curiosity */}
          {mentalModel?.currentCuriosity && (
            <div className="p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#B45309] uppercase tracking-wider mb-1.5 font-mono">
                <HelpCircle size={14} /> Active Curiosity
              </div>
              <p className="text-[#1D1B18] font-medium leading-relaxed italic">
                &quot;{mentalModel.currentCuriosity}&quot;
              </p>
            </div>
          )}

          {/* Explicitly Taught Facts */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-3 font-mono">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-[#059669]" />
                <span>Explicitly Taught</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-[10px]">
                {mentalModel?.explicitlyTaught?.length || 0}
              </span>
            </div>
            {!mentalModel?.explicitlyTaught || mentalModel.explicitlyTaught.length === 0 ? (
              <p className="text-xs text-[#78716C] italic">No premises explicitly recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {mentalModel.explicitlyTaught.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-[#E8E2D8] shadow-xs"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] mt-1.5 shrink-0" />
                      <p className="text-[#1D1B18] font-medium text-xs sm:text-sm leading-snug">
                        {item.fact}
                      </p>
                    </div>
                    {item.quote && (
                      <p className="text-[11px] text-[#78716C] mt-2 pt-2 border-t border-[#F0EBE1] font-mono italic">
                        Quote: &quot;{item.quote}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inferred Connections */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-3 font-mono">
              <div className="flex items-center gap-2">
                <GitCommit size={14} className="text-[#0284C7]" />
                <span>Inferred Connections</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD] text-[10px]">
                {mentalModel?.inferredConnections?.length || 0}
              </span>
            </div>
            {!mentalModel?.inferredConnections || mentalModel.inferredConnections.length === 0 ? (
              <p className="text-xs text-[#78716C] italic">No connections inferred yet.</p>
            ) : (
              <div className="space-y-2.5">
                {mentalModel.inferredConnections.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#E8E2D8] shadow-xs">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] mt-1.5 shrink-0" />
                      <p className="text-[#1D1B18] text-xs sm:text-sm">{item.connection}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detected Contradictions */}
          {mentalModel?.detectedContradictions && mentalModel.detectedContradictions.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-rose-700 mb-3 font-mono">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>Contradictions / Conflicts</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px]">
                  {mentalModel.detectedContradictions.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {mentalModel.detectedContradictions.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                    <p className="text-rose-900 text-xs sm:text-sm font-medium">{item.conflict}</p>
                    {item.quote && (
                      <p className="text-[11px] text-rose-700 mt-1.5 pt-1.5 border-t border-rose-200 font-mono italic">
                        Quote: &quot;{item.quote}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
