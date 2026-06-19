import Link from "next/link";
import { notFound } from "next/navigation";
import { FunctionComposer } from "@/components/FunctionComposer";
import { StageHint } from "@/components/StageHint";
import { getStageById } from "@/lib/stages";

export default async function StageDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stage = getStageById(Number(id));

  if (!stage) {
    notFound();
  }

  return (
    <main className="page stageDetail">
      <section className="panel stageBrief">
        <Link className="backLink" href="/app/stages">
          Back to stages
        </Link>
        <div>
          <p className="eyebrow">Level {stage.level}</p>
          <h1>
            Stage {stage.id}: {stage.name}
          </h1>
        </div>

        <div className="targetBox">
          <span>Target</span>
          <code>{stage.target_function}</code>
        </div>

        <StageHint description={stage.description} />
      </section>
      <FunctionComposer stageId={stage.id} />
    </main>
  );
}
