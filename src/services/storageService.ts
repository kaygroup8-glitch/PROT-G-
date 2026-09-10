import { TeachingSessionRecord } from '../types';

export interface UserLearningProfile {
  name: string;
  focusGoal: string;
  streakDays: number;
  lastActiveDate: string;
  totalXp: number;
  completedConceptIds: string[];
  termsAgreed: boolean;
  termsAgreedDate?: string;
  voiceGuideEnabled: boolean;
}

const STORAGE_KEY = 'protege_user_learning_state';
const TERMS_KEY = 'protege_terms_agreed';
const VOICE_KEY = 'protege_voice_enabled';
const HISTORY_KEY = 'protege_session_history_records_v1';

const DEFAULT_PROFILE: UserLearningProfile = {
  name: 'Learner',
  focusGoal: 'Deep First-Principles Mastery',
  streakDays: 1,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  totalXp: 50,
  completedConceptIds: [],
  termsAgreed: false,
  voiceGuideEnabled: true,
};

export function getStoredUserLearningProfile(): UserLearningProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check legacy terms key
      const legacyTerms = localStorage.getItem(TERMS_KEY) === 'true';
      const legacyVoice = localStorage.getItem(VOICE_KEY) !== 'false';
      return {
        ...DEFAULT_PROFILE,
        termsAgreed: legacyTerms,
        voiceGuideEnabled: legacyVoice,
      };
    }
    const parsed = JSON.parse(raw) as UserLearningProfile;
    
    // Check streak
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (parsed.lastActiveDate === yesterday) {
        parsed.streakDays += 1;
      }
      parsed.lastActiveDate = today;
      saveStoredUserLearningProfile(parsed);
    }

    return parsed;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredUserLearningProfile(profile: UserLearningProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(TERMS_KEY, profile.termsAgreed ? 'true' : 'false');
    localStorage.setItem(VOICE_KEY, profile.voiceGuideEnabled ? 'true' : 'false');
  } catch (err) {
    console.warn('Could not save learning profile to localStorage:', err);
  }
}

export function hasUserAgreedToTerms(): boolean {
  try {
    if (localStorage.getItem(TERMS_KEY) === 'true') return true;
    const profile = getStoredUserLearningProfile();
    return Boolean(profile.termsAgreed);
  } catch {
    return false;
  }
}

export function recordTermsAgreement(): void {
  try {
    localStorage.setItem(TERMS_KEY, 'true');
    const profile = getStoredUserLearningProfile();
    profile.termsAgreed = true;
    profile.termsAgreedDate = new Date().toISOString();
    saveStoredUserLearningProfile(profile);
  } catch (err) {
    console.warn('Could not record terms agreement:', err);
  }
}

export function awardConceptMastery(conceptId: string, xpEarned: number = 50): UserLearningProfile {
  const profile = getStoredUserLearningProfile();
  if (!profile.completedConceptIds.includes(conceptId)) {
    profile.completedConceptIds.push(conceptId);
  }
  profile.totalXp += xpEarned;
  saveStoredUserLearningProfile(profile);
  return profile;
}

export function toggleVoiceGuideSetting(): boolean {
  const profile = getStoredUserLearningProfile();
  profile.voiceGuideEnabled = !profile.voiceGuideEnabled;
  saveStoredUserLearningProfile(profile);
  return profile.voiceGuideEnabled;
}

// ==========================================
// DEVICE-PERSISTED TEACHING SESSION HISTORY
// ==========================================

export function getStoredTeachingSessions(): TeachingSessionRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as TeachingSessionRecord[];
    // Return sorted newest first
    return Array.isArray(list) ? list.sort((a, b) => b.timestamp - a.timestamp) : [];
  } catch (err) {
    console.warn('Could not read session history from localStorage:', err);
    return [];
  }
}

export function saveStoredTeachingSession(
  session: Omit<TeachingSessionRecord, 'id' | 'timestamp' | 'dateFormatted'> & {
    id?: string;
    timestamp?: number;
  }
): TeachingSessionRecord {
  const list = getStoredTeachingSessions();
  const timestamp = session.timestamp || Date.now();
  const now = new Date(timestamp);
  const dateFormatted = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const record: TeachingSessionRecord = {
    id: session.id || `session_${timestamp}_${Math.random().toString(36).slice(2, 7)}`,
    conceptId: session.conceptId,
    conceptTitle: session.conceptTitle,
    domain: session.domain,
    timestamp,
    dateFormatted,
    turnsCount: session.turnsCount || (session.turns ? session.turns.length : 0),
    verdict: session.verdict,
    verdictLabel: session.verdictLabel,
    xpEarned: session.xpEarned || 50,
    summary: session.summary,
    missingGapTitle: session.missingGapTitle,
    turns: session.turns || [],
    reconstructionResult: session.reconstructionResult,
    diffResult: session.diffResult,
  };

  // Replace existing record if id matches, or prepend
  const existingIdx = list.findIndex((item) => item.id === record.id);
  if (existingIdx >= 0) {
    list[existingIdx] = record;
  } else {
    list.unshift(record);
  }

  // Cap at 50 sessions on device to avoid quota limits
  const capped = list.slice(0, 50);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(capped));
  } catch (err) {
    console.warn('Could not write session history to localStorage:', err);
  }

  return record;
}

export function deleteStoredTeachingSession(sessionId: string): void {
  const list = getStoredTeachingSessions().filter((s) => s.id !== sessionId);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Could not delete session from localStorage:', err);
  }
}

export function clearStoredTeachingSessions(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.warn('Could not clear session history:', err);
  }
}
