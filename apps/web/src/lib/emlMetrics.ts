import { BLOCK_IDS } from "@/lib/blocks";
import type { BlockId, CompositionNode } from "@/types/eml";

export function countNodes(node: CompositionNode): number {
  if (node.type === "op") {
    return 1 + node.args.reduce((sum, child) => sum + countNodes(child), 0);
  }

  if (node.type === "eml") {
    return 1 + countNodes(node.left) + countNodes(node.right);
  }

  return 1;
}

export function maxDepth(node: CompositionNode): number {
  if (node.type === "op") {
    return 1 + Math.max(0, ...node.args.map(maxDepth));
  }

  if (node.type === "eml") {
    return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
  }

  return 1;
}

export function collectBlockIds(node: CompositionNode): BlockId[] {
  if (node.type === "const") {
    return ["one"];
  }

  if (node.type === "constRef") {
    return [node.name];
  }

  if (node.type === "var") {
    return [node.name];
  }

  if (node.type === "eml") {
    return ["eml", ...collectBlockIds(node.left), ...collectBlockIds(node.right)];
  }

  return [node.op, ...node.args.flatMap(collectBlockIds)];
}

export function assertCompositionNode(value: unknown): asserts value is CompositionNode {
  if (!isCompositionNode(value)) {
    throw new Error("합성 트리 형식이 올바르지 않습니다.");
  }
}

function isCompositionNode(value: unknown): value is CompositionNode {
  if (!value || typeof value !== "object") {
    return false;
  }

  const node = value as Record<string, unknown>;

  if (node.type === "const") {
    return node.value === 1;
  }

  if (node.type === "constRef") {
    return (
      node.name === "one" ||
      node.name === "zero" ||
      node.name === "two" ||
      node.name === "half" ||
      node.name === "minusOne" ||
      node.name === "e" ||
      node.name === "pi" ||
      node.name === "i"
    );
  }

  if (node.type === "var") {
    return node.name === "x" || node.name === "y";
  }

  if (node.type === "eml") {
    return isCompositionNode(node.left) && isCompositionNode(node.right);
  }

  if (node.type === "op") {
    return (
      typeof node.op === "string" &&
      BLOCK_IDS.has(node.op as BlockId) &&
      Array.isArray(node.args) &&
      node.args.every(isCompositionNode)
    );
  }

  return false;
}

export function isEmlNode(value: unknown): value is CompositionNode {
  return isCompositionNode(value);
}

export function assertEmlNode(value: unknown): asserts value is CompositionNode {
  assertCompositionNode(value);
}

export function legacyCountNodes(node: CompositionNode): number {
  if (node.type !== "eml") {
    return 1;
  }

  return 1 + legacyCountNodes(node.left) + legacyCountNodes(node.right);
}
