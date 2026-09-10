import React, { useState } from 'react';
import { ProtegeMark } from './ProtegeMark';
import { CheckmarkShieldIcon, BookOpenIcon, ArrowRightIcon, CloseIcon } from './Icons';
import { recordTermsAgreement } from '../services/storageService';

interface TermsAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: () => void;
  onOpenDetailedLegal: (type: 'terms' | 'privacy') => void;
}

export const TermsAgreementModal: React.FC<TermsAgreementModalProps> = ({
  isOpen,
  onClose,
  onConfirmed,
  onOpenDetailedLegal,
}) => {
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [agreedPrivacy, setAgreedPrivacy] = useState(true);

  if (!isOpen) return null;

  const handleAgreeAndProceed = () => {
    if (agreedTerms && agreedPrivacy) {
      recordTermsAgreement();
      onConfirmed();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FFFFFF] border-2 border-[#E5DFD3] border-b-6 border-[#D5CDBC] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#1E1B18]"
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#7D766C] hover:text-[#1E1B18] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <CloseIcon size={18} />
        </button>

        {/* Header with stamped mark */}
        <div className="flex items-center gap-3.5 mb-5">
          <ProtegeMark size={36} highlight />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#1E1B18] font-serif">
              Before You Start Teaching
            </h2>
            <p className="text-xs text-[#7D766C]">
              Plain, human-friendly terms for your learning journey
            </p>
          </div>
        </div>

        {/* Humanized bullet cards */}
        <div className="space-y-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DFD3] flex items-start gap-3">
            <div className="p-1.5 rounded-xl bg-white border border-[#E5DFD3] text-[#58CC02] shrink-0 mt-0.5">
              <CheckmarkShieldIcon size={16} />
            </div>
            <div className="text-xs text-[#4A453E] leading-relaxed">
              <strong className="text-[#1E1B18] font-bold block mb-0.5">Your data stays in your browser</strong>
              Your learning streak, XP, past sessions, and settings are saved directly in your local storage. We don&apos;t sell or trade your personal data.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DFD3] flex items-start gap-3">
            <div className="p-1.5 rounded-xl bg-white border border-[#E5DFD3] text-[#1CB0F6] shrink-0 mt-0.5">
              <BookOpenIcon size={16} />
            </div>
            <div className="text-xs text-[#4A453E] leading-relaxed">
              <strong className="text-[#1E1B18] font-bold block mb-0.5">Voice & AI Learning</strong>
              Microphone audio is transcribed into text using AssemblyAI only while you teach. The AI student acts as a curious learner to help you discover gaps.
            </div>
          </div>
        </div>

        {/* Checkbox agreements */}
        <div className="space-y-3 mb-7 border-t border-[#E5DFD3] pt-4">
          <label className="flex items-center gap-3 text-xs text-[#4A453E] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="w-4 h-4 rounded-md border-[#D5CDBC] text-[#58CC02] focus:ring-[#58CC02] cursor-pointer"
            />
            <span>
              I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetailedLegal('terms');
                }}
                className="font-bold underline text-[#1CB0F6] hover:text-[#1899D6]"
              >
                Terms of Service
              </button>
            </span>
          </label>

          <label className="flex items-center gap-3 text-xs text-[#4A453E] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedPrivacy}
              onChange={(e) => setAgreedPrivacy(e.target.checked)}
              className="w-4 h-4 rounded-md border-[#D5CDBC] text-[#58CC02] focus:ring-[#58CC02] cursor-pointer"
            />
            <span>
              I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetailedLegal('privacy');
                }}
                className="font-bold underline text-[#1CB0F6] hover:text-[#1899D6]"
              >
                Privacy Policy
              </button>
            </span>
          </label>
        </div>

        {/* Primary Duolingo Action Button */}
        <button
          onClick={handleAgreeAndProceed}
          disabled={!agreedTerms || !agreedPrivacy}
          className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all cursor-pointer ${
            agreedTerms && agreedPrivacy
              ? 'btn-duo-green'
              : 'bg-[#E5DFD3] text-[#7D766C] cursor-not-allowed border-b-4 border-[#D5CDBC]'
          }`}
        >
          <span>Agree & Enter Protégé</span>
          <ArrowRightIcon size={16} />
        </button>
      </div>
    </div>
  );
};
