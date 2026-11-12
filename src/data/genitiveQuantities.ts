export type NounGender = "masculine" | "feminine" | "neuter";

export type QuantityKind = "1" | "2-4" | "5+" | "mnogo" | "net";

export type QuantityCue = {
  kind: QuantityKind;
  label: string;
  /** Spelled Russian word that begins the full answer. */
  lead: string;
};

export type DeclinedPhrase = {
  adjective: string;
  noun: string;
  phrase: string;
};

export type GenitivePair = {
  id: string;
  gender: NounGender;
  adjectiveLemma: string;
  adjectiveEnglish: string;
  nounEnglish: string;
  nominativeSingular: DeclinedPhrase;
  genitiveSingular: DeclinedPhrase;
  genitivePlural: DeclinedPhrase;
};

export type GenitivePracticeItem = {
  id: string;
  pairId: string;
  kind: QuantityKind;
  cueLabel: string;
  lead: string;
  gender: NounGender;
  adjectiveLemma: string;
  adjectiveEnglish: string;
  nounNominative: string;
  nounEnglish: string;
  /** Full declined answer the student should type. */
  answer: string;
  answerEn: string;
  caseHint: string;
};

/** Classroom cues that drive nominative vs genitive singular vs genitive plural. */
export const quantityCues: (QuantityCue & { slug: string })[] = [
  { kind: "1", label: "1", slug: "1", lead: "один" },
  { kind: "2-4", label: "2", slug: "2", lead: "два" },
  { kind: "2-4", label: "3", slug: "3", lead: "три" },
  { kind: "2-4", label: "4", slug: "4", lead: "четыре" },
  { kind: "5+", label: "5+", slug: "5plus", lead: "пять" },
  { kind: "mnogo", label: "много", slug: "mnogo", lead: "много" },
  { kind: "net", label: "нет", slug: "net", lead: "нет" },
];

export const quantityRules: {
  kind: QuantityKind;
  title: string;
  when: string;
  caseForAdj: string;
  caseForNoun: string;
  example: string;
}[] = [
  {
    kind: "1",
    title: "1",
    when: "After один / одна / одно / одни(or the digit 1).",
    caseForAdj: "Nominative singular",
    caseForNoun: "Nominative singular",
    example: "одна красная тетрадь",
  },
  {
    kind: "2-4",
    title: "2–4",
    when: "After два / две, три, четыре.",
    caseForAdj: "Genitive plural (−ых / −их)",
    caseForNoun: "Genitive singular",
    example: "две красных тетради",
  },
  {
    kind: "5+",
    title: "5+",
    when: "After пять and higher numbers.",
    caseForAdj: "Genitive plural (−ых / −их)",
    caseForNoun: "Genitive plural",
    example: "пять красных тетрадей",
  },
  {
    kind: "mnogo",
    title: "много",
    when: "After много, мало, сколько, несколько, and similar quantity words.",
    caseForAdj: "Genitive plural (−ых / −их)",
    caseForNoun: "Genitive plural",
    example: "много красных тетрадей",
  },
  {
    kind: "net",
    title: "нет",
    when: "After нет when you mean “there aren’t any / no …”.",
    caseForAdj: "Genitive plural (−ых / −их)",
    caseForNoun: "Genitive plural",
    example: "нет красных тетрадей",
  },
];

export const genitiveEndingCharts = {
  adjectives: {
    singular: {
      masculine: "−ого / −его",
      feminine: "−ой / −ей",
      neuter: "−ого / −его",
    },
    plural: {
      masculine: "−ых / −их",
      feminine: "−ых / −их",
      neuter: "−ых / −их",
    },
  },
  nouns: {
    singular: {
      masculine: "−а / −я",
      feminine: "−ы / −и",
      neuter: "−а / −я",
    },
    consonants: {
      masculine: "−ов",
      feminine: "—",
      neuter: "—",
    },
    й: {
      masculine: "−ев",
      feminine: "−",
      neuter: "−",
    },
    ь: {
      masculine: "−ей",
      feminine: "−ей",
      neuter: "−ей",
    },
    ж: {
      masculine: "−ей",
      feminine: "—",
      neuter: "—",
    },
    а: {
      masculine: "−",
      feminine: "∅",
      neuter: "∅",
    },
    я: {
      masculine: "−",
      feminine: "—ь / ∅",
      neuter: "—",
    },
  },
};

