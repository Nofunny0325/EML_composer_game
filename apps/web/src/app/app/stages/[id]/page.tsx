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
          스테이지 목록으로
        </Link>
        <div>
          <p className="eyebrow">레벨 {stage.level}</p>
          <h1>
            스테이지 {stage.id}: {stage.name}
          </h1>
        </div>

        <div className="targetBox">
          <span>목표 함수</span>
          <code>{stage.target_function}</code>
        </div>

        <StageHint description={stage.description} />
      </section>
      <FunctionComposer stageId={stage.id} />
    </main>
  );
}
