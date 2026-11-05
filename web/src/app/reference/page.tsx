import level1 from "@/data/level1.json";
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
    </div>
  );
}
