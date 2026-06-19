export default function SettingsPage() {
  return (
    <main className="page panel">
      <h1>설정</h1>
      <p className="muted">
        배포 버전은 PostgreSQL DB와 HttpOnly 세션 쿠키를 사용합니다. 공개 배포와
        DB 설정 관련 내용은 프로젝트 문서에서 확인할 수 있습니다.
      </p>
    </main>
  );
}
