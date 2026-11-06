"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Gender, PracticeItem } from "@/lib/types";
import {
  adjectiveEnding,
  adjectiveStem,
  filterPractice,
  genderHint,
  normalizeEnding,
  shuffle,
} from "@/lib/practice";
import {
  loadProgress,
  recordAnswer,
  type ProgressState,
} from "@/lib/progress";

type Mode = "agree" | "ending" | "gender";

type Props = {
  items: PracticeItem[];
  setOptions: { id: string; title: string }[];
  genderLabels: Record<Gender, { ru: string; en: string }>;
};

export function PracticeDrill({ items, setOptions, genderLabels }: Props) {
  const [mode, setMode] = useState<Mode>("agree");
  const [setId, setSetId] = useState("all");
  const [showHint, setShowHint] = useState(true);
  const [queue, setQueue] = useState<PracticeItem[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [endingAnswer, setEndingAnswer] = useState("");
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

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
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId, mode, pool.length]);

  const current = queue[index];

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
      startSession();
      return;
    }
    setIndex((i) => i + 1);
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
        <label className="field">
          <span>Mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="agree">Choose adjective ending</option>
            <option value="ending">Fill in adjective ending</option>
            <option value="gender">Identify noun gender</option>
          </select>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={showHint}
            onChange={(e) => setShowHint(e.target.checked)}
          />
          <span>Show gender hint</span>
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
          {showHint && mode === "agree" ? ` · ${genderHint(current.gender)}` : ""}
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
          <button type="button" className="btn btn--primary" onClick={next}>
            {index + 1 >= queue.length ? "New round" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
