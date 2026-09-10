import { GoogleGenAI, Type } from '@google/genai';
import {
  ConversationTurn,
  ConceptChallenge,
  StudentMentalModel,
  StudentZeroTurnResponse,
  ReconstructionResult,
  SecondAttemptDiffResult,
} from '../src/types';

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

async function generateContentWithFallback(ai: GoogleGenAI, requestConfig: any) {
  let lastError: unknown = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        ...requestConfig,
        model,
      });
      return response;
    } catch (err) {
      console.warn(`Model ${model} unavailable or failed, trying fallback:`, err);
      lastError = err;
    }
  }
  throw lastError;
}

// ============================================================================
// LAYER 1: CLOSED-WORLD STUDENT ZERO (PUBLIC-FACING STUDENT)
// ============================================================================
// STRICT PROMPT ISOLATION:
// - Does NOT know the canonical concept model, nodes, or edges.
// - Knows ONLY what the teacher has communicated in this transcript.
// - NEVER teaches, lectures, validates, or corrects the teacher.
// - Asks EXACTLY ONE targeted question per turn focusing on the missing cause or link.
// ============================================================================

export async function processStudentZeroTurn(
  concept: ConceptChallenge,
  history: ConversationTurn[],
  userMessage: string
): Promise<StudentZeroTurnResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateDeterministicStudentTurn(concept, history, userMessage);
  }

  const ai = getAI();

  const formattedHistory = history
    .map((turn) => `${turn.role === 'user' ? 'TEACHER' : 'PROTÉGÉ (APPRENTICE)'}: "${turn.text}"`)
    .join('\n');

  const systemInstruction = `You are PROTÉGÉ (STUDENT ZERO), an inquisitive, eager AI apprentice learning "${concept.title}" from a human teacher.
CORE IDENTITY & BEHAVIOR:
1. You are the APPRENTICE / STUDENT. The human is the TEACHER.
2. PERSONALIZATION MANDATE: You MUST personally react to the teacher's exact phrasing, examples, analogies, or explanations. If the teacher used an analogy (e.g., mailboxes, traffic, water pipes, bakers), directly incorporate and react to that specific analogy!
3. DELIBERATE CLOSED-WORLD MEMORY: You know NOTHING about "${concept.title}" beyond what the teacher has communicated in this dialogue. Do NOT use pre-trained textbook knowledge to fill gaps or preach.
4. STEP-BY-STEP SOCRATIC GUIDANCE:
   - studentReflection: 1 or 2 personalized, attentive sentences acknowledging what you grasped specifically from their words.
   - helpfulSuggestion: 1 warm, curious apprentice suggestion or hint nudging them on what logical link or cause-and-effect relationship to explain next (e.g., "Could you clarify how the trapdoor locks without a key?", "What triggers the sender to slow down?").
   - targetedQuestion: EXACTLY ONE specific, focused question targeting the immediate missing mechanism or consequence.
   - isConceptUnderstood: Set to true ONLY if the teacher has now clearly explained all core components, how they interact, and how the mechanism works without critical causal holes. Otherwise false.
   - masteredPercentage: Estimated integer between 15 and 100 representing how complete the student's causal understanding is so far based on the teacher's turns.
   - stageLabel: A brief 2-4 word milestone (e.g., "Foundational Intuition", "Bridging Core Mechanism", "Resolving Consequences", "Full Conceptual Mastery").
5. Never lecture, condescend, or say "Good job" like an evaluator. You are an apprentice seeking understanding. Keep tone sincere, thoughtful, and engaged.`;

  const prompt = `Topic: "${concept.title}"
Key components needed for a sound mental model: ${JSON.stringify(concept.keyCausalComponents || [])}
What you knew prior to session: "${concept.studentPriors || 'Nothing'}"

Transcript So Far:
${formattedHistory || '(Session just started)'}

Teacher's Latest Message:
"${userMessage}"

Respond as Protégé. Reflect on their specific words, give a helpful apprentice suggestion on what to clarify next, and ask your single targeted question. Return JSON.`;

  try {
    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentReflection: {
              type: Type.STRING,
              description: '1-2 sentences: what Protégé grasped specifically from the teacher latest words.',
            },
            helpfulSuggestion: {
              type: Type.STRING,
              description: '1 sentence suggestion or hint pointing out the next logical connection needed.',
            },
            targetedQuestion: {
              type: Type.STRING,
              description: 'Exactly ONE question targeting the immediate missing mechanism.',
            },
            isConceptUnderstood: {
              type: Type.BOOLEAN,
              description: 'True if the teacher has explained all core causal mechanisms soundly.',
            },
            masteredPercentage: {
              type: Type.INTEGER,
              description: 'Estimated integer from 15 to 100 representing causal chain completeness.',
            },
            stageLabel: {
              type: Type.STRING,
              description: '2-4 words summarizing the current understanding stage.',
            },
            mentalModel: {
              type: Type.OBJECT,
              properties: {
                explicitlyTaught: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      fact: { type: Type.STRING },
                      quote: { type: Type.STRING },
                    },
                    required: ['fact', 'quote'],
                  },
                },
                inferredConnections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      inference: { type: Type.STRING },
                      basedOn: { type: Type.STRING },
                    },
                    required: ['inference', 'basedOn'],
                  },
                },
                unknownOrMissing: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      conceptNeed: { type: Type.STRING },
                      reason: { type: Type.STRING },
                    },
                    required: ['conceptNeed', 'reason'],
                  },
                },
                detectedContradictions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      contradiction: { type: Type.STRING },
                      quotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['contradiction', 'quotes'],
                  },
                },
                cannotDetermine: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                currentCuriosity: {
                  type: Type.STRING,
                },
              },
              required: [
                'explicitlyTaught',
                'inferredConnections',
                'unknownOrMissing',
                'detectedContradictions',
                'cannotDetermine',
                'currentCuriosity',
              ],
            },
          },
          required: ['studentReflection', 'targetedQuestion', 'mentalModel'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.studentReflection && parsed.targetedQuestion) {
      return parsed;
    }
    throw new Error('Malformed Student Zero response');
  } catch (err) {
    console.error('Student Zero turn error, invoking deterministic fallback:', err);
    return generateDeterministicStudentTurn(concept, history, userMessage);
  }
}

