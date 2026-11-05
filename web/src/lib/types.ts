export type Gender = "masculine" | "feminine" | "neuter" | "plural";

export type PracticeItem = {
  id: string;
  setId: string;
  setTitle: string;
  lemma: string;
  lemmaEnglish: string;
  gender: Gender;
  adjective: string;
  noun: string;
  phraseRu: string;
  phraseEn: string;
  options: string[];
  correct: string;
};

export type NominativeForm = {
  adjective: string;
  noun: string;
  ru: string;
  en: string;
} | null;

export type AdjectiveGroup = {
  lemma: string;
  english: string;
  stem: "hard" | "soft";
  forms: Record<Gender, NominativeForm>;
};

export type VocabSet = {
  id: string;
  title: string;
  theme: string;
  nominative: AdjectiveGroup[];
};

export type Level1Data = {
  level: number;
  title: string;
  subtitle: string;
  endings: Record<"hard" | "soft", Record<Gender, string>>;
  genderLabels: Record<
    Gender,
    { ru: string; en: string; short: string }
  >;
  sets: VocabSet[];
  practice: PracticeItem[];
};