/**
 * Curated adjective–noun pairs with all forms needed for quantity drills.
 * Adjective with 2–4 uses genitive plural; noun uses genitive singular.
 */
export const genitivePairs: GenitivePair[] = [
  {
    id: "krasnaya-tetrad",
    gender: "feminine",
    adjectiveLemma: "красный",
    adjectiveEnglish: "red",
    nounEnglish: "notebook",
    nominativeSingular: {
      adjective: "красная",
      noun: "тетрадь",
      phrase: "красная тетрадь",
    },
    genitiveSingular: {
      adjective: "красной",
      noun: "тетради",
      phrase: "красной тетради",
    },
    genitivePlural: {
      adjective: "красных",
      noun: "тетрадей",
      phrase: "красных тетрадей",
    },
  },
  {
    id: "chernaya-sumka",
    gender: "feminine",
    adjectiveLemma: "чёрный",
    adjectiveEnglish: "black",
    nounEnglish: "bag",
    nominativeSingular: {
      adjective: "чёрная",
      noun: "сумка",
      phrase: "чёрная сумка",
    },
    genitiveSingular: {
      adjective: "чёрной",
      noun: "сумки",
      phrase: "чёрной сумки",
    },
    genitivePlural: {
      adjective: "чёрных",
      noun: "сумок",
      phrase: "чёрных сумок",
    },
  },
  {
    id: "sinyaya-ruchka",
    gender: "feminine",
    adjectiveLemma: "синий",
    adjectiveEnglish: "blue",
    nounEnglish: "pen",
    nominativeSingular: {
      adjective: "синяя",
      noun: "ручка",
      phrase: "синяя ручка",
    },
    genitiveSingular: {
      adjective: "синей",
      noun: "ручки",
      phrase: "синей ручки",
    },
    genitivePlural: {
      adjective: "синих",
      noun: "ручек",
      phrase: "синих ручек",
    },
  },
  {
    id: "belaya-doska",
    gender: "feminine",
    adjectiveLemma: "белый",
    adjectiveEnglish: "white",
    nounEnglish: "board",
    nominativeSingular: {
      adjective: "белая",
      noun: "доска",
      phrase: "белая доска",
    },
    genitiveSingular: {
      adjective: "белой",
      noun: "доски",
      phrase: "белой доски",
    },
    genitivePlural: {
      adjective: "белых",
      noun: "досок",
      phrase: "белых досок",
    },
  },
  {
    id: "novaya-zaryadka",
    gender: "feminine",
    adjectiveLemma: "новый",
    adjectiveEnglish: "new",
    nounEnglish: "charger",
    nominativeSingular: {
      adjective: "новая",
      noun: "зарядка",
      phrase: "новая зарядка",
    },
    genitiveSingular: {
      adjective: "новой",
      noun: "зарядки",
      phrase: "новой зарядки",
    },
    genitivePlural: {
      adjective: "новых",
      noun: "зарядок",
      phrase: "новых зарядок",
    },
  },
  {
    id: "krasnyy-koshelyok",
    gender: "masculine",
    adjectiveLemma: "красный",
    adjectiveEnglish: "red",
    nounEnglish: "wallet",
    nominativeSingular: {
      adjective: "красный",
      noun: "кошелёк",
      phrase: "красный кошелёк",
    },
    genitiveSingular: {
      adjective: "красного",
      noun: "кошелька",
      phrase: "красного кошелька",
    },
    genitivePlural: {
      adjective: "красных",
      noun: "кошельков",
      phrase: "красных кошельков",
    },
  },
  {
    id: "siniy-karandash",
    gender: "masculine",
    adjectiveLemma: "синий",
    adjectiveEnglish: "blue",
    nounEnglish: "pencil",
    nominativeSingular: {
      adjective: "синий",
      noun: "карандаш",
      phrase: "синий карандаш",
    },
    genitiveSingular: {
      adjective: "синего",
      noun: "карандаша",
      phrase: "синего карандаша",
    },
    genitivePlural: {
      adjective: "синих",
      noun: "карандашей",
      phrase: "синих карандашей",
    },
  },
  {
    id: "zelyonyy-ryukzak",
    gender: "masculine",
    adjectiveLemma: "зелёный",
    adjectiveEnglish: "green",
    nounEnglish: "backpack",
    nominativeSingular: {
      adjective: "зелёный",
      noun: "рюкзак",
      phrase: "зелёный рюкзак",
    },
    genitiveSingular: {
      adjective: "зелёного",
      noun: "рюкзака",
      phrase: "зелёного рюкзака",
    },
    genitivePlural: {
      adjective: "зелёных",
      noun: "рюкзаков",
      phrase: "зелёных рюкзаков",
    },
  },
  {
    id: "novyy-telefon",
    gender: "masculine",
    adjectiveLemma: "новый",
    adjectiveEnglish: "new",
    nounEnglish: "phone",
    nominativeSingular: {
      adjective: "новый",
      noun: "телефон",
      phrase: "новый телефон",
    },
    genitiveSingular: {
      adjective: "нового",
      noun: "телефона",
      phrase: "нового телефона",
    },
    genitivePlural: {
      adjective: "новых",
      noun: "телефонов",
      phrase: "новых телефонов",
    },
  },
  {
    id: "korichnevyy-stol",
    gender: "masculine",
    adjectiveLemma: "коричневый",
    adjectiveEnglish: "brown",
    nounEnglish: "table",
    nominativeSingular: {
      adjective: "коричневый",
      noun: "стол",
      phrase: "коричневый стол",
    },
    genitiveSingular: {
      adjective: "коричневого",
      noun: "стола",
      phrase: "коричневого стола",
    },
    genitivePlural: {
      adjective: "коричневых",
      noun: "столов",
      phrase: "коричневых столов",
    },
  },
  {
    id: "beloe-okno",
    gender: "neuter",
    adjectiveLemma: "белый",
    adjectiveEnglish: "white",
    nounEnglish: "window",
    nominativeSingular: {
      adjective: "белое",
      noun: "окно",
      phrase: "белое окно",
    },
    genitiveSingular: {
      adjective: "белого",
      noun: "окна",
      phrase: "белого окна",
    },
    genitivePlural: {
      adjective: "белых",
      noun: "окон",
      phrase: "белых окон",
    },
  },
  {
    id: "sinee-okno",
    gender: "neuter",
    adjectiveLemma: "синий",
    adjectiveEnglish: "blue",
    nounEnglish: "window",
    nominativeSingular: {
      adjective: "синее",
      noun: "окно",
      phrase: "синее окно",
    },
    genitiveSingular: {
      adjective: "синего",
      noun: "окна",
      phrase: "синего окна",
    },
    genitivePlural: {
      adjective: "синих",
      noun: "окон",
      phrase: "синих окон",
    },
  },
  {
    id: "novoe-slovo",
    gender: "neuter",
    adjectiveLemma: "новый",
    adjectiveEnglish: "new",
    nounEnglish: "word",
    nominativeSingular: {
      adjective: "новое",
      noun: "слово",
      phrase: "новое слово",
    },
    genitiveSingular: {
      adjective: "нового",
      noun: "слова",
      phrase: "нового слова",
    },
    genitivePlural: {
      adjective: "новых",
      noun: "слов",
      phrase: "новых слов",
    },
  },
  {
    id: "russkiy-roman",
    gender: "masculine",
    adjectiveLemma: "русский",
    adjectiveEnglish: "Russian",
    nounEnglish: "novel",
    nominativeSingular: {
      adjective: "русский",
      noun: "роман",
      phrase: "русский роман",
    },
    genitiveSingular: {
      adjective: "русского",
      noun: "романа",
      phrase: "русского романа",
    },
    genitivePlural: {
      adjective: "русских",
      noun: "романов",
      phrase: "русских романов",
    },
  },
  {
    id: "interesnaya-kniga",
    gender: "feminine",
    adjectiveLemma: "интересный",
    adjectiveEnglish: "interesting",
    nounEnglish: "book",
    nominativeSingular: {
      adjective: "интересная",
      noun: "книга",
      phrase: "интересная книга",
    },
    genitiveSingular: {
      adjective: "интересной",
      noun: "книги",
      phrase: "интересной книги",
    },
    genitivePlural: {
      adjective: "интересных",
      noun: "книг",
      phrase: "интересных книг",
    },
  },
];

