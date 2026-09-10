export interface UserProfile {
  name: string;
  focusGoal: string;
  preferredDomain: string;
  experienceLevel: string;
  createdAt: string;
}

const STORAGE_KEY = 'student_zero_learner_profile';

export function getStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Could not save user profile to localStorage:', err);
  }
}

export function clearStoredProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear user profile:', err);
  }
}
