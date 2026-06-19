import random
from typing import Any

import sympy as sp
from sympy.parsing.sympy_parser import parse_expr

x, y = sp.symbols("x y", real=True)


def sech_fn(value: sp.Expr) -> sp.Expr:
    return 1 / sp.cosh(value)


def csch_fn(value: sp.Expr) -> sp.Expr:
    return 1 / sp.sinh(value)


def sec_fn(value: sp.Expr) -> sp.Expr:
    return 1 / sp.cos(value)


def csc_fn(value: sp.Expr) -> sp.Expr:
    return 1 / sp.sin(value)


ALLOWED = {
    "x": x,
    "y": y,
    "i": sp.I,
    "I": sp.I,
    "pi": sp.pi,
    "e": sp.E,
    "E": sp.E,
    "exp": sp.exp,
    "log": sp.log,
    "sqrt": sp.sqrt,
    "abs": sp.Abs,
    "Abs": sp.Abs,
    "sin": sp.sin,
    "cos": sp.cos,
    "tan": sp.tan,
    "cot": sp.cot,
    "sec": sec_fn,
    "csc": csc_fn,
    "sinh": sp.sinh,
    "cosh": sp.cosh,
    "tanh": sp.tanh,
    "coth": sp.coth,
    "sech": sech_fn,
    "csch": csch_fn,
    "asin": sp.asin,
    "acos": sp.acos,
    "atan": sp.atan,
    "asinh": sp.asinh,
    "acosh": sp.acosh,
    "atanh": sp.atanh,
    "max": sp.Max,
    "min": sp.Min,
    "Max": sp.Max,
    "Min": sp.Min,
    "sgn": sp.sign,
    "sign": sp.sign,
}


def tree_to_sympy(node: dict[str, Any]) -> sp.Expr:
    kind = node.get("type")

    if kind == "const":
        if node.get("value") != 1:
            raise ValueError("Only constant 1 is allowed.")
        return sp.Integer(1)

    if kind == "constRef":
        name = node.get("name")
        constants = {
            "one": sp.Integer(1),
            "zero": sp.Integer(0),
            "two": sp.Integer(2),
            "half": sp.Rational(1, 2),
            "minusOne": sp.Integer(-1),
            "e": sp.E,
            "pi": sp.pi,
            "i": sp.I,
        }

        if name not in constants:
            raise ValueError(f"Unsupported constant block: {name}")

        return constants[name]

    if kind == "var":
        name = node.get("name")
        if name not in ("x", "y"):
            raise ValueError("Only variables x and y are allowed.")
        return ALLOWED[name]

    if kind == "eml":
        left = tree_to_sympy(node.get("left"))
        right = tree_to_sympy(node.get("right"))
        return sp.exp(left) - sp.log(right)

    if kind == "op":
        op = node.get("op")
        args = [tree_to_sympy(arg) for arg in node.get("args", [])]
        return apply_op(op, args)

    raise ValueError(f"Unsupported node type: {kind}")


def require_arity(op: str, args: list[sp.Expr], arity: int) -> None:
    if len(args) != arity:
        raise ValueError(f"{op} expects {arity} argument(s).")


