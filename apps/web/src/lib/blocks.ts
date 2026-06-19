import type { BlockId, CompositionNode, ConstRef } from "@/types/eml";

export type BlockDefinition = {
  id: BlockId;
  label: string;
  description: string;
  arity: 0 | 1 | 2;
  category: "input" | "eml" | "algebra" | "transcendental" | "complex" | "nonlinear";
  unlockStage: number;
  tutorial?: boolean;
};

export const BLOCKS: BlockDefinition[] = [
  { id: "one", label: "1", description: "기본 상수", arity: 0, category: "input", unlockStage: 0 },
  { id: "x", label: "x", description: "입력 변수 x", arity: 0, category: "input", unlockStage: 0 },
  { id: "y", label: "y", description: "입력 변수 y", arity: 0, category: "input", unlockStage: 0 },
  { id: "eml", label: "EML(a,b)", description: "exp(a) - log(b)", arity: 2, category: "eml", unlockStage: 0 },

  { id: "e", label: "e", description: "오일러 상수", arity: 0, category: "algebra", unlockStage: 1, tutorial: true },
  { id: "exp", label: "exp(a)", description: "지수 함수", arity: 1, category: "algebra", unlockStage: 2, tutorial: true },
  { id: "log", label: "log(a)", description: "자연로그", arity: 1, category: "algebra", unlockStage: 3, tutorial: true },
  { id: "zero", label: "0", description: "덧셈의 항등원", arity: 0, category: "algebra", unlockStage: 4, tutorial: true },
  { id: "add", label: "a + b", description: "덧셈", arity: 2, category: "algebra", unlockStage: 0, tutorial: true },
  { id: "sub", label: "a - b", description: "뺄셈", arity: 2, category: "algebra", unlockStage: 0, tutorial: true },
  { id: "mul", label: "a * b", description: "곱셈", arity: 2, category: "algebra", unlockStage: 0, tutorial: true },
  { id: "div", label: "a / b", description: "나눗셈", arity: 2, category: "algebra", unlockStage: 0, tutorial: true },
  { id: "inv", label: "1 / a", description: "역수", arity: 1, category: "algebra", unlockStage: 0, tutorial: true },
  { id: "neg", label: "-a", description: "부호 반전", arity: 1, category: "algebra", unlockStage: 0, tutorial: true },
  { id: "two", label: "2", description: "1 + 1로 만든 편의 상수", arity: 0, category: "algebra", unlockStage: 11 },
  { id: "minusOne", label: "-1", description: "0 - 1로 만든 편의 상수", arity: 0, category: "algebra", unlockStage: 11 },
  { id: "half", label: "1/2", description: "1 / 2로 만든 편의 상수", arity: 0, category: "algebra", unlockStage: 14 },
  { id: "pow", label: "a^b", description: "거듭제곱", arity: 2, category: "algebra", unlockStage: 13, tutorial: true },
  { id: "sqrt", label: "sqrt(a)", description: "제곱근", arity: 1, category: "algebra", unlockStage: 14, tutorial: true },
  { id: "abs", label: "|a|", description: "절댓값", arity: 1, category: "algebra", unlockStage: 16, tutorial: true },

  { id: "sinh", label: "sinh(a)", description: "쌍곡사인", arity: 1, category: "transcendental", unlockStage: 19 },
  { id: "cosh", label: "cosh(a)", description: "쌍곡코사인", arity: 1, category: "transcendental", unlockStage: 20 },
  { id: "tanh", label: "tanh(a)", description: "쌍곡탄젠트", arity: 1, category: "transcendental", unlockStage: 21 },
  { id: "coth", label: "coth(a)", description: "쌍곡코탄젠트", arity: 1, category: "transcendental", unlockStage: 22 },
  { id: "sech", label: "sech(a)", description: "쌍곡시컨트", arity: 1, category: "transcendental", unlockStage: 23 },
  { id: "csch", label: "csch(a)", description: "쌍곡코시컨트", arity: 1, category: "transcendental", unlockStage: 24 },
  { id: "asinh", label: "asinh(a)", description: "역쌍곡사인", arity: 1, category: "transcendental", unlockStage: 25 },
  { id: "acosh", label: "acosh(a)", description: "역쌍곡코사인", arity: 1, category: "transcendental", unlockStage: 26 },
  { id: "atanh", label: "atanh(a)", description: "역쌍곡탄젠트", arity: 1, category: "transcendental", unlockStage: 27 },

  { id: "i", label: "i", description: "허수 단위", arity: 0, category: "complex", unlockStage: 30 },
  { id: "sin", label: "sin(a)", description: "사인", arity: 1, category: "complex", unlockStage: 32 },
  { id: "cos", label: "cos(a)", description: "코사인", arity: 1, category: "complex", unlockStage: 33 },
  { id: "tan", label: "tan(a)", description: "탄젠트", arity: 1, category: "complex", unlockStage: 34 },
  { id: "cot", label: "cot(a)", description: "코탄젠트", arity: 1, category: "complex", unlockStage: 35 },
  { id: "sec", label: "sec(a)", description: "시컨트", arity: 1, category: "complex", unlockStage: 36 },
  { id: "csc", label: "csc(a)", description: "코시컨트", arity: 1, category: "complex", unlockStage: 37 },
  { id: "atan", label: "atan(a)", description: "아크탄젠트", arity: 1, category: "complex", unlockStage: 38 },
  { id: "asin", label: "asin(a)", description: "아크사인", arity: 1, category: "complex", unlockStage: 39 },
  { id: "acos", label: "acos(a)", description: "아크코사인", arity: 1, category: "complex", unlockStage: 40 },
  { id: "pi", label: "pi", description: "원주율 상수", arity: 0, category: "complex", unlockStage: 40 },

  { id: "max", label: "max(a,b)", description: "최댓값", arity: 2, category: "nonlinear", unlockStage: 41 },
  { id: "min", label: "min(a,b)", description: "최솟값", arity: 2, category: "nonlinear", unlockStage: 42 },
  { id: "sgn", label: "sgn(a)", description: "부호 함수", arity: 1, category: "nonlinear", unlockStage: 44 }
];

