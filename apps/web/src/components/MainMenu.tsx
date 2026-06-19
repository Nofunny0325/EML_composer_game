import Link from "next/link";

export function MainMenu() {
  return (
    <main className="page menu">
      <section className="dashboardHero">
        <p className="eyebrow">EML 퍼즐 연구실</p>
        <h1>단 하나의 연산자로 함수 블록을 합성하세요.</h1>
        <p className="heroCopy">
          블록을 EML 조합기에 넣어 새 블록을 만들고, 점점 더 복잡한 목표 함수를
          해금하는 수학 퍼즐 게임입니다.
        </p>
        <div className="heroActions">
          <Link className="button primary" href="/app/stages">
            게임 시작
          </Link>
          <Link className="button ghost" href="/app/help">
            도움말
          </Link>
        </div>
      </section>

      <section className="menuStats">
        <div>
          <strong>50</strong>
          <span>스테이지</span>
        </div>
        <div>
          <strong>1</strong>
          <span>연산자</span>
        </div>
        <div>
          <strong>EML</strong>
          <span>함수 합성</span>
        </div>
      </section>

      <section className="menuGrid">
        <Link className="menuCard primaryCard" href="/app/stages">
          <span>01</span>
          <h2>스테이지 선택</h2>
          <p>퍼즐을 풀고 다음 목표 함수를 해금합니다.</p>
        </Link>
        <Link className="menuCard" href="/app/settings">
          <span>02</span>
          <h2>설정</h2>
          <p>플레이 환경과 배포 상태를 확인합니다.</p>
        </Link>
        <Link className="menuCard" href="/app/help">
          <span>03</span>
          <h2>도움말</h2>
          <p>EML 규칙과 첫 블록 조합 방법을 확인합니다.</p>
        </Link>
      </section>
    </main>
  );
}
