import React, { useState, useEffect } from 'react';
import { TeachingSessionRecord, ConversationTurn } from '../types';
import {
  getStoredTeachingSessions,
  deleteStoredTeachingSession,
  clearStoredTeachingSessions,
} from '../services/storageService';
import { soundService } from '../services/soundService';
import {
  BookOpenIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  RotateCcwIcon,
  SparklesIcon,
  XIcon,
  SearchIcon,
  TrashIcon,
  MicIcon,
  PencilQuillIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from './Icons';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConceptToTeach?: (conceptId: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectConceptToTeach,
}) => {
  const [sessions, setSessions] = useState<TeachingSessionRecord[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const loadSessions = () => {
    const list = getStoredTeachingSessions();
    setSessions(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesDomain = selectedDomain === 'All' || s.domain === selectedDomain;
    const matchesSearch =
      !searchQuery.trim() ||
      s.conceptTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.missingGapTitle && s.missingGapTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  const domains = ['All', ...Array.from(new Set(sessions.map((s) => s.domain).filter(Boolean)))];

  const totalMastered = sessions.filter((s) => s.verdict === 'FULL_CAUSAL_CHAIN_ESTABLISHED').length;
  const totalTurns = sessions.reduce((acc, s) => acc + (s.turnsCount || s.turns?.length || 0), 0);
  const totalXp = sessions.reduce((acc, s) => acc + (s.xpEarned || 50), 0);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playSoftClick();
    if (window.confirm('Delete this session from your device history?')) {
      deleteStoredTeachingSession(id);
      loadSessions();
    }
  };

  const handleClearAll = () => {
    soundService.playSoftClick();
    if (window.confirm('Are you sure you want to clear all teaching history stored on this device?')) {
      clearStoredTeachingSessions();
      loadSessions();
    }
  };

  const handleReteach = (conceptId: string) => {
    soundService.playSoftClick();
    onClose();
    if (onSelectConceptToTeach) {
      onSelectConceptToTeach(conceptId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1E1B18]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F0] border-2 border-[#E5DFD3] border-b-6 border-b-[#D5CDBC] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-white border-b-2 border-[#E5DFD3] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#58CC02]/15 border border-[#58CC02]/30 flex items-center justify-center text-[#46A302]">
              <BookOpenIcon size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#1E1B18] tracking-tight">
                Teaching History &amp; Transcript Archive
              </h2>
              <p className="text-xs text-[#7D766C]">
                Saved locally on your device • No cloud database required
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundService.playSoftClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#FAF7F0] hover:bg-[#E5DFD3] border border-[#E5DFD3] flex items-center justify-center text-[#7D766C] hover:text-[#1E1B18] transition-colors cursor-pointer"
            title="Close"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="bg-[#FAF7F0] border-b border-[#E5DFD3] px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2 rounded-2xl bg-white/70 border border-[#E5DFD3]">
            <div className="text-base sm:text-lg font-extrabold text-[#1E1B18]">{sessions.length}</div>
            <div className="text-[10px] uppercase font-bold text-[#7D766C] tracking-wider">Sessions</div>
          </div>
          <div className="p-2 rounded-2xl bg-white/70 border border-[#E5DFD3]">
            <div className="text-base sm:text-lg font-extrabold text-[#46A302]">{totalMastered}</div>
            <div className="text-[10px] uppercase font-bold text-[#7D766C] tracking-wider">Mastered</div>
          </div>
          <div className="p-2 rounded-2xl bg-white/70 border border-[#E5DFD3]">
            <div className="text-base sm:text-lg font-extrabold text-[#1CB0F6]">{totalTurns}</div>
            <div className="text-[10px] uppercase font-bold text-[#7D766C] tracking-wider">Dialogue Turns</div>
          </div>
          <div className="p-2 rounded-2xl bg-white/70 border border-[#E5DFD3]">
            <div className="text-base sm:text-lg font-extrabold text-[#FF9600]">+{totalXp}</div>
            <div className="text-[10px] uppercase font-bold text-[#7D766C] tracking-wider">Total XP</div>
          </div>
        </div>

        {/* Search & Domain Filter Toolbar */}
        <div className="px-6 py-3 bg-white/50 border-b border-[#E5DFD3] flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D766C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past sessions, concepts, or gaps..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5DFD3] focus:outline-none focus:border-[#58CC02] text-[#1E1B18]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => {
                  soundService.playSoftClick();
                  setSelectedDomain(dom);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDomain === dom
                    ? 'bg-[#1E1B18] text-white shadow-xs'
                    : 'bg-white border border-[#E5DFD3] text-[#7D766C] hover:text-[#1E1B18]'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#E5DFD3]/50 flex items-center justify-center text-[#7D766C]">
                <BookOpenIcon size={28} />
              </div>
              <div className="text-sm font-extrabold text-[#1E1B18]">No Teaching Sessions Found</div>
              <p className="text-xs text-[#7D766C] max-w-sm">
                {sessions.length === 0
                  ? 'Complete your first teaching challenge with Protégé. All your dialogues, mental model reports, and gap insights will appear here!'
                  : 'No sessions matched your filter criteria. Try clearing the search query.'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const isMastered = session.verdict === 'FULL_CAUSAL_CHAIN_ESTABLISHED';

              return (
                <div
                  key={session.id}
                  className="paper-card p-4 sm:p-5 transition-all border border-[#E5DFD3] hover:border-[#D5CDBC] space-y-3"
                >
                  {/* Session Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-[#1E1B18]">
                          {session.conceptTitle}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DFD3] text-[#7D766C]">
                          {session.domain}
                        </span>
                        {isMastered ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F2FAEC] border border-[#58CC02]/40 text-[#46A302] flex items-center gap-1">
                            <CheckCircleIcon size={11} />
                            <span>Mastered</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF8EE] border border-[#FF9600]/40 text-[#CC7800] flex items-center gap-1">
                            <AlertCircleIcon size={11} />
                            <span>{session.missingGapTitle ? `Gap: ${session.missingGapTitle}` : 'Gap Exposed'}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#7D766C]">
                        {session.dateFormatted} • {session.turnsCount} turns • +{session.xpEarned} XP
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleReteach(session.conceptId)}
                        className="btn-duo-green px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Teach this topic again"
                      >
                        <RotateCcwIcon size={12} />
                        <span className="hidden sm:inline">Teach Again</span>
                      </button>

                      <button
                        onClick={(e) => handleDelete(session.id, e)}
                        className="p-1.5 rounded-xl hover:bg-[#FFF2F2] text-[#7D766C] hover:text-[#D70015] transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Summary Snippet */}
                  <div className="text-xs text-[#4A453E] line-clamp-2 bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E5DFD3]">
                    {session.summary || 'Completed Socratic teaching dialogue.'}
                  </div>

                  {/* Expand / Collapse Transcript Toggle */}
                  <div className="pt-1 flex items-center justify-between border-t border-[#E5DFD3]/60">
                    <button
                      onClick={() => {
                        soundService.playSoftClick();
                        setExpandedSessionId(isExpanded ? null : session.id);
                      }}
                      className="text-xs font-bold text-[#1CB0F6] hover:text-[#0C80C6] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Dialogue Transcript' : 'View Full Transcript'}</span>
                      {isExpanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
                    </button>

                    <span className="text-[11px] text-[#7D766C]">
                      {session.turns?.length || 0} interaction turns logged
                    </span>
                  </div>

                  {/* Expanded Transcript Drawer */}
                  {isExpanded && session.turns && session.turns.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#E5DFD3] space-y-3 animate-in fade-in duration-150">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#7D766C]">
                        Dialogue Transcript:
                      </div>
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {session.turns.map((turn: ConversationTurn, idx: number) => {
                          const isUser = turn.role === 'user';
                          return (
                            <div
                              key={turn.id || idx}
                              className={`p-3 rounded-2xl text-xs space-y-1 ${
                                isUser
                                  ? 'bg-white border border-[#E5DFD3] ml-4'
                                  : 'bg-[#FFF8EE] border border-[#FF9600]/30 mr-4'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className={isUser ? 'text-[#58CC02]' : 'text-[#FF9600]'}>
                                  {isUser ? 'You (Teacher)' : 'Protégé (Apprentice)'}
                                </span>
                                <span className="text-[#7D766C] flex items-center gap-1">
                                  {turn.inputMethod === 'voice' ? (
                                    <span className="flex items-center gap-0.5">
                                      <MicIcon size={10} /> Voice
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-0.5">
                                      <PencilQuillIcon size={10} /> Typed
                                    </span>
                                  )}
                                </span>
                              </div>
                              <p className="text-[#1E1B18] leading-relaxed whitespace-pre-wrap">
                                {turn.text}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {session.reconstructionResult?.missingRelationship && (
                        <div className="p-3 rounded-2xl bg-[#FFF8EE] border border-[#FF9600]/40 text-xs space-y-1">
                          <div className="font-bold text-[#FF9600] flex items-center gap-1.5">
                            <AlertCircleIcon size={13} />
                            <span>Missing Causal Link Exposed:</span>
                          </div>
                          <div className="text-[#1E1B18] font-bold">
                            {session.reconstructionResult.missingRelationship.gapTitle}
                          </div>
                          <p className="text-[#7D766C]">
                            {session.reconstructionResult.missingRelationship.gapDescription}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-[#E5DFD3] px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-[#7D766C]">
            {filteredSessions.length} of {sessions.length} session{sessions.length !== 1 ? 's' : ''} shown
          </span>

          <div className="flex items-center gap-3">
            {sessions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-[#D70015] hover:underline cursor-pointer"
              >
                Clear All History
              </button>
            )}

            <button
              onClick={() => {
                soundService.playSoftClick();
                onClose();
              }}
              className="btn-duo-white px-4 py-1.5 rounded-2xl text-xs font-bold cursor-pointer"
            >
              Close Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