// Backwards compatibility alias
export const processTeachingTurn = processStudentZeroTurn;

// ============================================================================
// LAYER 2: HIDDEN CANONICAL EVALUATOR (PRIVATE CAUSAL AUDITOR)
// ============================================================================
// - Evaluates against canonical nodes and edges.
// - Student Zero NEVER sees this canonical model.
// - Does NOT use percentage scores.
// - Must return verbatim quotes from transcript for every finding, or "No statement in transcript".
// - Core verdict: "YOU KNEW THE PIECES. YOU DIDN'T CONNECT THEM."
// ============================================================================

export async function reconstructCausalUnderstanding(
  concept: ConceptChallenge,
  history: ConversationTurn[]
): Promise<ReconstructionResult> {
  const userTurns = history.filter((t) => t.role === 'user');
  const userWordCount = userTurns.reduce((acc, t) => acc + t.text.trim().split(/\s+/).length, 0);

  if (userTurns.length === 0 || userWordCount < 6) {
    return {
      studentSynthesis: "I haven't been taught enough yet. I only have a few opening words, so the mechanism remains completely uncommunicated.",
      piecesExplained: (concept.nodes || []).map((node) => ({
        nodeId: node.id,
        label: node.label,
        status: 'missing',
        evidenceQuote: 'No statement in transcript.',
      })),
      relationships: (concept.edges || []).map((edge) => {
        const fromNode = concept.nodes?.find((n) => n.id === edge.fromNodeId);
        const toNode = concept.nodes?.find((n) => n.id === edge.toNodeId);
        return {
          id: edge.id,
          fromId: edge.fromNodeId,
          toId: edge.toNodeId,
          fromLabel: fromNode?.label || 'Source',
          toLabel: toNode?.label || 'Destination',
          requiredMechanism: edge.requiredMechanism,
          status: 'missing',
          explanation: 'Insufficient interaction to evaluate.',
          evidenceQuote: 'No statement in transcript.',
        };
      }),
      missingRelationship: {
        fromLabel: concept.nodes?.[0]?.label || 'Initial Concept',
        toLabel: concept.nodes?.[1]?.label || 'Next Step',
        gapTitle: 'Insufficient Explanation',
        gapDescription: 'Only a few words were provided. A causal explanation requires explaining how one element causes or connects to the next.',
        studentConfusionRationale: "I need an explanation of how the parts connect before I can reconstruct the idea.",
        directEvidenceQuote: userTurns[0]?.text || 'No statement in transcript.',
      },
      hasSufficientEvidence: false,
      verdict: 'INSUFFICIENT_EXPLANATION',
      summary: 'Insufficient transcript evidence to evaluate conceptual relationships.',
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateDeterministicReconstruction(concept, history);
  }

  const ai = getAI();
  const formattedTranscript = history
    .map((t, idx) => `[Turn ${idx + 1}] ${t.role.toUpperCase()}: "${t.text}"`)
    .join('\n');

  const nodesJson = JSON.stringify(concept.nodes || []);
  const edgesJson = JSON.stringify(concept.edges || []);

  const systemInstruction = `You are the HIDDEN CANONICAL EVALUATOR for STUDENT ZERO.
You are an objective causal auditor.
You have access to the canonical causal graph:
Nodes: ${nodesJson}
Edges: ${edgesJson}

EVALUATION MANDATES:
1. NEVER USE ARBITRARY PERCENTAGE SCORES. Evaluate conceptual relationships and causal links.
2. EVIDENCE GROUNDING IS MANDATORY: Every conclusion MUST cite an exact verbatim quote from the learner's turns. If the learner never stated the required relationship, return EXACTLY: "No statement in transcript." Never invent evidence.
3. Assess:
   - piecesExplained: For each canonical node, did the learner define or introduce it? Status: "explained" | "missing" | "vague".
   - relationships: For each canonical edge, did the learner explain the causal mechanism connecting them? Status: "connected" | "missing" | "broken".
   - missingRelationship: Isolate the single most critical broken or missing causal edge.
   - studentConfusionRationale: Explain why Student Zero was left confused because of that missing link.
   - studentSynthesis: Student Zero's honest retelling of what it was taught in its own words, stopping where the logic breaks.
   - verdict: If the learner mentioned components but omitted the causal mechanism connecting them, the verdict MUST be "PIECES_KNOWN_CONNECTION_MISSING". If they connected all required mechanisms, verdict is "FULL_CAUSAL_CHAIN_ESTABLISHED".`;

  const prompt = `Topic: "${concept.title}"
Complete Session Transcript:
${formattedTranscript}

Perform the causal graph evaluation and return valid JSON matching the schema.`;

  try {
    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentSynthesis: {
              type: Type.STRING,
              description: 'Student Zero reconstructing the concept in its own words based strictly on what was taught.',
            },
            piecesExplained: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nodeId: { type: Type.STRING },
                  label: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['explained', 'missing', 'vague'] },
                  evidenceQuote: { type: Type.STRING },
                },
                required: ['nodeId', 'label', 'status', 'evidenceQuote'],
              },
            },
            relationships: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  fromId: { type: Type.STRING },
                  toId: { type: Type.STRING },
                  fromLabel: { type: Type.STRING },
                  toLabel: { type: Type.STRING },
                  requiredMechanism: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['connected', 'missing', 'broken'] },
                  explanation: { type: Type.STRING },
                  evidenceQuote: { type: Type.STRING },
                },
                required: [
                  'id',
                  'fromId',
                  'toId',
                  'fromLabel',
                  'toLabel',
                  'requiredMechanism',
                  'status',
                  'explanation',
                  'evidenceQuote',
                ],
              },
            },
            missingRelationship: {
              type: Type.OBJECT,
              properties: {
                fromLabel: { type: Type.STRING },
                toLabel: { type: Type.STRING },
                gapTitle: { type: Type.STRING },
                gapDescription: { type: Type.STRING },
                studentConfusionRationale: { type: Type.STRING },
                directEvidenceQuote: { type: Type.STRING },
              },
              required: [
                'fromLabel',
                'toLabel',
                'gapTitle',
                'gapDescription',
                'studentConfusionRationale',
                'directEvidenceQuote',
              ],
            },
            hasSufficientEvidence: { type: Type.BOOLEAN },
            verdict: {
              type: Type.STRING,
              enum: ['PIECES_KNOWN_CONNECTION_MISSING', 'FULL_CAUSAL_CHAIN_ESTABLISHED', 'INSUFFICIENT_EXPLANATION'],
            },
            summary: { type: Type.STRING },
          },
          required: [
            'studentSynthesis',
            'piecesExplained',
            'relationships',
            'missingRelationship',
            'hasSufficientEvidence',
            'verdict',
            'summary',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.piecesExplained && parsed.relationships) {
      return parsed;
    }
    throw new Error('Malformed Evaluator response');
  } catch (err) {
    console.error('Hidden Evaluator error, falling back to deterministic causal audit:', err);
    return generateDeterministicReconstruction(concept, history);
  }
}

