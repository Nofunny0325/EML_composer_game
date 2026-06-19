import { StageGrid } from "@/components/StageGrid";
import { stages } from "@/lib/stages";

export default function StagesPage() {
  return (
    <main className="page">
      <section className="pageHeader">
        <p className="eyebrow">스테이지 지도</p>
        <h1>다음 목표 함수를 선택하세요.</h1>
        <p className="muted">
          클리어한 스테이지와 바로 다음 스테이지만 입장할 수 있습니다.
        </p>
      </section>
      <StageGrid stages={stages} />
    </main>
  );
}
