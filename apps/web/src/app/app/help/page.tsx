export default function HelpPage() {
  return (
    <main className="page panel">
      <h1>도움말</h1>
      <p>
        이 게임의 기본 연산자는 오직 <strong>eml(a, b) = exp(a) - log(b)</strong> 하나입니다.
      </p>
      <p>
        클리어한 함수는 다시 쓸 수 있는 블록이 됩니다. 두 블록을 EML 조합기에 넣으면
        새 블록이 생기고, 그 블록을 다시 조합에 사용할 수 있습니다.
      </p>
      <p className="muted">
        1스테이지 예시: 1을 EML의 양쪽 칸에 넣고 합친 다음, 새로 생긴 EML(1, 1)
        블록을 제출하면 됩니다.
      </p>
    </main>
  );
}
