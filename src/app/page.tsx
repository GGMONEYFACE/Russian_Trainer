import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero__bg" aria-hidden />
        <div className="hero__content">
          <p className="hero__brand">Русский Trainer</p>
          <h1 className="hero__title">
            Grammar drills that stick — starting with gender agreement.
          </h1>
          <p className="hero__lede">
            Vocab apps are everywhere. This lab focuses on endings: how adjectives
            match nouns, then (next) when each case shows up.
          </p>
          <div className="cta-row">
            <Link href="/practice" className="btn btn--primary">
              Start Level 1 practice
            </Link>
            <Link href="/learn" className="btn btn--ghost">
              Review the endings
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="section__eyebrow">Roadmap</p>
          <h2 className="section__title">Zero to hero, one pattern at a time</h2>
          <p className="section__lede">
            Built from your professor&apos;s Level 1 word sets (colors/objects and
            nationality/interests). We practice the grammar moves, not flashcard
            vocab alone.
          </p>
          <div className="path-list">
            <article className="path-item path-item--active">
              <span className="path-item__tag">Live now</span>
              <h3>Level 1 · Gender agreement</h3>
              <p>
                Nominative adjective endings for masculine, feminine, neuter, and
                plural — using the classroom phrase charts.
              </p>
            </article>
            <article className="path-item path-item--active">
              <span className="path-item__tag">Live now</span>
              <h3>Genitive · Quantity phrases</h3>
              <p>
                Practice 1, 2–4, 5+, много, and нет with full adjective–noun phrases
                typed out in the fixed form.
              </p>
            </article>
            <article className="path-item">
              <span className="path-item__tag">Next</span>
              <h3>Level 2 · Cases in context</h3>
              <p>
                Accusative through dative with the same adjective–noun pairs, plus
                when to reach for each case.
              </p>
            </article>
            <article className="path-item">
              <span className="path-item__tag">Later</span>
              <h3>Verbs · Conjugation</h3>
              <p>
                Present-tense person endings first, then aspect and harder patterns
                once nouns feel automatic.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
