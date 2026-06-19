"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ProgressResponse, StageDefinition } from "@/types/eml";

export function StageGrid({ stages }: { stages: StageDefinition[] }) {
  const [progress, setProgress] = useState<ProgressResponse>({
    clearedStageIds: []
  });

  useEffect(() => {
    fetch("/api/me/progress")
      .then((res) => res.text())
      .then((text) => {
        if (!text) {
          setProgress({ clearedStageIds: [] });
          return;
        }

        setProgress(JSON.parse(text));
      })
      .catch(() => setProgress({ clearedStageIds: [] }));
  }, []);

  const maxCleared = useMemo(() => {
    return progress.clearedStageIds.length
      ? Math.max(...progress.clearedStageIds)
      : 0;
  }, [progress.clearedStageIds]);

  return (
    <section className="stageGrid">
      {stages.map((stage) => {
        const cleared = progress.clearedStageIds.includes(stage.id);
        const unlocked = stage.id <= maxCleared + 1;
        const className = [
          "stageButton",
          cleared ? "cleared" : "",
          unlocked ? "unlocked" : "locked"
        ].join(" ");

        if (!unlocked) {
          return (
            <div key={stage.id} className={className} aria-disabled="true">
              <span className="stageMeta">스테이지 {stage.id} / 레벨 {stage.level}</span>
              <strong>{stage.name}</strong>
              <small className="stageLock">잠김</small>
            </div>
          );
        }

        return (
          <Link key={stage.id} className={className} href={`/app/stages/${stage.id}`}>
            <span className="stageMeta">스테이지 {stage.id} / 레벨 {stage.level}</span>
            <strong>{stage.name}</strong>
            <small>{cleared ? "클리어" : stage.target_function}</small>
          </Link>
        );
      })}
    </section>
  );
}
