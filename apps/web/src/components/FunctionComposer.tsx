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
      setResult({ ok: false, message: "Drop one block into each EML slot first." });
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
        setResult({ ok: false, message: "Choose a workspace block as your final answer." });
        return;
      }

      const token = localStorage.getItem("eml_token");

      if (!token) {
        setResult({ ok: false, message: "Login is required." });
        return;
      }

      const startedAt = performance.now();
      let res: Response;

      try {
        res = await fetch(`/api/stages/${stageId}/clear`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            expressionTree: answer.node,
            timeMs: Math.round(performance.now() - startedAt)
          })
        });
      } catch {
        setResult({ ok: false, message: "Could not connect to the web server." });
        return;
      }

      const data = await readJsonResponse(res);

      if (data.cleared) {
        setResult({
          ok: true,
          message: `Cleared. Verified by ${data.method ?? "equivalence check"}.`
        });
      } else {
        setResult({
          ok: false,
          message: data.reason ?? data.error ?? "The selected block is not equivalent yet."
        });
      }
    } catch (error) {
      setResult({
        ok: false,
        message: error instanceof Error ? error.message : "Submit failed."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="composer panel">
      <div className="composerHeader">
        <div>
          <h2>EML Workshop</h2>
          <p className="muted">
            Drag two blocks into the slots. Every combine creates EML(left, right).
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
          Reset
        </button>
      </div>

      <section className="emlWorkbench">
        <div className="palettePanel">
          <h3>Blocks</h3>
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
          <h3>EML Combiner</h3>
          <div className="emlFormula">
            <strong>EML</strong>
            <span>(</span>
            <DropSlot
              block={left}
              label="left"
              onClear={() => setLeft(null)}
              onDrop={(event) => dropToSlot("left", event)}
            />
            <span>,</span>
            <DropSlot
              block={right}
              label="right"
              onClear={() => setRight(null)}
              onDrop={(event) => dropToSlot("right", event)}
            />
            <span>)</span>
          </div>
          <button className="primary" type="button" onClick={combine}>
            Combine into New Block
          </button>
        </div>
      </section>

      <section className="workspacePanel">
        <div className="workspaceHeader">
          <h3>Workspace</h3>
          <span className="muted">{workspace.length} block(s)</span>
        </div>

        {workspace.length === 0 ? (
          <p className="emptyWorkspace">
            Click or drag base blocks to start. Combine blocks to build deeper EML trees.
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
          {submitting ? "Checking..." : "Submit Selected Block"}
        </button>
        <span className="muted">
          {answerId ? "Selected answer is highlighted in the workspace." : "No answer selected."}
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
            Clear
          </button>
        </>
      ) : (
        <span>Drop {label}</span>
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
        <h3>Unlocked</h3>
        <div className="chips">
          {availableBlocks.map((block) => (
            <span className="chip" title={block.description} key={block.id}>
              {block.id === "eml" ? "EML combiner" : block.label}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3>Locked Later</h3>
        <div className="chips lockedChips">
          {locked.slice(0, 18).map((block) => (
            <span className="chip lockedChip" title={`Stage ${block.unlockStage}`} key={block.id}>
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
    return { error: `Empty server response. HTTP ${res.status}` };
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 240) || `Invalid server response. HTTP ${res.status}` };
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
