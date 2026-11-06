import type { Gender, PracticeItem } from "./types";

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function filterPractice(
  items: PracticeItem[],
  opts: { setId?: string; genders?: Gender[] },
): PracticeItem[] {
  return items.filter((item) => {
    if (opts.setId && opts.setId !== "all" && item.setId !== opts.setId) {
      return false;
    }
    if (opts.genders && opts.genders.length > 0) {
      return opts.genders.includes(item.gender);
    }
    return true;
  });
}

export function genderHint(gender: Gender): string {
  switch (gender) {
    case "masculine":
      return "мужской род";
    case "feminine":
      return "женский род";
    case "neuter":
      return "средний род";
    case "plural":
      return "множественное число";
    default:
      return "";
  }
}

const adjectiveEndings = ["ая", "яя", "ое", "ее", "ые", "ие", "ый", "ой", "ий"];

export function adjectiveEnding(adjective: string): string {
  return (
    adjectiveEndings.find((ending) => adjective.endsWith(ending)) ?? adjective
  );
}

export function adjectiveStem(adjective: string): string {
  const ending = adjectiveEnding(adjective);
  if (ending === adjective) return adjective;
  return adjective.slice(0, -ending.length);
}

export function normalizeEnding(value: string): string {
  return value.trim().replace(/^[\-‑–—]+|[\-‑–—]+$/g, "");
}
