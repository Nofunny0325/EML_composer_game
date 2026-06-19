import { StageGrid } from "@/components/StageGrid";
import { stages } from "@/lib/stages";

export default function StagesPage() {
  return (
    <main className="page">
      <section className="pageHeader">
        <p className="eyebrow">Stage map</p>
        <h1>Choose your next function.</h1>
        <p className="muted">
          Cleared stages stay open. The next uncleared stage is the frontier.
        </p>
      </section>
      <StageGrid stages={stages} />
    </main>
  );
}