export const reconstructConceptUnderstanding = reconstructCausalUnderstanding;

// ============================================================================
// LAYER 3: SECOND-ATTEMPT DIFF (BEFORE vs AFTER REPAIR VERIFICATION)
// ============================================================================

export async function evaluateSecondAttemptDiff(
  concept: ConceptChallenge,
  targetRelationship: string,
  attempt1Transcript: string,
  attempt2Transcript: string
): Promise<SecondAttemptDiffResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateDeterministicDiff(concept, targetRelationship, attempt1Transcript, attempt2Transcript);
  }

  const ai = getAI();

  const systemInstruction = `You are the CAUSAL DIFF EVALUATOR for STUDENT ZERO.
Your mission is to compare Attempt 1 vs Attempt 2 and determine whether the learner actually bridged the targeted missing causal relationship.

TARGET MISSING RELATIONSHIP: "${targetRelationship}"
CONCEPT: "${concept.title}"

CRITICAL RULES:
1. Do NOT claim a repair unless Attempt 2 explicitly contains new causal explanation and mechanism connecting the pieces.
2. Quote the exact evidence from Attempt 2 in evidenceQuote.
3. If Attempt 2 just repeated the same vague keywords without explaining HOW the mechanism works, set repaired: false.
4. If repaired is true, explain exactly what new connection was established.`;

  const prompt = `Attempt 1 (Original Explanation):
"${attempt1Transcript}"

Target Missing Relationship:
"${targetRelationship}"

Attempt 2 (Follow-up Clarification):
"${attempt2Transcript}"

Did Attempt 2 successfully establish the missing relationship? Return JSON.`;

  try {
    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetRelationship: { type: Type.STRING },
            repaired: { type: Type.BOOLEAN },
            beforeSnippet: {
              type: Type.STRING,
              description: 'A quote or short summary of Attempt 1 showing where the connection was missing.',
            },
            afterSnippet: {
              type: Type.STRING,
              description: 'A quote from Attempt 2 demonstrating the newly explained causal mechanism.',
            },
            evidenceQuote: {
              type: Type.STRING,
              description: 'Exact verbatim quote from Attempt 2.',
            },
            explanationOfRepair: {
              type: Type.STRING,
              description: 'Why this second attempt successfully connected or failed to connect the pieces.',
            },
            reconstructedChain: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'The step-by-step causal chain now established (e.g. ["Public Key", "One-Way Trapdoor", "Private Key Decryption"]).',
            },
          },
          required: [
            'targetRelationship',
            'repaired',
            'beforeSnippet',
            'afterSnippet',
            'evidenceQuote',
            'explanationOfRepair',
            'reconstructedChain',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (typeof parsed.repaired === 'boolean') {
      return parsed;
    }
    throw new Error('Malformed Diff response');
  } catch (err) {
    console.error('Diff Evaluator error, falling back to deterministic diff:', err);
    return generateDeterministicDiff(concept, targetRelationship, attempt1Transcript, attempt2Transcript);
  }
}

