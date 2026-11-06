import { PracticeDrill } from "@/components/PracticeDrill";
import level1 from "@/data/level1.json";
import type { Level1Data } from "@/lib/types";

const data = level1 as Level1Data;

export default function PracticePage() {
  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Practice · Gender agreement</h1>
        <p>
          Pick the adjective form, fill in its ending, or name the noun&apos;s
          gender. Feedback shows the full classroom phrase.
        </p>
      </header>
      <PracticeDrill
        items={data.practice}
        setOptions={data.sets.map((s) => ({ id: s.id, title: s.title }))}
        genderLabels={data.genderLabels}
      />
    </div>
  );
}
