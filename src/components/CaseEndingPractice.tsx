"use client";

import { useState } from "react";

type Gender = "masculine" | "feminine" | "neuter";
type CaseKey = "nominative" | "genitive" | "dative" | "accusative" | "instrumental" | "prepositional";
type EndingField = "adjective" | "noun";

type CaseAnswer = {
  adjective: string[];
  noun: string[];
};

type CaseDefinition = {
  label: string;
  hint: string;
  answers: Record<Gender, CaseAnswer>;
};

const genders: Gender[] = ["masculine", "feminine", "neuter"];

const cases: Record<CaseKey, CaseDefinition> = {
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

const caseOrder = Object.keys(cases) as CaseKey[];

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/^-/, "");
}

function isCorrect(value: string, answers: string[]) {
  const enteredAnswers = value
    .split("/")
    .map(normalizeAnswer)
    .filter(Boolean);
  return (
    enteredAnswers.length > 0 &&
    enteredAnswers.every((entered) =>
      answers.some((answer) => normalizeAnswer(answer) === entered),
    )
  );
}

export function CaseEndingPractice() {
  const [selectedCase, setSelectedCase] = useState<CaseKey>("nominative");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const definition = cases[selectedCase];
  const answerKey = (gender: Gender, field: EndingField) =>
    `${selectedCase}-${gender}-${field}`;
  const total = genders.length * 2;
  const score = genders.reduce(
    (count, gender) =>
      count +
      Number(isCorrect(answers[answerKey(gender, "adjective")] ?? "", definition.answers[gender].adjective)) +
      Number(isCorrect(answers[answerKey(gender, "noun")] ?? "", definition.answers[gender].noun)),
    0,
  );

  function changeCase(nextCase: CaseKey) {
    setSelectedCase(nextCase);
    setAnswers({});
    setChecked(false);
  }

  function updateAnswer(gender: Gender, field: EndingField, value: string) {
    setAnswers((current) => ({ ...current, [answerKey(gender, field)]: value }));
    setChecked(false);
  }

  function checkAnswers() {
    setChecked(true);
  }

  function resetAnswers() {
    setAnswers({});
    setChecked(false);
  }

  return (
    <div className="case-practice">
      <div className="case-practice__toolbar">
        <label className="field">
          <span>Case</span>
          <select
            value={selectedCase}
            onChange={(event) => changeCase(event.target.value as CaseKey)}
          >
            {caseOrder.map((caseKey) => (
              <option key={caseKey} value={caseKey}>
                {cases[caseKey].label}
              </option>
            ))}
          </select>
        </label>
        <span className="muted">
          {checked ? `${score}/${total} correct` : "Fill in all six endings"}
        </span>
      </div>

      <section className="case-chart">
        <div className="case-chart__heading">
          <div>
            <h2>{definition.label}</h2>
            <p className="muted">{definition.hint}</p>
          </div>
        </div>

        <table className="adj-table case-chart__table">
          <thead>
            <tr>
              <th scope="col"> </th>
              <th scope="col">Adjectives</th>
              <th scope="col">Nouns</th>
            </tr>
          </thead>
          <tbody>
            {genders.map((gender) => (
              <tr key={gender}>
                <th scope="row">{gender}</th>
                {(["adjective", "noun"] as EndingField[]).map((field) => {
                  const key = answerKey(gender, field);
                  const value = answers[key] ?? "";
                  const correct = isCorrect(value, definition.answers[gender][field]);
                  return (
                    <td key={field}>
                      <input
                        className={
                          checked ? (correct ? "case-answer--correct" : "case-answer--wrong") : ""
                        }
                        type="text"
                        value={value}
                        onChange={(event) => updateAnswer(gender, field, event.target.value)}
                        placeholder="enter ending"
                        aria-label={`${gender} ${field} ending`}
                        aria-invalid={checked && !correct}
                      />
                      {checked && !correct && (
                        <small className="case-answer__expected">
                          Expected: {definition.answers[gender][field].map((ending) => ending || "—").join(" / ")}
                        </small>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cta-row case-chart__actions">
          <button type="button" className="btn btn--primary" onClick={checkAnswers}>
            Check answers
          </button>
          <button type="button" className="btn btn--ghost-dark" onClick={resetAnswers}>
            Reset
          </button>
        </div>
      </section>
    </div>
  );
}
