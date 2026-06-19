"use client";

import { useState } from "react";

export function StageHint({ description }: { description: string }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="hintBox">
      <button className="button ghost" type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Hide Hint" : "Show Hint"}
      </button>
      {open ? <p>{description}</p> : null}
    </section>
  );
}
