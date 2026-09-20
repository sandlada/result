# composition

`@sandlada/result/composition` — pipeline and Kleisli composition, plus generator-based error propagation.

## Scope

- Operates on: plain functions and Result-returning functions.
- Execution model: synchronous (`pipe`, `composeK`, `safeTry`) or eager async (`pipeAsync`, `composeKAsync`); `fromSafeTryAsync` returns a lazy `AsyncResult`.
- Not here: individual operators (`operators`), function-shape adapters (`adapters`).

## API

### Pipeline

| Export | Description | Source |
| --- | --- | --- |
| `pipe` | Left-to-right function composition with explicit overloads for 1–10 steps. | [pipe.ts](./pipe.ts) |
| `pipeAsync` | Async pipeline for Promise-returning steps. | [pipeAsync.ts](./pipeAsync.ts) |

### Kleisli composition

| Export | Description | Source |
| --- | --- | --- |
| `composeK` | Composes Result-returning functions into a single Result-returning function (2–6 overloads). | [composeK.ts](./composeK.ts) |
| `composeKAsync` | Async Kleisli composition for `Promise<IResultOfT>`-returning functions. | [composeKAsync.ts](./composeKAsync.ts) |

### Generator do-notation

| Export | Description | Source |
| --- | --- | --- |
| `safeTry` / `fromSafeTry` | Runs a generator that `yield*`s Results; failures short-circuit the pipeline. | [safeTry.ts](./safeTry.ts) |
| `safeTryAsync` / `fromSafeTryAsync` | Async counterpart; `fromSafeTryAsync` returns a lazy `AsyncResult`. | [safeTryAsync.ts](./safeTryAsync.ts) |

## Contract notes

- `pipe` and `pipeAsync` are unaware of Results: `pipe` lets a synchronous step throw bubble out, while `pipeAsync` turns a synchronous step throw into a rejection and does not unwrap thenables (a mixed chain passes raw values on).
- `composeK` and `composeKAsync` capture to values — a synchronous step throw (and, for the async variant, an async rejection) becomes `Err`. Both panic at construction time when given zero functions.
- `safeTry` / `safeTryAsync` rethrow a generator's own throws. They also throw when the generator succeeds without returning a value or yields more than once; `safeTryAsync` throws a `TypeError` when the resolved value is not a valid `IResultOfT`. See [behavior-modes.md §4.3](../../docs/behavior-modes.md#43-composition-srccombine-srccomposition).
- Prefer `safeTry` / `safeTryAsync` when the pipeline needs plain `yield*` syntax; use `composeK*` when building a reusable function from a fixed chain.

## Related

- [`operators`](../operators/README.md) — the steps that pipelines usually compose.
- [`adapters`](../adapters/README.md) — converts plain functions into Result-returning ones.
- [`async-result`](../async-result/README.md) — `fromSafeTryAsync` returns an AsyncResult thunk.
