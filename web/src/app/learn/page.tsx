import Link from "next/link";
import { EndingChart } from "@/components/EndingChart";
import level1 from "@/data/level1.json";
import type { Level1Data } from "@/lib/types";

const data = level1 as Level1Data;

export default function LearnPage() {
  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Level 1 · How agreement works</h1>
        <p>
          In Russian, an adjective must match its noun in gender and number. In
          the nominative (dictionary / subject form), that means swapping the
          adjective ending.
        </p>
      </header>

      <section className="section" style={{ paddingTop: 0 }}>
        <EndingChart data={data} />
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section__title">Remember these moves</h2>
        <ul className="rule-list">
          <li>
            <strong>Masculine</strong> nouns often take <em>-ый / -ой / -ий</em>{" "}
            — красный кошелёк, синий карандаш.
          </li>
          <li>
            <strong>Feminine</strong> nouns take <em>-ая / -яя</em> — красная
            тетрадь, синяя ручка.
          </li>
          <li>
            <strong>Neuter</strong> nouns take <em>-ое / -ее</em> — белое окно,
            синее небо.
          </li>
          <li>
            <strong>Plural</strong> takes <em>-ые / -ие</em> no matter the
            original gender — новые наушники, русские романы.
          </li>
        </ul>
        <div className="cta-row" style={{ marginTop: "1.75rem" }}>
          <Link href="/practice" className="btn btn--primary">
            Practice these endings
          </Link>
          <Link href="/reference" className="btn btn--ghost-dark">
            Browse the phrase charts
          </Link>
        </div>
      </section>
    </div>
  );
}