def apply_op(op: str, args: list[sp.Expr]) -> sp.Expr:
    if op in ("one", "zero", "two", "half", "minusOne", "e", "pi", "i"):
        return tree_to_sympy({"type": "constRef", "name": op})

    if op in ("x", "y"):
        return tree_to_sympy({"type": "var", "name": op})

    if op == "eml":
        require_arity(op, args, 2)
        return sp.exp(args[0]) - sp.log(args[1])

    unary = {
        "exp": sp.exp,
        "log": sp.log,
        "neg": lambda a: -a,
        "inv": lambda a: 1 / a,
        "sqrt": sp.sqrt,
        "abs": sp.Abs,
        "sinh": sp.sinh,
        "cosh": sp.cosh,
        "tanh": sp.tanh,
        "coth": sp.coth,
        "sech": sech_fn,
        "csch": csch_fn,
        "asinh": sp.asinh,
        "acosh": sp.acosh,
        "atanh": sp.atanh,
        "sin": sp.sin,
        "cos": sp.cos,
        "tan": sp.tan,
        "cot": sp.cot,
        "sec": sec_fn,
        "csc": csc_fn,
        "atan": sp.atan,
        "asin": sp.asin,
        "acos": sp.acos,
        "sgn": sp.sign,
    }

    if op in unary:
        require_arity(op, args, 1)
        return unary[op](args[0])

    if op == "add":
        require_arity(op, args, 2)
        return args[0] + args[1]

    if op == "sub":
        require_arity(op, args, 2)
        return args[0] - args[1]

    if op == "mul":
        require_arity(op, args, 2)
        return args[0] * args[1]

    if op == "div":
        require_arity(op, args, 2)
        return args[0] / args[1]

    if op == "pow":
        require_arity(op, args, 2)
        return args[0] ** args[1]

    if op == "max":
        require_arity(op, args, 2)
        return sp.Max(args[0], args[1])

    if op == "min":
        require_arity(op, args, 2)
        return sp.Min(args[0], args[1])

    raise ValueError(f"Unsupported operator block: {op}")


def parse_target(expr: str) -> sp.Expr:
    normalized = expr.replace("^", "**")
    return parse_expr(normalized, local_dict=ALLOWED, evaluate=True)


def symbolic_equivalent(a: sp.Expr, b: sp.Expr) -> bool:
    if sp.simplify(a - b) == 0:
        return True

    diff = a - b
    attempts = [
        lambda value: sp.simplify(value),
        lambda value: sp.trigsimp(value),
        lambda value: sp.powsimp(value, force=True),
        lambda value: sp.expand_log(value, force=True),
        lambda value: sp.simplify(sp.trigsimp(sp.powsimp(value, force=True))),
    ]

    for attempt in attempts:
        try:
            if sp.simplify(attempt(diff)) == 0:
                return True
        except Exception:
            continue

    return False


def numeric_equivalent(a: sp.Expr, b: sp.Expr) -> bool:
    samples = [
        {x: sp.Rational(1, 4), y: sp.Rational(5, 4)},
        {x: sp.Rational(1, 2), y: sp.Integer(2)},
        {x: sp.Integer(1), y: sp.Integer(3)},
        {x: sp.Integer(2), y: sp.Integer(4)},
        {x: sp.Rational(-1, 2), y: sp.Rational(3, 2)},
        {x: sp.Rational(-5, 4), y: sp.Rational(9, 4)},
    ]

    for _ in range(24):
        samples.append(
            {
                x: random.uniform(-2.5, 2.5),
                y: random.uniform(0.5, 4.0),
            }
        )

    tested = 0

    for sample in samples:
        try:
            av = complex(sp.N(a.subs(sample), 40))
            bv = complex(sp.N(b.subs(sample), 40))
        except Exception:
            continue

        if not (abs(av) < 1e100 and abs(bv) < 1e100):
            continue

        tested += 1

        if abs(av - bv) > 1e-8 * max(1.0, abs(av), abs(bv)):
            return False

    return tested >= 8


def verify(tree: dict[str, Any], target_function: str) -> dict[str, Any]:
    try:
        user_expr = tree_to_sympy(tree)
        target_expr = parse_target(target_function)
    except Exception as exc:
        return {
            "equivalent": False,
            "reason": str(exc),
        }

    try:
        if symbolic_equivalent(user_expr, target_expr):
            return {
                "equivalent": True,
                "method": "symbolic",
                "expression": str(user_expr),
                "target": str(target_expr),
            }
    except Exception:
        pass

    if numeric_equivalent(user_expr, target_expr):
        return {
            "equivalent": True,
            "method": "numeric",
            "expression": str(user_expr),
            "target": str(target_expr),
        }

    return {
        "equivalent": False,
        "reason": "Submitted EML tree is not equivalent to the target function.",
        "expression": str(user_expr),
        "target": str(target_expr),
    }
