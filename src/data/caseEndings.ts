export type Gender = "masculine" | "feminine" | "neuter";
export type CaseKey =
  | "nominative"
  | "genitive"
  | "dative"
  | "accusative"
  | "instrumental"
  | "prepositional";

export type CaseAnswer = {
  adjective: string[];
  noun: string[];
};

export type CaseDefinition = {
  label: string;
  hint: string;
  answers: Record<Gender, CaseAnswer>;
};

export const genders: Gender[] = ["masculine", "feminine", "neuter"];

export const cases: Record<CaseKey, CaseDefinition> = {
  nominative: {
    label: "Nominative",
    hint: "The dictionary or subject form.",
    answers: {
      masculine: { adjective: ["ый", "ой", "ий"], noun: ["", "—", "й", "ь"] },
      feminine: { adjective: ["ая", "яя"], noun: ["а", "я"] },
      neuter: { adjective: ["ое", "ее"], noun: ["о", "е"] },
    },
  },
  genitive: {
    label: "Genitive",
    hint: "Often expresses possession or “of/from”.",
    answers: {
      masculine: { adjective: ["ого", "его"], noun: ["а", "я"] },
      feminine: { adjective: ["ой", "ей"], noun: ["ы", "и"] },
      neuter: { adjective: ["ого", "его"], noun: ["а", "я"] },
    },
  },
  dative: {
    label: "Dative",
    hint: "Often expresses “to/for”.",
    answers: {
      masculine: { adjective: ["ому", "ему"], noun: ["у", "ю"] },
      feminine: { adjective: ["ой", "ей"], noun: ["е"] },
      neuter: { adjective: ["ому", "ему"], noun: ["у", "ю"] },
    },
  },
  accusative: {
    label: "Accusative",
    hint: "Often marks the direct object; masculine endings depend on animacy.",
    answers: {
      masculine: {
        adjective: ["ый", "ой", "ий", "ого", "его"],
        noun: ["", "—", "а", "я"],
      },
      feminine: { adjective: ["ую", "юю"], noun: ["у", "ю"] },
      neuter: { adjective: ["ое", "ее"], noun: ["о", "е"] },
    },
  },
  instrumental: {
    label: "Instrumental",
    hint: "Often expresses “with/by”.",
    answers: {
      masculine: { adjective: ["ым", "им"], noun: ["ом", "ем"] },
      feminine: { adjective: ["ой", "ей"], noun: ["ой", "ей", "ью"] },
      neuter: { adjective: ["ым", "им"], noun: ["ом", "ем"] },
    },
  },
  prepositional: {
    label: "Prepositional",
    hint: "Used after certain prepositions, often for location or topic.",
    answers: {
      masculine: { adjective: ["ом", "ем"], noun: ["е"] },
      feminine: { adjective: ["ой", "ей"], noun: ["е"] },
      neuter: { adjective: ["ом", "ем"], noun: ["е"] },
    },
  },
};

export const caseOrder = Object.keys(cases) as CaseKey[];
