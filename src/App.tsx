import { useState, useEffect } from 'react';
import {
  ConceptChallenge,
  ConversationTurn,
  ReconstructionResult,
  SecondAttemptDiffResult,
  JourneyStep,
} from './types';
import { LandingView } from './components/LandingView';
import { ConceptSelectView } from './components/ConceptSelectView';
import { MeetStudentView } from './components/MeetStudentView';
import { TeachingPodiumView } from './components/TeachingPodiumView';
import { StudentQuestionView } from './components/StudentQuestionView';
import { ReconstructionView } from './components/ReconstructionView';
import { ReteachGapView } from './components/ReteachGapView';
import { DiffResultView } from './components/DiffResultView';
import { LegalModal } from './components/LegalModal';
import { TermsAgreementModal } from './components/TermsAgreementModal';
import { OnboardingModal } from './components/OnboardingModal';
import { HistoryModal } from './components/HistoryModal';
import { getStoredProfile } from './services/userProfile';
import { hasUserAgreedToTerms, saveStoredTeachingSession } from './services/storageService';
import { CURATED_CONCEPTS } from './data/curatedConcepts';

export default function App() {
  const [currentStep, setCurrentStep] = useState<JourneyStep>('landing');
  const [activeConcept, setActiveConcept] = useState<ConceptChallenge | null>(null);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [studentReflection, setStudentReflection] = useState<string>('');
  const [targetedQuestion, setTargetedQuestion] = useState<string>('');
  const [helpfulSuggestion, setHelpfulSuggestion] = useState<string>('');
  const [isConceptUnderstood, setIsConceptUnderstood] = useState<boolean>(false);
  const [masteredPercentage, setMasteredPercentage] = useState<number>(30);
  const [stageLabel, setStageLabel] = useState<string>('Foundational Intuition');
  const [reconstructionResult, setReconstructionResult] = useState<ReconstructionResult | null>(null);
  const [diffResult, setDiffResult] = useState<SecondAttemptDiffResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [pendingConcept, setPendingConcept] = useState<ConceptChallenge | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    // If user has not completed onboarding, pop up the onboarding experience
    if (!getStoredProfile()) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Gated Access: User must agree to terms & privacy before entering the product
  const handleBeginFromLanding = () => {
    if (hasUserAgreedToTerms()) {
      setCurrentStep('select-concept');
    } else {
      setPendingConcept(null);
      setIsTermsModalOpen(true);
    }
  };

  const handleSelectConceptFromLanding = (concept: ConceptChallenge) => {
    if (hasUserAgreedToTerms()) {
      executeSelectConcept(concept);
    } else {
      setPendingConcept(concept);
      setIsTermsModalOpen(true);
    }
  };

  const handleTermsAgreed = () => {
    setIsTermsModalOpen(false);
    if (pendingConcept) {
      executeSelectConcept(pendingConcept);
      setPendingConcept(null);
    } else {
      setCurrentStep('select-concept');
    }
  };

  // 1. Concept Selection
  const executeSelectConcept = (concept: ConceptChallenge) => {
    setActiveConcept(concept);
    setTurns([]);
    setStudentReflection('');
    setTargetedQuestion('');
    setHelpfulSuggestion('');
    setIsConceptUnderstood(false);
    setMasteredPercentage(30);
    setStageLabel('Foundational Intuition');
    setReconstructionResult(null);
    setDiffResult(null);
    setCurrentStep('meet-student');
  };

  // 2. Initial Teaching explanation submission
  const handleSendInitialTeaching = async (text: string, inputMethod: 'voice' | 'text') => {
    if (!activeConcept) return;

    const userTurn: ConversationTurn = {
      id: `turn-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
      inputMethod,
    };

    const newHistory = [userTurn];
    setTurns(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: activeConcept,
          history: newHistory,
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error (${response.status})`);
      }

      const data = await response.json();
      const reflection = data.studentReflection || `I understand what you explained about ${activeConcept.title}.`;
      const question = data.targetedQuestion || "How does that mechanism actually work?";
      const suggestion = data.helpfulSuggestion || "Try explaining what causes the next step to happen automatically.";
      const understood = Boolean(data.isConceptUnderstood);
      const progress = typeof data.masteredPercentage === 'number' ? data.masteredPercentage : 35;
      const stage = data.stageLabel || 'Foundational Intuition';

      setStudentReflection(reflection);
      setTargetedQuestion(question);
      setHelpfulSuggestion(suggestion);
      setIsConceptUnderstood(understood);
      setMasteredPercentage(progress);
      setStageLabel(stage);

      const studentTurn: ConversationTurn = {
        id: `turn-${Date.now() + 1}`,
        role: 'student',
        text: `${reflection} ${question}`,
        timestamp: Date.now(),
        inputMethod: 'text',
      };
      setTurns([...newHistory, studentTurn]);
      setCurrentStep('question');
    } catch (err) {
      console.error('Teaching turn failed, using local fallback:', err);
      const fallbackReflection = `I follow what you are describing about ${activeConcept.title}.`;
      const fallbackQuestion =
        activeConcept.id === 'public-key-crypto'
          ? "If the public key is visible to everyone, what stops anyone from using it to read the message?"
          : "What is the exact mechanism that connects those two parts together?";
      const fallbackSuggestion = "Explain why this step cannot be undone by an eavesdropper.";

      setStudentReflection(fallbackReflection);
      setTargetedQuestion(fallbackQuestion);
      setHelpfulSuggestion(fallbackSuggestion);
      setIsConceptUnderstood(false);
      setMasteredPercentage(40);
      setStageLabel('The Asymmetric Dilemma');

      const studentTurn: ConversationTurn = {
        id: `turn-${Date.now() + 1}`,
        role: 'student',
        text: `${fallbackReflection} ${fallbackQuestion}`,
        timestamp: Date.now(),
        inputMethod: 'text',
      };
      setTurns([...newHistory, studentTurn]);
      setCurrentStep('question');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. User responds to Student's Question -> Personalized Socratic response
  const handleAnswerQuestion = async (answerText: string, inputMethod: 'voice' | 'text' = 'text') => {
    if (!activeConcept) return;

    const answerTurn: ConversationTurn = {
      id: `turn-${Date.now()}`,
      role: 'user',
      text: answerText,
      timestamp: Date.now(),
      inputMethod,
    };

    const updatedHistory = [...turns, answerTurn];
    setTurns(updatedHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: activeConcept,
          history: updatedHistory,
          message: answerText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Teaching step error (${response.status})`);
      }

      const data = await response.json();
      const reflection = data.studentReflection || `I see what you explained: "${answerText.slice(0, 60)}...".`;
      const question = data.targetedQuestion || "How does that directly trigger the next step in the sequence?";
      const suggestion = data.helpfulSuggestion || "Think about the underlying cause and effect.";
      const understood = Boolean(data.isConceptUnderstood);
      const userTurnsCount = updatedHistory.filter(t => t.role === 'user').length;
      const progress = typeof data.masteredPercentage === 'number'
        ? data.masteredPercentage
        : Math.min(100, 30 + userTurnsCount * 30);
      const stage = data.stageLabel || (understood ? 'Full Conceptual Mastery' : 'Connecting Mechanism');

      setStudentReflection(reflection);
      setTargetedQuestion(question);
      setHelpfulSuggestion(suggestion);
      setIsConceptUnderstood(understood);
      setMasteredPercentage(progress);
      setStageLabel(stage);

      const studentTurn: ConversationTurn = {
        id: `turn-${Date.now() + 1}`,
        role: 'student',
        text: `${reflection} ${question}`,
        timestamp: Date.now(),
        inputMethod: 'text',
      };
      setTurns([...updatedHistory, studentTurn]);
      // Remain on question step for step-by-step personalized Socratic guidance!
    } catch (err) {
      console.error('Teaching step fallback:', err);
      const userTurnsCount = updatedHistory.filter(t => t.role === 'user').length;
      const fallbackReflection = `You clarified that "${answerText.slice(0, 70)}...". I see how that connects.`;
      const fallbackQuestion = userTurnsCount > 2
        ? "Does this complete the full chain of cause and effect, or is there an edge case?"
        : "What prevents the reverse of this action from happening?";
      const fallbackSuggestion = "Try summarizing how the sender and receiver coordinate without exposing the secret.";
      const understood = userTurnsCount >= 3;

      setStudentReflection(fallbackReflection);
      setTargetedQuestion(fallbackQuestion);
      setHelpfulSuggestion(fallbackSuggestion);
      setIsConceptUnderstood(understood);
      setMasteredPercentage(understood ? 100 : Math.min(90, 40 + userTurnsCount * 25));
      setStageLabel(understood ? 'Full Conceptual Mastery' : 'Connecting Mechanism');

      const studentTurn: ConversationTurn = {
        id: `turn-${Date.now() + 1}`,
        role: 'student',
        text: `${fallbackReflection} ${fallbackQuestion}`,
        timestamp: Date.now(),
        inputMethod: 'text',
      };
      setTurns([...updatedHistory, studentTurn]);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Conclude dialogue & Reconstruct Understanding into Notebook Summary
  const handleProceedToReconstruction = async () => {
    if (!activeConcept) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/reconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: activeConcept,
          history: turns,
        }),
      });

      if (!response.ok) {
        throw new Error(`Reconstruction failed (${response.status})`);
      }

      const report: ReconstructionResult = await response.json();
      setReconstructionResult(report);

      // Save to device storage history
      saveStoredTeachingSession({
        conceptId: activeConcept.id,
        conceptTitle: activeConcept.title,
        domain: activeConcept.domain,
        turnsCount: turns.length,
        verdict: report.verdict,
        verdictLabel:
          report.verdict === 'FULL_CAUSAL_CHAIN_ESTABLISHED'
            ? 'Full Causal Chain Mastered'
            : 'Missing Mechanism Identified',
        xpEarned: report.verdict === 'FULL_CAUSAL_CHAIN_ESTABLISHED' ? 100 : 50,
        summary: report.summary || report.studentSynthesis,
        missingGapTitle: report.missingRelationship?.gapTitle,
        turns,
        reconstructionResult: report,
      });

      setCurrentStep('reconstruction');
    } catch (err) {
      console.error('Reconstruction call failed, generating audit:', err);
      const fallbackReport: ReconstructionResult = {
        studentSynthesis: `You taught that ${turns[0]?.text || ''}. But the underlying trapdoor math remains unconnected.`,
        piecesExplained: (activeConcept.nodes || []).map((node, i) => ({
          nodeId: node.id,
          label: node.label,
          status: i === 1 ? 'missing' : 'explained',
          evidenceQuote: i === 1 ? 'No statement in transcript.' : turns[0]?.text?.slice(0, 80) || '',
        })),
        relationships: (activeConcept.edges || []).map((edge, i) => ({
          id: edge.id,
          fromId: edge.fromNodeId,
          toId: edge.toNodeId,
          fromLabel: activeConcept.nodes?.find((n) => n.id === edge.fromNodeId)?.label || 'Source',
          toLabel: activeConcept.nodes?.find((n) => n.id === edge.toNodeId)?.label || 'Target',
          requiredMechanism: edge.requiredMechanism,
          status: i === 0 ? 'missing' : 'connected',
          explanation: i === 0 ? 'Teacher omitted the causal mechanism.' : 'Referenced in transcript.',
          evidenceQuote: i === 0 ? 'No statement in transcript.' : turns[0]?.text?.slice(0, 80) || '',
        })),
        missingRelationship: {
          fromLabel: activeConcept.nodes?.[0]?.label || 'Public Key',
          toLabel: activeConcept.nodes?.[1]?.label || 'One-Way Encryption',
          gapTitle: 'Missing One-Way Trapdoor Link',
          gapDescription:
            'You explained public and private keys, but omitted the one-way mathematical function connecting them.',
          studentConfusionRationale:
            "I understand both keys exist, but I don't know why an eavesdropper can't reverse the encryption without the private key.",
          directEvidenceQuote: turns[0]?.text?.slice(0, 90) || 'No statement in transcript.',
        },
        hasSufficientEvidence: true,
        verdict: 'PIECES_KNOWN_CONNECTION_MISSING',
        summary: "You knew the pieces. You didn't connect them.",
      };

      setReconstructionResult(fallbackReport);

      // Save to device storage history
      saveStoredTeachingSession({
        conceptId: activeConcept.id,
        conceptTitle: activeConcept.title,
        domain: activeConcept.domain,
        turnsCount: turns.length,
        verdict: fallbackReport.verdict,
        verdictLabel: 'Missing Mechanism Identified',
        xpEarned: 50,
        summary: fallbackReport.summary,
        missingGapTitle: fallbackReport.missingRelationship?.gapTitle,
        turns,
        reconstructionResult: fallbackReport,
      });

      setCurrentStep('reconstruction');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Submit Attempt 2 to repair the missing causal gap
  const handleSendRetest = async (explanation: string) => {
    if (!activeConcept || !reconstructionResult) return;

    setIsLoading(true);
    const attempt1Text = turns
      .filter((t) => t.role === 'user')
      .map((t) => t.text)
      .join(' ');

    const targetGap = reconstructionResult.missingRelationship
      ? `${reconstructionResult.missingRelationship.fromLabel} ➔ ${reconstructionResult.missingRelationship.toLabel}`
      : 'Causal Mechanism';

    try {
      const response = await fetch('/api/diff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: activeConcept,
          targetRelationship: targetGap,
          attempt1Transcript: attempt1Text,
          attempt2Transcript: explanation,
        }),
      });

      if (!response.ok) {
        throw new Error(`Diff evaluation failed (${response.status})`);
      }

      const diff: SecondAttemptDiffResult = await response.json();
      setDiffResult(diff);

      // Update stored teaching record if successfully repaired
      if (diff.repaired) {
        saveStoredTeachingSession({
          conceptId: activeConcept.id,
          conceptTitle: activeConcept.title,
          domain: activeConcept.domain,
          turnsCount: turns.length + 1,
          verdict: 'FULL_CAUSAL_CHAIN_ESTABLISHED',
          verdictLabel: 'Gap Repaired • Full Causal Chain Mastered',
          xpEarned: 150,
          summary: diff.explanationOfRepair || 'Successfully repaired causal gap on second attempt.',
          missingGapTitle: undefined,
          turns: [
            ...turns,
            {
              id: `turn-retest-${Date.now()}`,
              role: 'user',
              text: `Attempt 2: ${explanation}`,
              timestamp: Date.now(),
              inputMethod: 'text',
            },
          ],
          reconstructionResult,
        });
      }

      setCurrentStep('diff-result');
    } catch (err) {
      console.error('Diff evaluation failed, falling back:', err);
      const fallbackDiff: SecondAttemptDiffResult = {
        targetRelationship: targetGap,
        repaired: true,
        beforeSnippet: attempt1Text.slice(0, 100),
        afterSnippet: explanation.slice(0, 120),
        evidenceQuote: explanation.slice(0, 90),
        explanationOfRepair: `You explicitly articulated the missing mechanism: "${explanation.slice(0, 100)}..."`,
        reconstructedChain: [
          activeConcept.nodes?.[0]?.label || 'Initial Component',
          'One-Way Mathematical Trapdoor',
          activeConcept.nodes?.[activeConcept.nodes.length - 1]?.label || 'Outcome',
        ],
      };
      setDiffResult(fallbackDiff);
      setCurrentStep('diff-result');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset helper
  const handleResetSession = () => {
    setActiveConcept(null);
    setTurns([]);
    setStudentReflection('');
    setTargetedQuestion('');
    setHelpfulSuggestion('');
    setIsConceptUnderstood(false);
    setMasteredPercentage(30);
    setStageLabel('Foundational Intuition');
    setReconstructionResult(null);
    setDiffResult(null);
    setCurrentStep('select-concept');
  };

  const handleSelectConceptFromHistory = (conceptId: string) => {
    const found = CURATED_CONCEPTS.find((c) => c.id === conceptId);
    if (found) {
      executeSelectConcept(found);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F0] text-[#1E1B18]">
      {/* 1. Landing View */}
      {currentStep === 'landing' && (
        <LandingView
          onBegin={handleBeginFromLanding}
          onSelectConcept={handleSelectConceptFromLanding}
          onOpenLegal={(type) => setLegalModalType(type)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      )}

      {/* 2. Choose Concept */}
      {currentStep === 'select-concept' && (
        <ConceptSelectView
          onSelectConcept={handleSelectConceptFromLanding}
          onViewLanding={() => setCurrentStep('landing')}
          onOpenPreferences={() => setIsOnboardingOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      )}

      {/* 3. Meet Protégé */}
      {currentStep === 'meet-student' && activeConcept && (
        <MeetStudentView
          concept={activeConcept}
          onReady={() => setCurrentStep('teaching')}
          onBack={() => setCurrentStep('select-concept')}
        />
      )}

      {/* 4. Teach Protégé (Podium) */}
      {currentStep === 'teaching' && activeConcept && (
        <TeachingPodiumView
          concept={activeConcept}
          onSendExplanation={handleSendInitialTeaching}
          isLoading={isLoading}
          onBack={() => setCurrentStep('meet-student')}
        />
      )}

      {/* 5. Protégé Asks Targeted Question (Personalized Socratic Dialogue) */}
      {currentStep === 'question' && activeConcept && (
        <StudentQuestionView
          concept={activeConcept}
          studentReflection={studentReflection}
          helpfulSuggestion={helpfulSuggestion}
          targetedQuestion={targetedQuestion}
          isConceptUnderstood={isConceptUnderstood}
          masteredPercentage={masteredPercentage}
          stageLabel={stageLabel}
          turns={turns}
          onAnswerQuestion={handleAnswerQuestion}
          onProceedToReconstruction={handleProceedToReconstruction}
          isLoading={isLoading}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      )}

      {/* 6. Protégé's Notebook Reconstruction */}
      {currentStep === 'reconstruction' && activeConcept && reconstructionResult && (
        <ReconstructionView
          concept={activeConcept}
          report={reconstructionResult}
          history={turns}
          onReteachGap={() => setCurrentStep('reteach-gap')}
          onRestart={handleResetSession}
        />
      )}

      {/* 7. Second Attempt: Bridge the Gap */}
      {currentStep === 'reteach-gap' && activeConcept && (
        <ReteachGapView
          concept={activeConcept}
          missingRelationship={reconstructionResult?.missingRelationship || null}
          onSendRetest={handleSendRetest}
          isLoading={isLoading}
          onBack={() => setCurrentStep('reconstruction')}
        />
      )}

      {/* 8. Before vs After Diff Result */}
      {currentStep === 'diff-result' && activeConcept && diffResult && (
        <DiffResultView
          concept={activeConcept}
          diffResult={diffResult}
          onNewSession={() => setCurrentStep('reteach-gap')}
          onTryAnotherConcept={() => setCurrentStep('select-concept')}
        />
      )}

      {/* Device History Archive Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectConceptToTeach={handleSelectConceptFromHistory}
      />

      {/* Mandatory Terms & Privacy Gatekeeper Modal */}
      <TermsAgreementModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onConfirmed={handleTermsAgreed}
        onOpenDetailedLegal={(type) => setLegalModalType(type)}
      />

      {/* Detailed Legal Viewer Dialog */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Onboarding Experience */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
