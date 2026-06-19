# Stage Design

The stage list lives in:

```txt
apps/web/src/data/stages.json
```

The MVP uses 50 stages across five levels:

- Level 1: tutorial and basic constructors
- Level 2: algebraic operators and powers
- Level 3: real transcendental functions
- Level 4: complex extension and trigonometric functions
- Level 5: nonlinear and discontinuous-style operators

The current game uses an EML-only workshop. Players drag visible blocks into the
left and right slots of an EML combiner. Pressing combine creates a new reusable
block whose internal expression is:

```txt
eml(left, right)
```

Traditional formula operators such as `+`, `*`, and `/` are not visible player
actions. Solved functions may become reusable blocks, but the act of composition
is always EML.
