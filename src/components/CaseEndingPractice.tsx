"use client";

import { useState } from "react";
import {
  cases,
  caseOrder,
  genders,
  type CaseKey,
  type Gender,
} from "@/data/caseEndings";
type EndingField = "adjective" | "noun";

const endingChoices = [
  "—",
  "а",
  "я",
  "ы",
  "и",
  "у",
  "ю",
  "е",
  "ом",
  "ем",
  "ой",
  "ей",
  "ого",
  "его",
  "ому",
  "ему",
  "ым",
  "им",
  "ую",
  "юю",
  "ое",
  "ее",
  "ый",
  "ой",
  "ий",
  "ая",
  "яя",
  "ью",
];

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

function choicesFor(answers: string[]) {
  return [...new Set([...answers.map((answer) => answer || "—"), ...endingChoices])];
}

export function CaseEndingPractice() {
  const [selectedCase, setSelectedCase] = useState<CaseKey>("nominative");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [multipleChoice, setMultipleChoice] = useState(false);

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
    setMultipleChoice(false);
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

  function toggleMultipleChoice(enabled: boolean) {
    setMultipleChoice(enabled);
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
        <label className="toggle">
          <input
            type="checkbox"
            checked={multipleChoice}
            onChange={(event) => toggleMultipleChoice(event.target.checked)}
          />
          <span>Multiple choice for this case</span>
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
                      {multipleChoice ? (
                        <select
                          className={
                            checked
                              ? correct
                                ? "case-answer--correct"
                                : "case-answer--wrong"
                              : ""
                          }
                          value={value}
                          onChange={(event) =>
                            updateAnswer(gender, field, event.target.value)
                          }
                          aria-label={`${gender} ${field} ending`}
                          aria-invalid={checked && !correct}
                        >
                          <option value="">Choose an ending</option>
                          {choicesFor(definition.answers[gender][field]).map((ending) => (
                            <option key={ending} value={ending}>
                              {ending}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className={
                            checked
                              ? correct
                                ? "case-answer--correct"
                                : "case-answer--wrong"
                              : ""
                          }
                          type="text"
                          value={value}
                          onChange={(event) =>
                            updateAnswer(gender, field, event.target.value)
                          }
                          placeholder="enter ending"
                          aria-label={`${gender} ${field} ending`}
                          aria-invalid={checked && !correct}
                        />
                      )}
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
