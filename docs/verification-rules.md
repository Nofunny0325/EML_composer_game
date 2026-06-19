# Verification Rules

The game UI sends a function composition tree. The player-facing composition
action is always EML:

```json
{
  "type": "op",
  "op": "eml",
  "args": [
    { "type": "var", "name": "x" },
    { "type": "constRef", "name": "one" }
  ]
}
```

Raw EML is represented as:

```txt
eml(a, b) => exp(a) - log(b)
```

Then it compares the submitted expression to the target expression by:

1. symbolic simplification;
2. trigonometric and logarithmic simplification;
3. numeric sampling fallback.

For production, add per-stage domains such as `real`, `positive`, and `complex`.
