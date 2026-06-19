export default function SettingsPage() {
  return (
    <main className="page panel">
      <h1>Settings</h1>
      <p className="muted">
        Local development uses SQLite and a JWT saved in browser storage. Public
        deployment notes live in the project docs.
      </p>
    </main>
  );
}
