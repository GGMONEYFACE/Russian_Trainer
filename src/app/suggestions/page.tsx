import { Suspense } from "react";
import { SuggestionForm } from "@/components/SuggestionForm";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Suggestions · Russian Trainer",
};

async function SuggestionsBody() {
  const user = await getCurrentUser();

  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Suggestions</h1>
        <p>Send an idea for the trainer. It goes to the admin page.</p>
      </header>
      <SuggestionForm signedInName={user?.name ?? ""} />
    </div>
  );
}

export default function SuggestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="shell">
          <header className="page-hero">
            <h1>Suggestions</h1>
          </header>
        </div>
      }
    >
      <SuggestionsBody />
    </Suspense>
  );
}
