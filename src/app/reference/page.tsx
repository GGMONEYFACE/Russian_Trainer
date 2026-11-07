import level1 from "@/data/level1.json";
import { cases, caseOrder, genders } from "@/data/caseEndings";
import type { Gender, Level1Data } from "@/lib/types";

const data = level1 as Level1Data;
const cols: Gender[] = ["feminine", "masculine", "neuter", "plural"];

export default function ReferencePage() {
  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Reference · Nominative charts</h1>
        <p>
          Phrase tables from your Level 1 materials. Use these while drilling, or
          skim before a quiz.
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
    </div>
  );
}
