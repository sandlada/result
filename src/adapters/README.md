# adapters

`@sandlada/result/adapters` — bridges between plain functions / values and the Result railway.

## Scope

- Operates on: the boundary between single-track values or plain functions and two-track Results / Options.
- Execution model: synchronous, except `switchFnAsync` / `teeAsync`, which await a Promise-returning callback.
- Not here: Result operators (`operators`), Option operators (`option`).

## API

### Function shape

| Export | Description | Source |
| --- | --- | --- |
| `switchFn` | Wraps a plain function into a function returning `IResultOfT`; a throw is captured as `Err`. | [switchFn.ts](./switchFn.ts) |
| `switchFnAsync` | Wraps a Promise-returning plain function into a function returning `Promise<IResultOfT>`. | [switchFnAsync.ts](./switchFnAsync.ts) |
| `liftMap` | Semantic alias of `operators/map` for lifting a plain function onto the success track. | [liftMap.ts](./liftMap.ts) |
| `tee` | Single-track side effect: runs the callback and returns the input value unchanged. | [tee.ts](./tee.ts) |
| `teeAsync` | Async single-track side effect: awaits the callback and returns the input value unchanged. | [teeAsync.ts](./teeAsync.ts) |

### Result ↔ Option

| Export | Description | Source |
| --- | --- | --- |
| `toOption` | `Ok(value)` becomes `Some(value)`; `Err` becomes `None`, discarding the error. | [toOption.ts](./toOption.ts) |
| `fromOption` | `Some(value)` becomes `Ok(value)`; `None` becomes `Err(error)`. | [fromOption.ts](./fromOption.ts) |

## Contract notes

- `switchFn` / `switchFnAsync` capture to values, including a second collapse when `errorFn` itself throws; `liftMap` delegates to `operators/map`, so it captures as well.
- `tee` / `teeAsync` propagate directly — there is no failure state to convert.
- `toOption` / `fromOption` never throw; `fromOption` needs an error value (or factory) for the `None` branch.
- Throw policy: [behavior-modes.md §4.4](../../docs/behavior-modes.md#44-adapters-and-high-frequency-primitives-srcadapters-srcprimitives).

## Related

- [`operators`](../operators/README.md) — the operators these adapters feed into.
- [`option`](../option/README.md) — Option-side operators, including `okOr` / `transpose` bridges.
- [`primitives`](../primitives/README.md) — `lift`, the dual-state alternative to `switchFn`.