// ============================================================================
// DETERMINISTIC FALLBACKS (Guarantees reliable operation offline / keyless)
// ============================================================================

function generateDeterministicStudentTurn(
  concept: ConceptChallenge,
  history: ConversationTurn[],
  userMessage: string
): StudentZeroTurnResponse {
  const words = userMessage.trim().split(/\s+/);
  const snippet = words.slice(0, 10).join(' ') + (words.length > 10 ? '...' : '');
  const userTurnsCount = history.filter((t) => t.role === 'user').length + 1;

  let question = `When you say "${snippet}", I can follow that part. But what actually connects that to the rest of the mechanism?`;
  let suggestion = `Try explaining what causes the next step to happen automatically.`;
  let isUnderstood = false;
  let progress = Math.min(95, 25 + userTurnsCount * 25);
  let stage = 'Foundational Intuition';

  if (concept.id === 'public-key-crypto') {
    if (userTurnsCount === 1) {
      question = `If anyone on the internet can see the public key, why can't an eavesdropper just use that same public key to read the encrypted message?`;
      suggestion = `Think about whether the public key works in both directions, or if it can only lock.`;
      stage = 'The Asymmetric Dilemma';
    } else if (userTurnsCount === 2) {
      question = `So the public key locks it, but only the private key can unlock it. What mathematical trapdoor prevents reversing the lock?`;
      suggestion = `Clarify why multiplying two prime numbers is easy one way, but impossible to reverse quickly.`;
      stage = 'Trapdoor Mechanism';
    } else {
      question = `So the recipient holds the private key alone. How does this completely guarantee confidentiality even across an open network?`;
      suggestion = `Summarize how the sender, receiver, and eavesdropper interact.`;
      stage = 'Full Conceptual Mastery';
      isUnderstood = true;
      progress = 100;
    }
  } else if (concept.id === 'tcp-congestion-control') {
    if (userTurnsCount === 1) {
      question = `How does a sender know a packet was lost without a central authority notifying them?`;
      suggestion = `Consider what the sender expects back from the receiver and what timers it keeps.`;
      stage = 'Packet Loss Detection';
    } else {
      question = `When duplicate ACKs or a timeout occurs, by how much does the sender throttle its transmission window?`;
      suggestion = `Explain the additive-increase multiplicative-decrease (AIMD) cycle.`;
      stage = 'Full Conceptual Mastery';
      isUnderstood = userTurnsCount >= 2;
      progress = Math.min(100, 30 + userTurnsCount * 35);
    }
  } else {
    question = `When you explained "${snippet}", how does that directly cause the subsequent step to happen?`;
    suggestion = `Nudge me through the specific chain of cause and effect.`;
    stage = userTurnsCount > 2 ? 'Full Conceptual Mastery' : 'Connecting Mechanism';
    isUnderstood = userTurnsCount >= 3;
  }

  return {
    studentReflection: `You explained that: "${snippet}". I'm seeing how that fits into ${concept.title}.`,
    helpfulSuggestion: suggestion,
    targetedQuestion: question,
    isConceptUnderstood: isUnderstood,
    masteredPercentage: progress,
    stageLabel: stage,
    mentalModel: {
      explicitlyTaught: [{ fact: userMessage.slice(0, 120), quote: snippet }],
      inferredConnections: [{ inference: 'Stated directly by teacher', basedOn: snippet }],
      unknownOrMissing: [{ conceptNeed: 'Underlying causal mechanism', reason: 'Unstated intermediate step' }],
      detectedContradictions: [],
      cannotDetermine: ['Broader operational constraints'],
      currentCuriosity: question,
    },
  };
}

