import Link from "next/link";
import level1 from "@/data/level1.json";
import { cases, caseOrder, genders } from "@/data/caseEndings";
import {
  genitiveEndingCharts,
  quantityRules,
} from "@/data/genitiveQuantities";
import type { Gender, Level1Data } from "@/lib/types";

const data = level1 as Level1Data;
const cols: Gender[] = ["feminine", "masculine", "neuter", "plural"];

export default function ReferencePage() {
  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Resources · Charts &amp; endings</h1>
        <p>
          Phrase tables from your Level 1 materials, plus how quantity words pick
          nominative vs genitive. Use these while drilling, or skim before a quiz.
        </p>
      </header>

      {data.sets.map((set) => (
        <section key={set.id} className="reference-block">
          <h2>{set.title}</h2>
          <table className="adj-table">
            <thead>
              <tr>
                <th>Adjective</th>
                {cols.map((g) => (
                  <th key={g}>{data.genderLabels[g].en}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {set.nominative.map((group) => (
                <tr key={group.lemma}>
                  <td className="lemma">
                    {group.lemma}
                    <div className="muted">{group.english}</div>
                  </td>
                  {cols.map((g) => {
                    const form = group.forms[g];
                    return (
                      <td key={g}>
                        {form ? (
                          <>
                            <div>{form.ru}</div>
                            <div className="muted">{form.en}</div>
                          </>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <section className="reference-block">
        <h2>Case endings</h2>
        <p className="section__lede">
          Common adjective and noun endings by gender. Slashes show accepted
          variants; accusative masculine depends on animacy.
        </p>
        <div className="case-reference-grid">
          {caseOrder.map((caseKey) => {
            const definition = cases[caseKey];
            return (
              <article className="case-reference-card" key={caseKey}>
                <h3>{definition.label}</h3>
                <p className="muted">{definition.hint}</p>
                <table className="adj-table">
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
                        <td>{definition.answers[gender].adjective.join(" / ")}</td>
                        <td>
                          {definition.answers[gender].noun
                            .map((ending) => ending || "—")
                            .join(" / ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            );
          })}
        </div>
      </section>

      <section className="reference-block" id="genitive-quantities">
        <h2>Genitive with quantities</h2>
        <p className="section__lede">
          After numbers and quantity words, Russian picks nominative or genitive
          for the adjective–noun pair. Memorize the cue first, then the endings.
        </p>

        <div className="quantity-rule-grid">
          {quantityRules.map((rule) => (
            <article className="case-reference-card" key={rule.kind}>
              <h3>{rule.title}</h3>
              <p className="muted">{rule.when}</p>
              <dl className="quantity-rule">
                <div>
                  <dt>Adjective</dt>
                  <dd>{rule.caseForAdj}</dd>
                </div>
                <div>
                  <dt>Noun</dt>
                  <dd>{rule.caseForNoun}</dd>
                </div>
              </dl>
              <p className="quantity-rule__example">
                <span className="muted">Example</span> {rule.example}
              </p>
            </article>
          ))}
        </div>

        <div className="case-reference-grid" style={{ marginTop: "1.5rem" }}>
          <article className="case-reference-card">
            <h3>Adjective endings</h3>
            <p className="muted">Hard / soft pairs shown with a slash.</p>
            <table className="adj-table">
              <thead>
                <tr>
                  <th scope="col"> </th>
                  <th scope="col">Genitive singular</th>
                  <th scope="col">Genitive plural</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">masculine</th>
                  <td>{genitiveEndingCharts.adjectives.singular.masculine}</td>
                  <td>{genitiveEndingCharts.adjectives.plural.masculine}</td>
                </tr>
                <tr>
                  <th scope="row">feminine</th>
                  <td>{genitiveEndingCharts.adjectives.singular.feminine}</td>
                  <td>{genitiveEndingCharts.adjectives.plural.feminine}</td>
                </tr>
                <tr>
                  <th scope="row">neuter</th>
                  <td>{genitiveEndingCharts.adjectives.singular.neuter}</td>
                  <td>{genitiveEndingCharts.adjectives.plural.neuter}</td>
                </tr>
              </tbody>
            </table>
          </article>

          <article className="case-reference-card">
            <h3>Noun endings</h3>
            <p className="muted">
              Genitive plural has several patterns; learn common classroom nouns with
              the phrase charts.
            </p>
            <table className="adj-table">
              <thead>
                <tr>
                  <th scope="col"> </th>
                  <th scope="col">Genitive singular</th>
                  <th scope="col">consonants</th>
                  <th scope="col">-й</th>
                  <th scope="col">-ь / -е</th>
                  <th scope="col">ж / ш / ч / щ / ц</th>
                  <th scope="col">-а / -о</th>
                  <th scope="col">-я</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">masculine</th>
                  <td>{genitiveEndingCharts.nouns.singular.masculine}</td>
                  <td>{genitiveEndingCharts.nouns.consonants.masculine}</td>
                  <td>{genitiveEndingCharts.nouns.й.masculine}</td>
                  <td>{genitiveEndingCharts.nouns.ь.masculine}</td>
                  <td>{genitiveEndingCharts.nouns.ж.masculine}</td>
                  <td>{genitiveEndingCharts.nouns.а.masculine}</td>
                  <td>{genitiveEndingCharts.nouns.я.masculine}</td>
                </tr>
                <tr>
                  <th scope="row">feminine</th>
                  <td>{genitiveEndingCharts.nouns.singular.feminine}</td>
                  <td>{genitiveEndingCharts.nouns.consonants.feminine}</td>
                  <td>{genitiveEndingCharts.nouns.й.feminine}</td>
                  <td>{genitiveEndingCharts.nouns.ь.feminine}</td>
                  <td>{genitiveEndingCharts.nouns.ж.feminine}</td>
                  <td>{genitiveEndingCharts.nouns.а.feminine}</td>
                  <td>{genitiveEndingCharts.nouns.я.feminine}</td>
                </tr>
                <tr>
                  <th scope="row">neuter</th>
                  <td>{genitiveEndingCharts.nouns.singular.neuter}</td>
                  <td>{genitiveEndingCharts.nouns.consonants.neuter}</td>
                  <td>{genitiveEndingCharts.nouns.й.neuter}</td>
                  <td>{genitiveEndingCharts.nouns.ь.neuter}</td>
                  <td>{genitiveEndingCharts.nouns.ж.neuter}</td>
                  <td>{genitiveEndingCharts.nouns.а.neuter}</td>
                  <td>{genitiveEndingCharts.nouns.я.neuter}</td>
                </tr>
              </tbody>
            </table>
          </article>
        </div>

        <div className="cta-row" style={{ marginTop: "1.5rem" }}>
          <Link href="/practice/genitive" className="btn btn--primary">
            Practice genitive phrases
          </Link>
        </div>
      </section>
    </div>
  );
}
