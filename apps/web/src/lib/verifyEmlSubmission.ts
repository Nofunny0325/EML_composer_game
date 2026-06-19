import type { CompositionNode } from "@/types/eml";

type VerifyResult = {
  equivalent: boolean;
  method?: "numeric";
  expression?: string;
  target?: string;
  reason?: string;
};

type Env = {
  x: number;
  y: number;
};

type TargetNode =
  | { type: "number"; value: number }
  | { type: "var"; name: "x" | "y" | "pi" | "e" | "i" }
  | { type: "unary"; op: "-"; value: TargetNode }
  | { type: "binary"; op: "+" | "-" | "*" | "/" | "^"; left: TargetNode; right: TargetNode }
  | { type: "call"; name: string; args: TargetNode[] };

export async function verifyEmlSubmission(input: {
  tree: CompositionNode;
  targetFunction: string;
}): Promise<VerifyResult> {
  let targetAst: TargetNode;

  try {
    targetAst = parseTarget(input.targetFunction);
  } catch (error) {
    return {
      equivalent: false,
      reason: error instanceof Error ? error.message : "Could not parse target function."
    };
  }

  const samples = makeSamples();
  let tested = 0;
  let lastUser = Number.NaN;
  let lastTarget = Number.NaN;

  for (const sample of samples) {
    const userValue = evaluateComposition(input.tree, sample);
    const targetValue = evaluateTarget(targetAst, sample);

    if (!Number.isFinite(userValue) || !Number.isFinite(targetValue)) {
      continue;
    }

    tested += 1;
    lastUser = userValue;
    lastTarget = targetValue;

    const tolerance = 1e-7 * Math.max(1, Math.abs(userValue), Math.abs(targetValue));

    if (Math.abs(userValue - targetValue) > tolerance) {
      return {
        equivalent: false,
        method: "numeric",
        reason: "The selected block differs from the target on sampled inputs.",
        expression: formatNumber(userValue),
        target: formatNumber(targetValue)
      };
    }
  }

  if (tested < 10) {
    return {
      equivalent: false,
      method: "numeric",
      reason:
        "Not enough valid samples to verify this target. Complex-only targets are not supported in the Vercel verifier yet."
    };
  }

  return {
    equivalent: true,
    method: "numeric",
    expression: formatNumber(lastUser),
    target: formatNumber(lastTarget)
  };
}

function evaluateComposition(node: CompositionNode, env: Env): number {
  if (node.type === "const") {
    return 1;
  }

  if (node.type === "constRef") {
    return evaluateConstant(node.name);
  }

  if (node.type === "var") {
    return env[node.name];
  }

  if (node.type === "eml") {
    return eml(evaluateComposition(node.left, env), evaluateComposition(node.right, env));
  }

  const args = node.args.map((arg) => evaluateComposition(arg, env));
  return applyOperation(node.op, args);
}

function evaluateConstant(name: string): number {
  switch (name) {
    case "one":
      return 1;
    case "zero":
      return 0;
    case "two":
      return 2;
    case "half":
      return 0.5;
    case "minusOne":
      return -1;
    case "e":
      return Math.E;
    case "pi":
      return Math.PI;
    case "i":
      return Number.NaN;
    default:
      return Number.NaN;
  }
}

function applyOperation(op: string, args: number[]): number {
  switch (op) {
    case "eml":
      return eml(args[0], args[1]);
    case "exp":
      return Math.exp(args[0]);
    case "log":
      return Math.log(args[0]);
    case "add":
      return args[0] + args[1];
    case "sub":
      return args[0] - args[1];
    case "mul":
      return args[0] * args[1];
    case "div":
      return args[0] / args[1];
    case "neg":
      return -args[0];
    case "inv":
      return 1 / args[0];
    case "pow":
      return Math.pow(args[0], args[1]);
    case "sqrt":
      return Math.sqrt(args[0]);
    case "abs":
      return Math.abs(args[0]);
    case "sinh":
      return Math.sinh(args[0]);
    case "cosh":
      return Math.cosh(args[0]);
    case "tanh":
      return Math.tanh(args[0]);
    case "coth":
      return 1 / Math.tanh(args[0]);
    case "sech":
      return 1 / Math.cosh(args[0]);
    case "csch":
      return 1 / Math.sinh(args[0]);
    case "asinh":
      return Math.asinh(args[0]);
    case "acosh":
      return Math.acosh(args[0]);
    case "atanh":
      return Math.atanh(args[0]);
    case "sin":
      return Math.sin(args[0]);
    case "cos":
      return Math.cos(args[0]);
    case "tan":
      return Math.tan(args[0]);
    case "cot":
      return 1 / Math.tan(args[0]);
    case "sec":
      return 1 / Math.cos(args[0]);
    case "csc":
      return 1 / Math.sin(args[0]);
    case "atan":
      return Math.atan(args[0]);
    case "asin":
      return Math.asin(args[0]);
    case "acos":
      return Math.acos(args[0]);
    case "max":
      return Math.max(args[0], args[1]);
    case "min":
      return Math.min(args[0], args[1]);
    case "sgn":
      return Math.sign(args[0]);
    default:
      return Number.NaN;
  }
}

function eml(left: number, right: number) {
  return Math.exp(left) - Math.log(right);
}