export const BLOCK_IDS = new Set<BlockId>(BLOCKS.map((block) => block.id));
const HIDDEN_FORMULA_BLOCKS = new Set<BlockId>([
  "add",
  "sub",
  "mul",
  "div",
  "neg",
  "inv",
  "pow"
]);

export function getBlock(id: BlockId) {
  const block = BLOCKS.find((item) => item.id === id);

  if (!block) {
    throw new Error(`알 수 없는 블록: ${id}`);
  }

  return block;
}

export function getAvailableBlocks(stageId: number) {
  return BLOCKS.filter((block) => {
    if (HIDDEN_FORMULA_BLOCKS.has(block.id)) {
      return false;
    }

    if (block.unlockStage === 0) {
      return true;
    }

    return block.unlockStage < stageId;
  });
}

export function getPaletteBlocks(stageId: number) {
  return getAvailableBlocks(stageId).filter((block) => block.id !== "eml");
}

export function getPaletteNode(id: BlockId): CompositionNode {
  const block = getBlock(id);

  if (block.arity === 0) {
    return createDefaultNode(id);
  }

  return {
    type: "op",
    op: id,
    args: Array.from({ length: block.arity }, (_, index) =>
      index === 0 ? createDefaultNode("x") : createDefaultNode("y")
    )
  };
}

export function createDefaultNode(id: BlockId): CompositionNode {
  if (id === "x" || id === "y") {
    return { type: "var", name: id };
  }

  if (isConstBlock(id)) {
    return { type: "constRef", name: id };
  }

  const block = getBlock(id);
  const args: CompositionNode[] =
    id === "eml"
      ? [createDefaultNode("one"), createDefaultNode("one")]
      : Array.from({ length: block.arity }, (_, index) =>
          index === 0 ? createDefaultNode("x") : createDefaultNode("y")
        );

  return {
    type: "op",
    op: id,
    args
  };
}

export function getDefaultExpressionForStage(stageId: number): CompositionNode {
  if (stageId === 1) {
    return createDefaultNode("eml");
  }

  if (stageId === 2) {
    return {
      type: "op",
      op: "eml",
      args: [createDefaultNode("x"), createDefaultNode("one")]
    };
  }

  if (stageId <= 18) {
    const tutorialBlock = BLOCKS.find((block) => block.tutorial && block.unlockStage === stageId);

    if (tutorialBlock) {
      return createDefaultNode(tutorialBlock.id);
    }
  }

  return createDefaultNode("x");
}

export function nodeToBlockId(node: CompositionNode): BlockId {
  if (node.type === "var") {
    return node.name;
  }

  if (node.type === "const") {
    return "one";
  }

  if (node.type === "constRef") {
    return node.name;
  }

  if (node.type === "eml") {
    return "eml";
  }

  return node.op;
}

function isConstBlock(id: BlockId): id is ConstRef {
  return ["one", "zero", "two", "half", "minusOne", "e", "pi", "i"].includes(id);
}
