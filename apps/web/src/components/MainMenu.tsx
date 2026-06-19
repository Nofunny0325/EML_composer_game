import Link from "next/link";

export function MainMenu() {
  return (
    <main className="page menu">
      <section className="dashboardHero">
        <p className="eyebrow">EML puzzle lab</p>
        <h1>Build functions by combining blocks through one operator.</h1>
        <p className="heroCopy">
          Drag blocks into the EML combiner, create new blocks, and unlock a
          ladder of increasingly strange functions.
        </p>
        <div className="heroActions">
          <Link className="button primary" href="/app/stages">
            Start Playing
          </Link>
          <Link className="button ghost" href="/app/help">
            How It Works
          </Link>
        </div>
      </section>

      <section className="menuStats">
        <div>
          <strong>50</strong>
          <span>stages</span>
        </div>
        <div>
          <strong>1</strong>
          <span>operator</span>
        </div>
        <div>
          <strong>EML</strong>
          <span>composition</span>
        </div>
      </section>

      <section className="menuGrid">
        <Link className="menuCard primaryCard" href="/app/stages">
          <span>01</span>
          <h2>Stage Selection</h2>
          <p>Solve puzzles and unlock the next target function.</p>
        </Link>
        <Link className="menuCard" href="/app/settings">
          <span>02</span>
          <h2>Settings</h2>
          <p>Review local play settings and development status.</p>
        </Link>
        <Link className="menuCard" href="/app/help">
          <span>03</span>
          <h2>Help</h2>
          <p>Learn the EML rule and the first block combination.</p>
        </Link>
      </section>
    </main>
  );
}
