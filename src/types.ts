export type Role = 'user' | 'student';

export interface CausalNode {
  id: string;
  label: string;
  shortDescription?: string;
}

export interface CausalEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  requiredMechanism: string; // The critical causal relationship that connects them
}

export interface ConceptChallenge {
  id: string;
  title: string;
  domain: string;
  description: string;
  starterPrompt: string;
  studentPriors: string; // What Student Zero starts with
  keyCausalComponents: string[];
  nodes: CausalNode[];
  edges: CausalEdge[];
  isCustom?: boolean;
  stage?: 1 | 2 | 3;
  isAiPersonalized?: boolean;
  imageUrl?: string;
}

export interface ConversationTurn {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  inputMethod: 'text' | 'voice';
}

export interface StudentMentalModel {
  explicitlyTaught: {
    fact: string;
    quote: string;
  }[];
  inferredConnections: {
    inference: string;
    basedOn: string;
  }[];
  unknownOrMissing: {
    conceptNeed: string;
    reason: string;
  }[];
  detectedContradictions: {
    contradiction: string;
    quotes: string[];
  }[];
  cannotDetermine: string[];
  currentCuriosity: string;
}

// Layer 1: Student Zero Response
export interface StudentZeroTurnResponse {
  studentReflection: string; // 1-2 sentences: what Student Zero grasped purely from the words
  helpfulSuggestion?: string; // gentle suggestion / clue on what specific causal link or consequence needs clarification
  targetedQuestion: string;   // The single question it needs answered to continue
  isConceptUnderstood?: boolean; // true if the apprentice now grasps the full causal chain soundly
  masteredPercentage?: number; // 0 to 100 estimated causal progress
  stageLabel?: string; // e.g. "Core Mechanism", "Connecting Consequences", "Full Mastery"
  mentalModel: StudentMentalModel;
}

// Layer 2: Hidden Canonical Evaluator Output
export type CausalNodeStatus = 'explained' | 'missing' | 'vague';
export type CausalEdgeStatus = 'connected' | 'missing' | 'broken';

export interface CausalRelationshipAudit {
  nodeId: string;
  label: string;
  status: CausalNodeStatus;
  evidenceQuote: string | null;
}

export interface EvaluatedEdge {
  id: string;
  fromId: string;
  toId: string;
  fromLabel: string;
  toLabel: string;
  requiredMechanism: string;
  status: CausalEdgeStatus;
  explanation: string;
  evidenceQuote: string | null;
}

export interface MissingRelationshipBreakdown {
  fromLabel: string;
  toLabel: string;
  gapTitle: string;
  gapDescription: string;
  studentConfusionRationale: string;
  directEvidenceQuote: string;
}

export interface ReconstructionResult {
  studentSynthesis: string; // Student Zero's honest reconstruction in its own words
  piecesExplained: CausalRelationshipAudit[];
  relationships: EvaluatedEdge[];
  missingRelationship: MissingRelationshipBreakdown | null;
  hasSufficientEvidence: boolean;
  verdict: 'PIECES_KNOWN_CONNECTION_MISSING' | 'FULL_CAUSAL_CHAIN_ESTABLISHED' | 'INSUFFICIENT_EXPLANATION';
  summary: string;
}

// Layer 3: Second-Attempt Diff
export interface SecondAttemptDiffResult {
  targetRelationship: string;
  repaired: boolean;
  beforeSnippet: string;
  afterSnippet: string;
  evidenceQuote: string;
  explanationOfRepair: string;
  reconstructedChain: string[];
}

export type JourneyStep =
  | 'landing'
  | 'select-concept'
  | 'meet-student'
  | 'teaching'
  | 'question'
  | 'reconstruction'
  | 'reteach-gap'
  | 'diff-result';

export interface TeachingSession {
  id: string;
  concept: ConceptChallenge;
  startTime: number;
  messages: ConversationTurn[];
  mentalModel: StudentMentalModel;
  latestQuestion: string | null;
  latestReport: ReconstructionResult | null;
  diffResult: SecondAttemptDiffResult | null;
  status: 'active' | 'reconstructing' | 'evaluated' | 'diffing';
}

export interface TeachingSessionRecord {
  id: string;
  conceptId: string;
  conceptTitle: string;
  domain: string;
  timestamp: number;
  dateFormatted: string;
  turnsCount: number;
  verdict: 'FULL_CAUSAL_CHAIN_ESTABLISHED' | 'PIECES_KNOWN_CONNECTION_MISSING' | 'INSUFFICIENT_EXPLANATION';
  verdictLabel: string;
  xpEarned: number;
  summary: string;
  missingGapTitle?: string;
  turns: ConversationTurn[];
  reconstructionResult?: ReconstructionResult;
  diffResult?: SecondAttemptDiffResult | null;
}
