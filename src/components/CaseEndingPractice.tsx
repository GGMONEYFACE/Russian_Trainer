"use client";

import { useEffect, useState } from "react";

type Gender = "masculine" | "feminine" | "neuter";

type EndingRow = {
  gender: Gender;
  adjective: string;
  noun: string;
};

type EndingChart = {
  id: number;
  title: string;
  rows: EndingRow[];
};

const genders: Gender[] = ["masculine", "feminine", "neuter"];
const storageKey = "russian-trainer-case-ending-charts";

function createChart(id: number): EndingChart {
  return {
    id,
    title: `Chart ${id}`,
    rows: genders.map((gender) => ({ gender, adjective: "", noun: "" })),
  };
}

function isEndingChart(value: unknown): value is EndingChart {
  if (!value || typeof value !== "object") return false;
  const chart = value as Partial<EndingChart>;

  return (
    Number.isInteger(chart.id) &&
    typeof chart.title === "string" &&
    Array.isArray(chart.rows) &&
    chart.rows.length === genders.length &&
    chart.rows.every(
      (row, index) =>
        row &&
        typeof row === "object" &&
        (row as EndingRow).gender === genders[index] &&
        typeof (row as EndingRow).adjective === "string" &&
        typeof (row as EndingRow).noun === "string",
    )
  );
}

function loadCharts(): EndingChart[] {
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return [createChart(1)];

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(isEndingChart)) {
      throw new Error("Saved chart data has an invalid format.");
    }
    return parsed.length > 0 ? parsed : [createChart(1)];
  } catch (error) {
    console.error("Could not load case-ending charts.", error);
    return [createChart(1)];
  }
}

export function CaseEndingPractice() {
  const [charts, setCharts] = useState<EndingChart[]>([]);

  useEffect(() => {
    setCharts(loadCharts());
  }, []);

  useEffect(() => {
    if (charts.length > 0) {
      window.localStorage.setItem(storageKey, JSON.stringify(charts));
    }
  }, [charts]);

  function updateChart(id: number, update: Partial<EndingChart>) {
    setCharts((current) =>
      current.map((chart) => (chart.id === id ? { ...chart, ...update } : chart)),
    );
  }

  function updateRow(
    chartId: number,
    gender: Gender,
    field: "adjective" | "noun",
    value: string,
  ) {
    setCharts((current) =>
      current.map((chart) =>
        chart.id === chartId
          ? {
              ...chart,
              rows: chart.rows.map((row) =>
                row.gender === gender ? { ...row, [field]: value } : row,
              ),
            }
          : chart,
      ),
    );
  }

  function addChart() {
    setCharts((current) => [
      ...current,
      createChart(Math.max(...current.map((chart) => chart.id), 0) + 1),
    ]);
  }

  function removeChart(id: number) {
    setCharts((current) => current.filter((chart) => chart.id !== id));
  }

  return (
    <div className="case-practice">
      <div className="case-practice__toolbar">
        <p className="muted">Your charts are saved in this browser.</p>
        <button type="button" className="btn btn--primary" onClick={addChart}>
          Add chart
        </button>
      </div>

      {charts.map((chart) => (
        <section className="case-chart" key={chart.id}>
          <div className="case-chart__heading">
            <label className="case-chart__title">
              <span className="sr-only">Chart title</span>
              <input
                type="text"
                value={chart.title}
                onChange={(event) =>
                  updateChart(chart.id, { title: event.target.value })
                }
                aria-label="Chart title"
              />
            </label>
            {charts.length > 1 && (
              <button
                type="button"
                className="btn btn--ghost-dark case-chart__remove"
                onClick={() => removeChart(chart.id)}
              >
                Remove
              </button>
            )}
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
              {chart.rows.map((row) => (
                <tr key={row.gender}>
                  <th scope="row">{row.gender}</th>
                  <td>
                    <input
                      type="text"
                      value={row.adjective}
                      onChange={(event) =>
                        updateRow(
                          chart.id,
                          row.gender,
                          "adjective",
                          event.target.value,
                        )
                      }
                      placeholder="enter ending"
                      aria-label={`${row.gender} adjective ending`}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.noun}
                      onChange={(event) =>
                        updateRow(chart.id, row.gender, "noun", event.target.value)
                      }
                      placeholder="enter ending"
                      aria-label={`${row.gender} noun ending`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
