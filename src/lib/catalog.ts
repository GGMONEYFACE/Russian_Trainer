import level1 from "@/data/level1.json";
import { caseOrder, cases, type CaseKey } from "@/data/caseEndings";
import type { Level1Data } from "@/lib/types";

const data = level1 as Level1Data;

export type PracticeOption = {
  id: string;
  title: string;
};

export function level1Sets() {
  return data.sets.map((set) => ({ id: set.id, title: set.title }));
}

export function isLevel1Set(setId: string) {
  return data.sets.some((set) => set.id === setId);
}

export function isCaseKey(value: string): value is CaseKey {
  return caseOrder.includes(value as CaseKey);
}

export function practiceOptions(): PracticeOption[] {
  return [
    { id: "level1", title: "Gender agreement · All sets" },
    ...data.sets.map((set) => ({
      id: `level1:${set.id}`,
      title: `Gender agreement · ${set.title}`,
    })),
    { id: "case-endings", title: "Case endings · All cases" },
    ...caseOrder.map((caseKey) => ({
      id: `case-endings:${caseKey}`,
      title: `Case endings · ${cases[caseKey].label}`,
    })),
    { id: "genitive-case", title: "Genitive case endings · Quantities" },
  ];
}

export function practiceTitle(practiceId: string) {
  return practiceOptions().find((option) => option.id === practiceId)?.title ?? null;
}

export function practicePath(practiceId: string, assignmentId?: string) {
  const params = new URLSearchParams();
  if (assignmentId) params.set("assignment", assignmentId);

  if (practiceId === "level1") {
    const query = params.toString();
    return query ? `/practice?${query}` : "/practice";
  }

  if (practiceId.startsWith("level1:")) {
    params.set("set", practiceId.slice("level1:".length));
    return `/practice?${params.toString()}`;
  }

  if (practiceId === "case-endings") {
    const query = params.toString();
    return query ? `/practice/case-endings?${query}` : "/practice/case-endings";
  }

  if (practiceId.startsWith("case-endings:")) {
    params.set("case", practiceId.slice("case-endings:".length));
    return `/practice/case-endings?${params.toString()}`;
  }

  if (practiceId === "genitive-case") {
    const query = params.toString();
    return query ? `/practice/genitive?${query}` : "/practice/genitive";
  }

  return "/practice";
}

export function caseKeys() {
  return caseOrder;
}