function numeralForCue(cue: QuantityCue, gender: NounGender): string {
  if (cue.kind === "1") {
    if (gender === "feminine") return "одна";
    if (gender === "neuter") return "одно";
    return "один";
  }
  if (cue.kind === "2-4" && cue.label === "2") {
    return gender === "feminine" ? "две" : "два";
  }
  return cue.lead;
}

function englishForItem(cue: QuantityCue, pair: GenitivePair): string {
  const adj = pair.adjectiveEnglish;
  const noun = pair.nounEnglish;
  switch (cue.kind) {
    case "1":
      return `one ${adj} ${noun}`;
    case "2-4":
      return `${cue.label} ${adj} ${noun}s`;
    case "5+":
      return `five ${adj} ${noun}s`;
    case "mnogo":
      return `many ${adj} ${noun}s`;
    case "net":
      return `no ${adj} ${noun}s`;
    default:
      return `${adj} ${noun}`;
  }
}

function caseHintFor(kind: QuantityKind): string {
  switch (kind) {
    case "1":
      return "Nominative singular for adjective and noun";
    case "2-4":
      return "Genitive plural adjective + genitive singular noun";
    case "5+":
    case "mnogo":
    case "net":
      return "Genitive plural for adjective and noun";
    default:
      return "";
  }
}

