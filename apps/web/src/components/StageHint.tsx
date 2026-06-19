"use client";

import { useState } from "react";

export function StageHint({ description }: { description: string }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="hintBox">
      <button className="button ghost" type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "힌트 숨기기" : "힌트 보기"}
      </button>
      {open ? <p>{description}</p> : null}
    </section>
  );
}