function generateDeterministicReconstruction(
  concept: ConceptChallenge,
  history: ConversationTurn[]
): ReconstructionResult {
  const userTurns = history.filter((t) => t.role === 'user');
  const firstTurn = userTurns[0]?.text || '';
  const lastTurn = userTurns[userTurns.length - 1]?.text || firstTurn;

  const node1 = concept.nodes?.[0] || { id: 'node_1', label: 'First Element' };
  const node2 = concept.nodes?.[1] || { id: 'node_2', label: 'Mechanism' };
  const node3 = concept.nodes?.[2] || { id: 'node_3', label: 'Resolution' };

  return {
    studentSynthesis: `Based on what was explained, I know that: ${firstTurn.slice(0, 140)}. But I do not know what mechanism connects ${node1.label} to ${node3.label}.`,
    piecesExplained: [
      {
        nodeId: node1.id,
        label: node1.label,
        status: 'explained',
        evidenceQuote: firstTurn.slice(0, 90) || 'Mentioned in explanation',
      },
      {
        nodeId: node2.id,
        label: node2.label,
        status: 'missing',
        evidenceQuote: 'No statement in transcript.',
      },
      {
        nodeId: node3.id,
        label: node3.label,
        status: 'explained',
        evidenceQuote: lastTurn.slice(0, 90) || 'Mentioned in explanation',
      },
    ],
    relationships: (concept.edges || []).map((edge, idx) => {
      const fromNode = concept.nodes?.find((n) => n.id === edge.fromNodeId);
      const toNode = concept.nodes?.find((n) => n.id === edge.toNodeId);
      return {
        id: edge.id,
        fromId: edge.fromNodeId,
        toId: edge.toNodeId,
        fromLabel: fromNode?.label || 'Source',
        toLabel: toNode?.label || 'Destination',
        requiredMechanism: edge.requiredMechanism,
        status: idx === 0 ? 'missing' : 'connected',
        explanation:
          idx === 0
            ? 'The teacher mentioned the concepts but omitted the causal mechanism connecting them.'
            : 'Sufficiently referenced in context.',
        evidenceQuote: idx === 0 ? 'No statement in transcript.' : lastTurn.slice(0, 80),
      };
    }),
    missingRelationship: {
      fromLabel: node1.label,
      toLabel: node2.label,
      gapTitle: 'Missing One-Way Causal Mechanism',
      gapDescription: `You mentioned ${node1.label} and ${node3.label}, but you never explained the one-way mechanism (${node2.label}) connecting them.`,
      studentConfusionRationale: `I understand that both pieces exist, but I don't know how one leads to the other.`,
      directEvidenceQuote: firstTurn.slice(0, 80) || 'No statement in transcript.',
    },
    hasSufficientEvidence: true,
    verdict: 'PIECES_KNOWN_CONNECTION_MISSING',
    summary: `You knew the pieces (${node1.label} and ${node3.label}), but you didn't explain the causal bridge between them.`,
  };
}

