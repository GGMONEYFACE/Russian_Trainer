"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { finishGenitiveRound, recordAttempt } from "@/app/actions/progress";
import {
  isGenitiveAnswerCorrect,
  quantityRules,
  type GenitivePracticeItem,
  type QuantityKind,
} from "@/data/genitiveQuantities";
import { shuffle } from "@/lib/practice";

type RoundResult = {
  item: GenitivePracticeItem;
  answer: string;
  correct: boolean;
};

const kindFilters: { id: "all" | QuantityKind; label: string }[] = [
  { id: "all", label: "All cues" },
  { id: "1", label: "1" },
  { id: "2-4", label: "2–4" },
  { id: "5+", label: "5+" },
  { id: "mnogo", label: "много" },
  { id: "net", label: "нет" },
];

function itemsForKind(items: GenitivePracticeItem[], kind: "all" | QuantityKind) {
  if (kind === "all") return items;
  return items.filter((item) => item.kind === kind);
}

function buildQueue(items: GenitivePracticeItem[], randomize: boolean) {
  const source = randomize ? shuffle(items) : items;
  return source.slice(0, Math.min(12, items.length));
}

export function GenitivePractice({
  items,
  signedIn = false,
  assignmentTitle,
  lockFilter = false,
  initialKind = "all",
}: {
  items: GenitivePracticeItem[];
  signedIn?: boolean;
  assignmentTitle?: string;
  lockFilter?: boolean;
  initialKind?: "all" | QuantityKind;
}) {
  const [kindFilter, setKindFilter] = useState<"all" | QuantityKind>(initialKind);
  // Deterministic first paint so server HTML and hydration match; reshuffle after mount.
  const [queue, setQueue] = useState(() => buildQueue(itemsForKind(items, initialKind), false));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [assignmentNote, setAssignmentNote] = useState("");
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const roundGeneration = useRef(0);
  const didShuffle = useRef(false);

  const pool = useMemo(() => itemsForKind(items, kindFilter), [items, kindFilter]);

  function startSession(nextPool = pool) {
    roundGeneration.current += 1;
    setAssignmentNote("");
    setRoundResults([]);
    setQueue(buildQueue(nextPool, true));
    setIndex(0);
    setAnswer("");
    setChecked(false);
    setSessionCorrect(0);
    setSessionTotal(0);
  }

  function changeKindFilter(nextKind: "all" | QuantityKind) {
    setKindFilter(nextKind);
    startSession(itemsForKind(items, nextKind));
  }

  const current = queue[index];

  useEffect(() => {
    if (didShuffle.current) return;
    didShuffle.current = true;
    startSession(itemsForKind(items, initialKind));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!signedIn || queue.length === 0 || roundResults.length !== queue.length) return;
    const sameRound = roundResults.every(
      (result, resultIndex) => result.item.id === queue[resultIndex]?.id,
    );
    if (!sameRound) return;
    const generation = roundGeneration.current;
    void finishGenitiveRound({ total: queue.length })
      .then((result) => {
        if (generation !== roundGeneration.current) return;
        if (result.message) setAssignmentNote(result.message);
      })
      .catch(() => {
        if (generation === roundGeneration.current) {
          setAssignmentNote("This round could not be saved.");
        }
      });
  }, [signedIn, queue, roundResults]);

  useEffect(() => {
    if (checked) nextButtonRef.current?.focus();
  }, [checked]);

  useEffect(() => {
    if (current && !checked) answerInputRef.current?.focus();
  }, [current, checked]);

  async function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current || checked || !answer.trim()) return;
    const correct = isGenitiveAnswerCorrect(answer, current.answer);
    if (signedIn) {
      try {
        await recordAttempt({
          questionKey: `genitive-case:${current.id}`,
          practiceId: "genitive-case",
          prompt: `${current.cueLabel} + ${current.adjectiveLemma} + ${current.nounNominative}`,
          detail: current.kind,
          expected: current.answer,
          given: answer,
          correct,
        });
      } catch {
        // Local scoring still counts if saving fails.
      }
    }
    setChecked(true);
    setRoundResults((results) => [...results, { item: current, answer, correct }]);
    setSessionTotal((n) => n + 1);
    if (correct) setSessionCorrect((n) => n + 1);
  }

  function next() {
    setIndex((i) => i + 1);
    setAnswer("");
    setChecked(false);
  }

  if (!current) {
    return (
      <div className="drill empty-drill">
        <p>No items match this filter. Try another cue set.</p>
      </div>
    );
  }

  if (roundResults.length === queue.length && queue.length > 0) {
    const correctCount = roundResults.filter((result) => result.correct).length;
    return (
      <div className="drill round-review">
        <div className="round-review__header">
          <p className="prompt__eyebrow">Round complete</p>
          <h2 className="section__title">Your results</h2>
          <p className="section__lede">
            {correctCount} right · {roundResults.length - correctCount} wrong
          </p>
          {assignmentNote ? <p className="section__lede">{assignmentNote}</p> : null}
        </div>
        <div className="round-review__list">
          {roundResults.map((result, resultIndex) => (
            <article className="round-review__item" key={`${result.item.id}-${resultIndex}`}>
              <div className="round-review__item-header">
                <strong>Question {resultIndex + 1}</strong>
                <span className={result.correct ? "review-correct" : "review-wrong"}>
                  {result.correct ? "Right" : "Wrong"}
                </span>
              </div>
              <p className="round-review__phrase">
                {result.item.cueLabel} + {result.item.adjectiveLemma} + {result.item.nounNominative}
              </p>
              <dl className="round-review__answers">
                <div>
                  <dt>Your answer</dt>
                  <dd>{result.answer || "No answer"}</dd>
                </div>
                <div>
                  <dt>Correct answer</dt>
                  <dd>{result.item.answer}</dd>
                </div>
              </dl>
              <p className="round-review__forms">
                <strong>Pattern:</strong> {result.item.caseHint}
              </p>
            </article>
          ))}
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

  const isCorrect = checked && isGenitiveAnswerCorrect(answer, current.answer);
  const rule = quantityRules.find((item) => item.kind === current.kind);

  return (
    <div className="drill">
      <div className="drill__controls">
        {lockFilter ? (
          <p className="field">
            <span>Cue filter</span>
            <strong>
              {kindFilters.find((item) => item.id === kindFilter)?.label ?? "All cues"}
            </strong>
          </p>
        ) : (
          <label className="field">
            <span>Cue filter</span>
            <select
              value={kindFilter}
              onChange={(event) =>
                changeKindFilter(event.target.value as "all" | QuantityKind)
              }
            >
              {kindFilters.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <p className="field">
          <span>Task</span>
          <strong>Type the full declined phrase</strong>
        </p>
      </div>

      <div className="drill__stats">
        <span>
          Card {index + 1} / {queue.length}
        </span>
        <span>
          Session {sessionCorrect}/{sessionTotal}
        </span>
        {!signedIn && (
          <span>
            <Link href="/login?next=/practice/genitive">Sign in</Link> to keep missed
            questions on your profile.
          </span>
        )}
      </div>

      {assignmentTitle ? <p className="prompt__eyebrow">Assigned · {assignmentTitle}</p> : null}

      <div className="prompt" key={current.id}>
        <p className="prompt__eyebrow">Genitive · quantity cue</p>
        <h2 className="prompt__main genitive-prompt">
          <span className="genitive-prompt__cue">{current.cueLabel}</span>
          <span className="genitive-prompt__plus" aria-hidden>
            +
          </span>
          <span>{current.adjectiveLemma}</span>
          <span className="genitive-prompt__plus" aria-hidden>
            +
          </span>
          <span>{current.nounNominative}</span>
        </h2>
        <p className="prompt__sub">
          Build the full fixed phrase with the right endings (
          {current.gender} noun · {current.adjectiveEnglish} {current.nounEnglish}).
        </p>
        <p className="prompt__en">
          Hint: {current.caseHint}
          {rule ? ` · e.g. ${rule.example}` : null}
        </p>
      </div>

      <form className="ending-answer ending-answer--phrase" onSubmit={submitAnswer}>
        <label htmlFor="genitive-answer">Full phrase</label>
        <div className="ending-answer__controls">
          <input
            ref={answerInputRef}
            id="genitive-answer"
            type="text"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="например: много красных тетрадей"
            autoComplete="off"
            spellCheck={false}
            disabled={checked}
            aria-invalid={checked && !isCorrect}
          />
          <button
            type="submit"
            className="btn btn--primary"
            disabled={checked || !answer.trim()}
          >
            Check
          </button>
        </div>
      </form>

      {checked && (
        <div className={`feedback ${isCorrect ? "is-good" : "is-bad"}`}>
          <p>
            {isCorrect ? "Верно!" : "Не совсем."}{" "}
            <span>
              {current.answer} — {current.answerEn}
            </span>
          </p>
          <button
            ref={nextButtonRef}
            type="button"
            className="btn btn--primary"
            onClick={next}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
