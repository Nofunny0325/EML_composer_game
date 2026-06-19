"use client";

import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import {
  BLOCKS,
  getAvailableBlocks,
  getBlock,
  getPaletteBlocks,
  getPaletteNode
} from "@/lib/blocks";
import type { BlockId, CompositionNode } from "@/types/eml";

const HIDDEN_SUMMARY_BLOCKS = new Set<BlockId>([
  "add",
  "sub",
  "mul",
  "div",
  "neg",
  "inv",
  "pow"
]);

type WorkspaceBlock = {
  id: string;
  label: string;
  node: CompositionNode;
};

type DragPayload =
  | { source: "palette"; blockId: BlockId }
  | { source: "workspace"; id: string };

export function FunctionComposer({ stageId }: { stageId: number }) {
  const paletteBlocks = useMemo(() => getPaletteBlocks(stageId), [stageId]);
  const availableBlocks = useMemo(() => getAvailableBlocks(stageId), [stageId]);
  const [workspace, setWorkspace] = useState<WorkspaceBlock[]>([]);
  const [left, setLeft] = useState<WorkspaceBlock | null>(null);
  const [right, setRight] = useState<WorkspaceBlock | null>(null);
  const [answerId, setAnswerId] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function resolvePayload(payload: DragPayload): WorkspaceBlock | null {
    if (payload.source === "palette") {
      const block = getBlock(payload.blockId);
      return {
        id: createId(),
        label: block.label,
        node: getPaletteNode(payload.blockId)
      };
    }

    return workspace.find((block) => block.id === payload.id) ?? null;
  }

  function dropToSlot(slot: "left" | "right", event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const payload = readDragPayload(event);

    if (!payload) {
      return;
    }

    const block = resolvePayload(payload);

    if (!block) {
      return;
    }

    if (slot === "left") {
      setLeft(block);
    } else {
      setRight(block);
    }
  }

  function combine() {
    if (!left || !right) {
      setResult({ ok: false, message: "EML의 왼쪽과 오른쪽 칸에 블록을 하나씩 넣어 주세요." });
      return;
    }

    const next: WorkspaceBlock = {
      id: createId(),
      label: `EML(${left.label}, ${right.label})`,
      node: {
        type: "op",
        op: "eml",
        args: [left.node, right.node]
      }
    };

    setWorkspace((items) => [next, ...items]);
    setAnswerId(next.id);
    setLeft(null);
    setRight(null);
    setResult(null);
  }

  async function submit() {
    setSubmitting(true);
    setResult(null);

    try {
      const answer = workspace.find((block) => block.id === answerId);

      if (!answer) {
        setResult({ ok: false, message: "최종 답으로 제출할 작업 공간 블록을 선택해 주세요." });
        return;
      }

      const startedAt = performance.now();
      let res: Response;

      try {
        res = await fetch(`/api/stages/${stageId}/clear`, {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            expressionTree: answer.node,
            timeMs: Math.round(performance.now() - startedAt)
          })
        });
      } catch {
        setResult({ ok: false, message: "웹 서버에 연결하지 못했습니다." });
        return;
      }

      const data = await readJsonResponse(res);

      if (data.cleared) {
        setResult({
          ok: true,
          message: `클리어! ${data.method ?? "동치성 검사"}로 검증되었습니다.`
        });
      } else {
        setResult({
          ok: false,
          message: data.reason ?? data.error ?? "선택한 블록이 아직 목표 함수와 같지 않습니다."
        });
      }
    } catch (error) {
      setResult({
        ok: false,
        message: error instanceof Error ? error.message : "제출에 실패했습니다."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="composer panel">
      <div className="composerHeader">
        <div>
          <h2>EML 작업장</h2>
          <p className="muted">
            두 블록을 칸에 넣고 합치면 항상 EML(왼쪽, 오른쪽) 형태의 새 블록이 만들어집니다.
          </p>
        </div>
        <button
          className="button ghost"
          type="button"
          onClick={() => {
            setWorkspace([]);
            setLeft(null);
            setRight(null);
            setAnswerId("");
            setResult(null);
          }}
        >
          초기화
        </button>
      </div>

      <section className="emlWorkbench">
        <div className="palettePanel">
          <h3>블록</h3>
          <div className="dragPalette">
            {paletteBlocks.map((block) => (
              <button
                className="dragBlock"
                draggable
                key={block.id}
                onClick={() => {
                  const item = {
                    id: createId(),
                    label: block.label,
                    node: getPaletteNode(block.id)
                  };
                  setWorkspace((items) => [item, ...items]);
                  setAnswerId(item.id);
                }}
                onDragStart={(event) =>
                  writeDragPayload(event, { source: "palette", blockId: block.id })
                }
                title={block.description}
                type="button"
              >
                {block.label}
              </button>
            ))}
          </div>
        </div>

        <div className="combinerPanel">
          <h3>EML 조합기</h3>
          <div className="emlFormula">
            <strong>EML</strong>
            <span>(</span>
            <DropSlot
              block={left}
              label="왼쪽"
              onClear={() => setLeft(null)}
              onDrop={(event) => dropToSlot("left", event)}
            />
            <span>,</span>
            <DropSlot
              block={right}
              label="오른쪽"
              onClear={() => setRight(null)}
              onDrop={(event) => dropToSlot("right", event)}
            />
            <span>)</span>
          </div>
          <button className="primary" type="button" onClick={combine}>
            새 EML 블록 만들기
          </button>
        </div>
      </section>

      <section className="workspacePanel">
        <div className="workspaceHeader">
          <h3>작업 공간</h3>
          <span className="muted">블록 {workspace.length}개</span>
        </div>

        {workspace.length === 0 ? (
          <p className="emptyWorkspace">
            시작하려면 기본 블록을 클릭하거나 끌어오세요. 블록을 계속 합치면 더 깊은 EML 트리를 만들 수 있습니다.
          </p>
        ) : (
          <div className="workspaceBlocks">
            {workspace.map((block) => (
              <div
                className={block.id === answerId ? "workspaceBlock selected" : "workspaceBlock"}
                draggable
                key={block.id}
                onDragStart={(event) =>
                  writeDragPayload(event, { source: "workspace", id: block.id })
                }
              >
                <button type="button" onClick={() => setAnswerId(block.id)}>
                  {block.label}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="submitRow">
        <button className="primary submitButton" disabled={submitting} onClick={submit}>
          {submitting ? "검사 중..." : "선택한 블록 제출"}
        </button>
        <span className="muted">
          {answerId ? "작업 공간에서 강조된 블록이 제출됩니다." : "아직 선택된 답이 없습니다."}
        </span>
      </div>

      <BlockSummary availableBlocks={availableBlocks} />

      {result ? (
        <p className={result.ok ? "result ok" : "result fail"}>{result.message}</p>
      ) : null}
    </section>
  );
}

function DropSlot({
  block,
  label,
  onClear,
  onDrop
}: {
  block: WorkspaceBlock | null;
  label: string;
  onClear: () => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={block ? "dropSlot filled" : "dropSlot"}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      {block ? (
        <>
          <span>{block.label}</span>
          <button type="button" onClick={onClear}>
            비우기
          </button>
        </>
      ) : (
        <span>{label} 블록 놓기</span>
      )}
    </div>
  );
}

function BlockSummary({ availableBlocks }: { availableBlocks: ReturnType<typeof getAvailableBlocks> }) {
  const locked = BLOCKS.filter(
    (block) =>
      !HIDDEN_SUMMARY_BLOCKS.has(block.id) &&
      !availableBlocks.some((availableBlock) => availableBlock.id === block.id)
  );

  return (
    <div className="palette">
      <div>
        <h3>해금됨</h3>
        <div className="chips">
          {availableBlocks.map((block) => (
            <span className="chip" title={block.description} key={block.id}>
              {block.id === "eml" ? "EML 조합기" : block.label}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3>나중에 해금</h3>
        <div className="chips lockedChips">
          {locked.slice(0, 18).map((block) => (
            <span className="chip lockedChip" title={`스테이지 ${block.unlockStage}`} key={block.id}>
              {block.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

async function readJsonResponse(res: Response) {
  const text = await res.text();

  if (!text) {
    return { error: `서버 응답이 비어 있습니다. HTTP ${res.status}` };
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 240) || `서버 응답 형식이 올바르지 않습니다. HTTP ${res.status}` };
  }
}

function writeDragPayload(event: DragEvent, payload: DragPayload) {
  event.dataTransfer.setData("application/json", JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "copy";
}

function readDragPayload(event: DragEvent): DragPayload | null {
  const raw = event.dataTransfer.getData("application/json");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DragPayload;
  } catch {
    return null;
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}