function buildAnswer(cue: QuantityCue, pair: GenitivePair): string {
  const lead = numeralForCue(cue, pair.gender);
  if (cue.kind === "1") {
    return `${lead} ${pair.nominativeSingular.phrase}`;
  }
  if (cue.kind === "2-4") {
    return `${lead} ${pair.genitivePlural.adjective} ${pair.genitiveSingular.noun}`;
  }
  return `${lead} ${pair.genitivePlural.phrase}`;
}

export function buildGenitivePracticeItems(): GenitivePracticeItem[] {
  const items: GenitivePracticeItem[] = [];
  for (const pair of genitivePairs) {
    for (const cue of quantityCues) {
      items.push({
        id: `${pair.id}:${cue.kind}:${cue.slug}`,
        pairId: pair.id,
        kind: cue.kind,
        cueLabel: cue.label,
        lead: numeralForCue(cue, pair.gender),
        gender: pair.gender,
        adjectiveLemma: pair.adjectiveLemma,
        adjectiveEnglish: pair.adjectiveEnglish,
        nounNominative: pair.nominativeSingular.noun,
        nounEnglish: pair.nounEnglish,
        answer: buildAnswer(cue, pair),
        answerEn: englishForItem(cue, pair),
        caseHint: caseHintFor(cue.kind),
      });
    }
  }
  return items;
}

export const genitivePracticeItems = buildGenitivePracticeItems();

export function normalizeGenitiveAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ");
}

export function isGenitiveAnswerCorrect(given: string, expected: string): boolean {
  const normalizedGiven = normalizeGenitiveAnswer(given);
  const normalizedExpected = normalizeGenitiveAnswer(expected);
  if (normalizedGiven === normalizedExpected) return true;
  // Accept ё/е already handled; also allow digit cue replaced by spelled numeral only in expected.
  return false;
}
