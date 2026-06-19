export type BlockId =
  | "one"
  | "zero"
  | "two"
  | "half"
  | "minusOne"
  | "e"
  | "pi"
  | "i"
  | "x"
  | "y"
  | "eml"
  | "exp"
  | "log"
  | "add"
  | "sub"
  | "mul"
  | "div"
  | "neg"
  | "inv"
  | "pow"
  | "sqrt"
  | "abs"
  | "sinh"
  | "cosh"
  | "tanh"
  | "coth"
  | "sech"
  | "csch"
  | "asinh"
  | "acosh"
  | "atanh"
  | "sin"
  | "cos"
  | "tan"
  | "cot"
  | "sec"
  | "csc"
  | "atan"
  | "asin"
  | "acos"
  | "max"
  | "min"
  | "sgn";

export type ConstRef = "one" | "zero" | "two" | "half" | "minusOne" | "e" | "pi" | "i";

export type CompositionNode =
  | { type: "const"; value: 1 }
  | { type: "constRef"; name: ConstRef }
  | { type: "var"; name: "x" | "y" }
  | { type: "op"; op: BlockId; args: CompositionNode[] }
  | { type: "eml"; left: CompositionNode; right: CompositionNode };

export type StageDefinition = {
  id: number;
  name: string;
  level: number;
  target_function: string;
  description: string;
};

export type ProgressResponse = {
  clearedStageIds: number[];
};
