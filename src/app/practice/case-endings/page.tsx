import { CaseEndingPractice } from "@/components/CaseEndingPractice";

export default function CaseEndingsPage() {
  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Practice · Case endings</h1>
        <p>
          Build your own reference charts for adjective and noun endings by
          gender.
        </p>
      </header>
      <CaseEndingPractice />
    </div>
  );
}
