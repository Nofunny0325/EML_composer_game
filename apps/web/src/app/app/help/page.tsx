export default function HelpPage() {
  return (
    <main className="page panel">
      <h1>Help</h1>
      <p>
        The only primitive operator is <strong>eml(a, b) = exp(a) - log(b)</strong>.
      </p>
      <p>
        In the player UI, solved functions become reusable blocks. Drag two blocks
        into the EML combiner to create a new block, then reuse that new block.
      </p>
      <p className="muted">
        Stage 1 answer: drag 1 into both EML slots, combine, then submit the new
        EML(1, 1) block.
      </p>
    </main>
  );
}
