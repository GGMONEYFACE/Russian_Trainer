"use client";

import { useState } from "react";
import { recordCaseRound } from "@/app/actions/progress";
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

export function CaseEndingPractice({
  initialCase = "nominative",
  lockCase = false,
  signedIn = false,
  assignmentTitle,
}: {
  initialCase?: CaseKey;
  lockCase?: boolean;
  signedIn?: boolean;
  assignmentTitle?: string;
}) {
  const [selectedCase, setSelectedCase] = useState<CaseKey>(initialCase);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [note, setNote] = useState("");

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
    setNote("");
  }

  function updateAnswer(gender: Gender, field: EndingField, value: string) {
    setAnswers((current) => ({ ...current, [answerKey(gender, field)]: value }));
    setChecked(false);
  }

  async function checkAnswers() {
    setChecked(true);
    if (!signedIn) return;
    const cells = genders.flatMap((gender) =>
      (["adjective", "noun"] as EndingField[]).map((field) => {
        const value = answers[answerKey(gender, field)] ?? "";
        const expected = definition.answers[gender][field];
        return {
          questionKey: `case:${selectedCase}:${gender}:${field}`,
          practiceId: `case-endings:${selectedCase}`,
          prompt: `${definition.label}: ${gender} ${field}`,
          detail: `${gender} ${field}`,
          expected: expected.map((ending) => ending || "—").join(" / "),
          given: value,
          correct: isCorrect(value, expected),
        };
      }),
    );
    try {
      const result = await recordCaseRound({ caseKey: selectedCase, cells });
      if (result.message) setNote(result.message);
    } catch {
      setNote("This chart could not be saved.");
    }
  }

  function resetAnswers() {
    setAnswers({});
    setChecked(false);
    setNote("");
  }

  function toggleMultipleChoice(enabled: boolean) {
    setMultipleChoice(enabled);
    setAnswers({});
    setChecked(false);
    setNote("");
  }

  return (
    <div className="case-practice">
      <div className="case-practice__toolbar">
        <label className="field">
          <span>Case</span>
          <select
            value={selectedCase}
            disabled={lockCase}
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
      {assignmentTitle ? <p className="prompt__eyebrow">Assigned · {assignmentTitle}</p> : null}
      {!signedIn ? (
        <p className="muted">Sign in to keep missed endings on your profile.</p>
      ) : null}
      {note ? <p className="form-success">{note}</p> : null}

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
