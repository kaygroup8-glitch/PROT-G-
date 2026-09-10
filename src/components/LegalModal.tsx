import React from 'react';
import { CloseIcon, BookOpenIcon, CheckmarkShieldIcon } from './Icons';

interface LegalModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#FFFFFF] border-2 border-[#E5DFD3] border-b-6 border-[#D5CDBC] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#1E1B18]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FAF7F0] text-[#1CB0F6] border border-[#E5DFD3]">
              {type === 'terms' ? <BookOpenIcon size={20} /> : <CheckmarkShieldIcon size={20} />}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#1E1B18] font-serif">
              {type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7D766C] hover:text-[#1E1B18] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {type === 'terms' ? (
          <div className="space-y-4 text-xs sm:text-sm text-[#4A453E] leading-relaxed">
            <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DFD3] text-xs text-[#4A453E]">
              <strong className="font-bold text-[#1E1B18]">In Short: </strong>
              PROTÉGÉ is a learning tool where you teach an artificial apprentice to test and strengthen your own understanding.
            </div>

            <h3 className="font-bold text-sm sm:text-base text-[#1E1B18] pt-2">1. How PROTÉGÉ Works</h3>
            <p>
              PROTÉGÉ is built on the Feynman technique: you explain a concept to an AI student who starts with zero prior knowledge. The student reconstructs what you taught and asks simple questions to help you spot missing links.
            </p>

            <h3 className="font-bold text-sm sm:text-base text-[#1E1B18] pt-2">2. Respectful & Fair Use</h3>
            <p>
              You are welcome to use PROTÉGÉ for personal study, conceptual practice, and mastering new ideas. Please use the platform respectfully.
            </p>

            <h3 className="font-bold text-sm sm:text-base text-[#1E1B18] pt-2">3. Educational Disclaimer</h3>
            <p>
              PROTÉGÉ helps you practice explaining ideas in your own words. While our evaluation verifies causal connections using your actual transcript, it is designed for personal learning and practice, not official university accreditations.
            </p>

            <h3 className="font-bold text-sm sm:text-base text-[#1E1B18] pt-2">4. Questions & Support</h3>
            <p>
              We want your experience to be wonderful. For feedback or questions, contact us anytime at{' '}
              <span className="font-bold text-[#1CB0F6]">support@protege.app</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs sm:text-sm text-[#4A453E] leading-relaxed">
            <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DFD3] text-xs text-[#4A453E]">
              <strong className="font-bold text-[#1E1B18]">In Short: </strong>
              We respect your privacy. Your learning progress is kept in your browser&apos;s local storage.
            </div>

            <h3 className="font-bold text-sm sm:text-base text-[#1E1B18] pt-2">1. Local Storage First</h3>
            <p>
              Your streaks, completed lessons, preferences, and notes live in your browser&apos;s local storage on your device. You can clear your data anytime through your browser settings.
            </p>

            <h3 className="font-bold text-sm sm:text-base text-[#1E1B18] pt-2">2. Voice & Microphone</h3>
            <p>
              When you choose to teach with your voice, microphone audio is sent securely to AssemblyAI to transcribe your speech into text. Audio is processed solely to generate your transcript and is not stored or used for third-party ad targeting.
            </p>

            <h3 className="font-bold text-sm sm:text-base text-[#1E1B18] pt-2">3. AI Processing</h3>
            <p>
              Your teaching explanations are processed using secure APIs to roleplay the student and highlight what parts were clear versus missing. We do not sell or trade your text data.
            </p>

            <h3 className="font-bold text-sm sm:text-base text-[#1E1B18] pt-2">4. Contact</h3>
            <p>
              Have privacy questions? Reach out to our privacy team at{' '}
              <span className="font-bold text-[#1CB0F6]">privacy@protege.app</span>.
            </p>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-[#E5DFD3] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold rounded-xl btn-duo-green cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
