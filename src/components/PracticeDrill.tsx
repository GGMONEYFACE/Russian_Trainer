"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Gender, PracticeItem } from "@/lib/types";
import {
  adjectiveEnding,
  adjectiveStem,
  filterPractice,
  normalizeEnding,
  shuffle,
} from "@/lib/practice";
import {
  loadProgress,
  recordAnswer,
  type ProgressState,
} from "@/lib/progress";

type Mode = "agree" | "ending" | "gender";

type RoundResult = {
  item: PracticeItem;
  mode: Mode;
  answer: string;
  correct: boolean;
};

type Props = {
  items: PracticeItem[];
  setOptions: { id: string; title: string }[];
  genderLabels: Record<Gender, { ru: string; en: string }>;
};

export function PracticeDrill({ items, setOptions, genderLabels }: Props) {
  const [mode, setMode] = useState<Mode>("ending");
  const [setId, setSetId] = useState("all");
  const [queue, setQueue] = useState<PracticeItem[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [endingAnswer, setEndingAnswer] = useState("");
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  const pool = useMemo(
    () => filterPractice(items, { setId }),
    [items, setId],
  );

  function startSession() {
    setQueue(shuffle(pool).slice(0, Math.min(12, pool.length)));
    setIndex(0);
    setSelected(null);
    setEndingAnswer("");
    setSessionCorrect(0);
    setSessionTotal(0);
  }

  useEffect(() => {
    setProgress(loadProgress());
    setRoundResults([]);
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRoundResults([]);
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId, pool.length]);

  const current = queue[index];

  useEffect(() => {
    if (selected) {
      nextButtonRef.current?.focus();
    }
  }, [selected]);

  useEffect(() => {
    if (current && mode === "ending" && !selected) {
      answerInputRef.current?.focus();
    }
  }, [current, mode, selected]);

  const choices = useMemo(() => {
    if (!current) return [];
    if (mode === "agree") return shuffle(current.options);
    if (mode === "ending") return [];
    return shuffle(["masculine", "feminine", "neuter", "plural"] as Gender[]);
  }, [current, mode]);

  function onChoose(value: string) {
    if (!current || selected) return;
    setSelected(value);
    const correct =
      mode === "agree"
        ? value === current.correct
        : mode === "ending"
          ? value === adjectiveEnding(current.adjective)
          : value === current.gender;
    setRoundResults((results) => [
      ...results,
      { item: current, mode, answer: value, correct },
    ]);
    setSessionTotal((n) => n + 1);
    if (correct) setSessionCorrect((n) => n + 1);
    setProgress((prev) =>
      recordAnswer(prev ?? loadProgress(), current.id, correct),
    );
  }

  function onEndingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endingAnswer.trim()) return;
    onChoose(normalizeEnding(endingAnswer));
  }

  function next() {
    if (index + 1 >= queue.length) {
      setMode("ending");
      startSession();
      return;
    }
    setIndex((i) => i + 1);
    setMode("ending");
    setSelected(null);
    setEndingAnswer("");
  }

  if (!current) {
    return (
      <div className="drill empty-drill">
        <p>No items match this filter. Try another set.</p>
      </div>
    );
  }

  if (roundResults.length === queue.length && queue.length > 0) {
    const correctCount = roundResults.filter((result) => result.correct).length;
    const formsByLemma = new Map<string, PracticeItem[]>();
    const formsByNoun = new Map<string, PracticeItem[]>();
    items.forEach((item) => {
      const forms = formsByLemma.get(item.lemma) ?? [];
      if (!forms.some((form) => form.adjective === item.adjective)) {
        forms.push(item);
      }
      formsByLemma.set(item.lemma, forms);
      const nounForms = formsByNoun.get(item.noun) ?? [];
      if (!nounForms.some((form) => form.adjective === item.adjective)) {
        nounForms.push(item);
      }
      formsByNoun.set(item.noun, nounForms);
    });

    return (
      <div className="drill round-review">
        <div className="round-review__header">
          <p className="prompt__eyebrow">Round complete</p>
          <h2 className="section__title">Your results</h2>
          <p className="section__lede">
            {correctCount} right · {roundResults.length - correctCount} wrong
          </p>
        </div>
        <div className="round-review__list">
          {roundResults.map((result, resultIndex) => {
            const forms = formsByLemma.get(result.item.lemma) ?? [result.item];
            const nounForms = formsByNoun.get(result.item.noun) ?? [result.item];
            return (
              <article className="round-review__item" key={`${result.item.id}-${resultIndex}`}>
                <div className="round-review__item-header">
                  <strong>Question {resultIndex + 1}</strong>
                  <span className={result.correct ? "review-correct" : "review-wrong"}>
                    {result.correct ? "Right" : "Wrong"}
                  </span>
                </div>
                <p className="round-review__phrase">
                  {result.item.phraseRu} <span>— {result.item.phraseEn}</span>
                </p>
                <dl className="round-review__answers">
                  <div>
                    <dt>Your answer</dt>
                    <dd>{result.answer || "No answer"}</dd>
                  </div>
                  <div>
                    <dt>Correct answer</dt>
                    <dd>
                      {result.mode === "gender"
                        ? result.item.gender
                        : result.mode === "ending"
                          ? adjectiveEnding(result.item.adjective)
                          : result.item.correct}
                    </dd>
                  </div>
                </dl>
                <p className="round-review__forms">
                  <strong>Adjective forms:</strong>{" "}
                  {forms.map((form) => `${form.gender}: ${form.adjective}`).join(" · ")}
                </p>
                <p className="round-review__forms">
                  <strong>Noun forms seen:</strong>{" "}
                  {nounForms.map((form) => `${form.gender}: ${form.noun}`).join(" · ")}
                </p>
              </article>
            );
          })}
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            setRoundResults([]);
            startSession();
          }}
        >
          Start new round
        </button>
      </div>
    );
  }

  const isCorrect =
    selected !== null &&
    (mode === "agree"
      ? selected === current.correct
      : mode === "ending"
        ? selected === adjectiveEnding(current.adjective)
        : selected === current.gender);

  return (
    <div className="drill">
      <div className="drill__controls">
        <label className="field">
          <span>Set</span>
          <select value={setId} onChange={(e) => setSetId(e.target.value)}>
            <option value="all">All Level 1 sets</option>
            {setOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={mode === "agree"}
            onChange={(event) =>
              setMode(event.target.checked ? "agree" : "ending")
            }
          />
          <span>Multiple choice for this question</span>
        </label>
        <label className="field">
          <span>Other mode</span>
          <select
            value={mode === "agree" || mode === "ending" ? "ending" : mode}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="ending">Fill in adjective ending</option>
            <option value="gender">Identify noun gender</option>
          </select>
        </label>
      </div>

      <div className="drill__stats">
        <span>
          Card {index + 1} / {queue.length}
        </span>
        <span>
          Session {sessionCorrect}/{sessionTotal}
        </span>
        {progress && (
          <span>
            Streak {progress.streak} · Best {progress.bestStreak}
          </span>
        )}
      </div>

      <div className="prompt" key={current.id + mode}>
        <p className="prompt__eyebrow">
          {current.setTitle}
        </p>
        {mode === "agree" ? (
          <>
            <h2 className="prompt__main">
              <span className="prompt__blank">____</span> {current.noun}
            </h2>
            <p className="prompt__sub">
              Use <strong>{current.lemma}</strong> ({current.lemmaEnglish}) so
              it agrees with the noun.
            </p>
            <p className="prompt__en">{current.phraseEn}</p>
          </>
        ) : mode === "ending" ? (
          <>
            <h2 className="prompt__main">
              {adjectiveStem(current.adjective)}
              <span className="prompt__ending">__</span> {current.noun}
            </h2>
            <p className="prompt__sub">
              Type the adjective ending (for example: ой).
            </p>
            <p className="prompt__en">{current.phraseEn}</p>
          </>
        ) : (
          <>
            <h2 className="prompt__main">{current.noun}</h2>
            <p className="prompt__sub">
              What gender / number is this noun?
            </p>
            <p className="prompt__en">
              Hint phrase: {current.phraseRu} — {current.phraseEn}
            </p>
          </>
        )}
      </div>

      {mode === "ending" ? (
        <form className="ending-answer" onSubmit={onEndingSubmit}>
          <label htmlFor="ending-input">Adjective ending</label>
          <div className="ending-answer__controls">
            <input
              ref={answerInputRef}
              id="ending-input"
              type="text"
              value={endingAnswer}
              onChange={(event) => setEndingAnswer(event.target.value)}
              placeholder="ой"
              autoComplete="off"
              disabled={Boolean(selected)}
            />
            <button
              type="submit"
              className="btn btn--primary"
              disabled={Boolean(selected) || !endingAnswer.trim()}
            >
              Check
            </button>
          </div>
        </form>
      ) : (
        <div className="choices" role="group" aria-label="Answers">
          {choices.map((choice) => {
            const value = choice;
            const label =
              mode === "agree"
                ? choice
                : `${genderLabels[choice as Gender].en} · ${genderLabels[choice as Gender].ru}`;
            let state = "";
            if (selected) {
              const right =
                mode === "agree" ? current.correct : current.gender;
              if (value === right) state = "is-correct";
              else if (value === selected) state = "is-wrong";
            }
            return (
              <button
                key={String(value)}
                type="button"
                className={`choice ${state}`}
                onClick={() => onChoose(String(value))}
                disabled={Boolean(selected)}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className={`feedback ${isCorrect ? "is-good" : "is-bad"}`}>
          <p>
            {isCorrect ? "Верно!" : "Не совсем."}{" "}
            <span>
              {current.phraseRu} — {current.phraseEn}
            </span>
          </p>
          <button
            ref={nextButtonRef}
            type="button"
            className="btn btn--primary"
            onClick={next}
          >
            {index + 1 >= queue.length ? "New round" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