function generateDeterministicDiff(
  concept: ConceptChallenge,
  targetRelationship: string,
  attempt1: string,
  attempt2: string
): SecondAttemptDiffResult {
  const words2 = attempt2.trim().split(/\s+/);
  const isRepaired = words2.length >= 6;

  return {
    targetRelationship,
    repaired: isRepaired,
    beforeSnippet: attempt1.slice(0, 100),
    afterSnippet: attempt2.slice(0, 120),
    evidenceQuote: attempt2.slice(0, 100),
    explanationOfRepair: isRepaired
      ? `In the second explanation, you explicitly articulated the causal link: "${attempt2.slice(0, 90)}..."`
      : `The second explanation did not provide sufficient new mechanism to establish the missing connection.`,
    reconstructedChain: [
      concept.nodes?.[0]?.label || 'Initial Component',
      targetRelationship,
      concept.nodes?.[concept.nodes.length - 1]?.label || 'Outcome',
    ],
  };
}

// ============================================================================
// DYNAMIC PERSONALIZED ROADMAP GENERATION (GEMINI)
// ============================================================================
export async function generatePersonalizedRoadmap(profile: {
  name?: string;
  preferredDomain?: string;
  focusGoal?: string;
  customInterests?: string;
}): Promise<ConceptChallenge[]> {
  const userName = profile.name || 'Teacher';
  const domain = profile.preferredDomain || 'Tech, AI & Cryptography';
  const goal = profile.focusGoal || 'Deep Understanding';
  const custom = profile.customInterests || '';

  const systemPrompt = `You are the Protégé Curriculum Architect.
Generate 3 distinct, intellectually fascinating concept challenges tailored for learner "${userName}".
Domain: "${domain}"
Learning Goal: "${goal}"
Additional interests: "${custom}"

Each concept challenge must be a rigorous first-principles lesson where the user acts as the teacher explaining to a curious student who starts with zero knowledge or a common naive misconception.
Structure them in progressive stages:
- Concept 1: Stage 1 (Foundational Intuitive Mechanism)
- Concept 2: Stage 2 (Core Intermediate Causal Process)
- Concept 3: Stage 3 (Advanced Frontier / Systems Mastery)

Every concept MUST have:
1. title: punchy, clear concept title
2. domain: "${domain}"
3. stage: 1, 2, or 3
4. description: 1-2 sentences summarizing what causal mechanism will be unlocked
5. studentPriors: Protégé's naive starting misconception or question ("I know X, but I don't understand how Y causes Z...")
6. starterPrompt: What the student asks the teacher to kick off the session
7. keyCausalComponents: exactly 3 bullet points representing the essential causal mechanisms
8. nodes: exactly 3 causal nodes (id, label, shortDescription)
9. edges: exactly 2 causal edges connecting node 1 -> node 2, and node 2 -> node 3, each with a requiredMechanism explaining the causal connection.`;

  try {
    const ai = getAI();
    const response = await generateContentWithFallback(ai, {
      contents: [
        {
          role: 'user',
          parts: [{ text: `Create 3 personalized concept challenges for ${userName} in ${domain}.` }],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              stage: { type: Type.INTEGER },
              description: { type: Type.STRING },
              studentPriors: { type: Type.STRING },
              starterPrompt: { type: Type.STRING },
              keyCausalComponents: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    shortDescription: { type: Type.STRING },
                  },
                  required: ['id', 'label', 'shortDescription'],
                },
              },
              edges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    fromNodeId: { type: Type.STRING },
                    toNodeId: { type: Type.STRING },
                    requiredMechanism: { type: Type.STRING },
                  },
                  required: ['id', 'fromNodeId', 'toNodeId', 'requiredMechanism'],
                },
              },
            },
            required: [
              'title',
              'stage',
              'description',
              'studentPriors',
              'starterPrompt',
              'keyCausalComponents',
              'nodes',
              'edges',
            ],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]') as any[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, idx) => ({
        id: `ai-roadmap-${Date.now()}-${idx}`,
        title: item.title,
        domain,
        stage: (item.stage === 1 || item.stage === 2 || item.stage === 3 ? item.stage : (idx + 1) as 1 | 2 | 3),
        description: item.description,
        studentPriors: item.studentPriors,
        starterPrompt: item.starterPrompt,
        keyCausalComponents: item.keyCausalComponents || [],
        nodes: item.nodes || [],
        edges: item.edges || [],
        isAiPersonalized: true,
      }));
    }
  } catch (err) {
    console.warn('Personalized roadmap generation failed, using fallback:', err);
  }

  // Fallback tailored concepts
  return [
    {
      id: `ai-roadmap-fallback-1-${Date.now()}`,
      title: `${domain}: Foundational First Principles`,
      domain,
      stage: 1,
      description: `Exploring how the basic laws and axioms of ${domain} produce observable phenomena.`,
      studentPriors: `I have seen ${domain} mentioned in textbooks, but I don't understand what primary trigger initiates the process.`,
      starterPrompt: `What is the single most fundamental mechanism in ${domain} that everything else depends on?`,
      keyCausalComponents: [
        'Initial state conditions and foundational elements',
        'Physical or mathematical action that transforms the state',
        'Direct observable result',
      ],
      nodes: [
        { id: 'n1', label: 'Foundational Inputs', shortDescription: 'The starting axioms or physical matter' },
        { id: 'n2', label: 'Transformative Mechanism', shortDescription: 'The core causal action connecting them' },
        { id: 'n3', label: 'Emergent Outcome', shortDescription: 'The final state produced by the mechanism' },
      ],
      edges: [
        {
          id: 'e1',
          fromNodeId: 'n1',
          toNodeId: 'n2',
          requiredMechanism: 'The starting elements undergo physical transformation.',
        },
        {
          id: 'e2',
          fromNodeId: 'n2',
          toNodeId: 'n3',
          requiredMechanism: 'The transformative process directly stabilizes into the emergent outcome.',
        },
      ],
      isAiPersonalized: true,
    },
  ];
}
