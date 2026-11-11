"use server";

import { getCurrentUser } from "@/lib/session";
import {
  finishGenitiveRound as finishStoredGenitiveRound,
  finishLevelRound as finishStoredRound,
  saveAttempt,
  saveCaseRound,
  type AttemptInput,
  type ProgressResult,
} from "@/lib/store";

const quiet: ProgressResult = { ok: false, message: "" };

export async function recordAttempt(input: AttemptInput): Promise<ProgressResult> {
  const user = await getCurrentUser();
  if (!user) return quiet;
  return saveAttempt(user.id, input);
}

export async function finishLevelRound(input: {
  setId: string;
  total: number;
}): Promise<ProgressResult> {
  const user = await getCurrentUser();
  if (!user) return quiet;
  return finishStoredRound(user.id, input.setId, input.total);
}

export async function finishGenitiveRound(input: {
  total: number;
}): Promise<ProgressResult> {
  const user = await getCurrentUser();
  if (!user) return quiet;
  return finishStoredGenitiveRound(user.id, input.total);
}

export async function recordCaseRound(input: {
  caseKey: string;
  cells: AttemptInput[];
}): Promise<ProgressResult> {
  const user = await getCurrentUser();
  if (!user) return quiet;
  return saveCaseRound(user.id, input.caseKey, input.cells);
}
