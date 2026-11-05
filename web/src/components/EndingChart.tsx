import type { Level1Data } from "@/lib/types";

const order = ["masculine", "feminine", "neuter", "plural"] as const;

export function EndingChart({ data }: { data: Level1Data }) {
  return (
    <div className="ending-charts">
      {(["hard", "soft"] as const).map((stem) => (
        <div key={stem} className="ending-chart">
          <h3 className="ending-chart__title">
            {stem === "hard" ? "Hard stem" : "Soft stem"}
            <span>
              {stem === "hard" ? "новый, красный" : "синий, русский"}
            </span>
          </h3>
          <div className="ending-chart__grid">
            {order.map((gender) => (
              <div key={gender} className="ending-chart__cell">
                <span className="ending-chart__label">
                  {data.genderLabels[gender].en}
                </span>
                <span className="ending-chart__value">
                  {data.endings[stem][gender]}
                </span>
                <span className="ending-chart__ru">
                  {data.genderLabels[gender].ru}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