function evaluateTarget(node: TargetNode, env: Env): number {
  switch (node.type) {
    case "number":
      return node.value;
    case "var":
      if (node.name === "x" || node.name === "y") {
        return env[node.name];
      }
      if (node.name === "pi") {
        return Math.PI;
      }
      if (node.name === "e") {
        return Math.E;
      }
      return Number.NaN;
    case "unary":
      return -evaluateTarget(node.value, env);
    case "binary": {
      const left = evaluateTarget(node.left, env);
      const right = evaluateTarget(node.right, env);

      switch (node.op) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return left / right;
        case "^":
          return Math.pow(left, right);
      }
    }
    case "call":
      return applyOperation(node.name, node.args.map((arg) => evaluateTarget(arg, env)));
  }
}

type Token =
  | { type: "number"; value: string }
  | { type: "ident"; value: string }
  | { type: "symbol"; value: string }
  | { type: "eof"; value: "" };

function parseTarget(input: string): TargetNode {
  const parser = new TargetParser(tokenize(input));
  return parser.parse();
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/\d|\./.test(char)) {
      let value = char;
      index += 1;

      while (index < input.length && /[\d.]/.test(input[index])) {
        value += input[index];
        index += 1;
      }

      tokens.push({ type: "number", value });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let value = char;
      index += 1;

      while (index < input.length && /[a-zA-Z0-9_]/.test(input[index])) {
        value += input[index];
        index += 1;
      }

      tokens.push({ type: "ident", value });
      continue;
    }

    if ("+-*/^(),".includes(char)) {
      tokens.push({ type: "symbol", value: char });
      index += 1;
      continue;
    }

    throw new Error(`Unsupported target token: ${char}`);
  }

  tokens.push({ type: "eof", value: "" });
  return tokens;
}

class TargetParser {
  private index = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): TargetNode {
    const expression = this.parseAdditive();
    this.expect("eof");
    return expression;
  }

  private parseAdditive(): TargetNode {
    let node = this.parseMultiplicative();

    while (this.matchSymbol("+") || this.matchSymbol("-")) {
      const op = this.previous().value as "+" | "-";
      const right = this.parseMultiplicative();
      node = { type: "binary", op, left: node, right };
    }

    return node;
  }

  private parseMultiplicative(): TargetNode {
    let node = this.parsePower();

    while (this.matchSymbol("*") || this.matchSymbol("/")) {
      const op = this.previous().value as "*" | "/";
      const right = this.parsePower();
      node = { type: "binary", op, left: node, right };
    }

    return node;
  }

  private parsePower(): TargetNode {
    let node = this.parseUnary();

    if (this.matchSymbol("^")) {
      const right = this.parsePower();
      node = { type: "binary", op: "^", left: node, right };
    }

    return node;
  }

  private parseUnary(): TargetNode {
    if (this.matchSymbol("-")) {
      return { type: "unary", op: "-", value: this.parseUnary() };
    }

    return this.parsePrimary();
  }

  private parsePrimary(): TargetNode {
    const token = this.peek();

    if (this.match("number")) {
      return { type: "number", value: Number(token.value) };
    }

    if (this.match("ident")) {
      const name = token.value;

      if (this.matchSymbol("(")) {
        const args: TargetNode[] = [];

        if (!this.checkSymbol(")")) {
          do {
            args.push(this.parseAdditive());
          } while (this.matchSymbol(","));
        }

        this.expectSymbol(")");
        return { type: "call", name: normalizeFunctionName(name), args };
      }

      return { type: "var", name: normalizeVariableName(name) };
    }

    if (this.matchSymbol("(")) {
      const node = this.parseAdditive();
      this.expectSymbol(")");
      return node;
    }

    throw new Error(`Unexpected target token: ${token.value || token.type}`);
  }

  private match(type: Token["type"]) {
    if (this.peek().type !== type) {
      return false;
    }

    this.index += 1;
    return true;
  }

  private matchSymbol(value: string) {
    if (!this.checkSymbol(value)) {
      return false;
    }

    this.index += 1;
    return true;
  }

  private checkSymbol(value: string) {
    const token = this.peek();
    return token.type === "symbol" && token.value === value;
  }

  private expect(type: Token["type"]) {
    if (!this.match(type)) {
      throw new Error(`Expected ${type}.`);
    }
  }

  private expectSymbol(value: string) {
    if (!this.matchSymbol(value)) {
      throw new Error(`Expected ${value}.`);
    }
  }

  private peek() {
    return this.tokens[this.index];
  }

  private previous() {
    return this.tokens[this.index - 1];
  }
}

function normalizeVariableName(name: string): "x" | "y" | "pi" | "e" | "i" {
  if (name === "x" || name === "y" || name === "pi" || name === "e" || name === "i") {
    return name;
  }

  throw new Error(`Unknown target variable or constant: ${name}`);
}

function normalizeFunctionName(name: string) {
  if (name === "sign") {
    return "sgn";
  }

  return name;
}

function makeSamples(): Env[] {
  const fixed: Env[] = [
    { x: -2, y: 0.75 },
    { x: -1, y: 1.25 },
    { x: -0.5, y: 1.5 },
    { x: 0.25, y: 2 },
    { x: 0.5, y: 2.5 },
    { x: 1, y: 3 },
    { x: 1.5, y: 3.5 },
    { x: 2, y: 4 }
  ];

  const generated = Array.from({ length: 28 }, (_, index) => {
    const xValue = -2.4 + index * 0.18;
    const yValue = 0.6 + (index % 13) * 0.27;
    return { x: xValue, y: yValue };
  });

  return [...fixed, ...generated];
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toPrecision(8) : String(value);
}
