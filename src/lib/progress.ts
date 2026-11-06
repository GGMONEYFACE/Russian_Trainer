const KEY = "russian-trainer-progress-v1";

export type ProgressState = {
  answered: number;
  correct: number;
  streak: number;
  bestStreak: number;
  seenIds: string[];
};

const empty: ProgressState = {
  answered: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  seenIds: [],
};

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

export function saveProgress(state: ProgressState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function recordAnswer(
  state: ProgressState,
  itemId: string,
  wasCorrect: boolean,
): ProgressState {
  const streak = wasCorrect ? state.streak + 1 : 0;
  const next: ProgressState = {
    answered: state.answered + 1,
    correct: state.correct + (wasCorrect ? 1 : 0),
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    seenIds: state.seenIds.includes(itemId)
      ? state.seenIds
      : [...state.seenIds, itemId],
  };
  saveProgress(next);
  return next;
}
