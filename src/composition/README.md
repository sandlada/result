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
- `safeTry` / `safeTryAsync` rethrow a generator's own throws. They also throw when the generator succeeds without returning a value or yields more than once; `safeTryAsync` throws a `TypeError` when the resolved value is not a valid `IResultOfT`. A generator that returns a Result is used as-is, so the documented `return ok(undefined)` workaround produces `Ok(undefined)` instead of a doubly wrapped Result.
- A raw `yield` must carry a Result: the runner hands the yielded value back as the failure, so a yield that is not a Result throws a `TypeError` instead of returning a value that is not a Result at all. The check runs before the double-yield probe, so a malformed yield never resumes the generator body.
- The double-yield probe resumes the generator, so the statements **between** two raw yields execute before the error is raised. A delegation does not have this property: its failure ends the generator instead of running the body after the failed `yield*`.
- A `safeTry` / `safeTryAsync` delegation yields its failure and throws when it is resumed past that yield. The runner therefore ends the generator instead of running the body after a failed `yield*` - the short-circuit contract holds without any bookkeeping that would have to be attributed to a specific run, so concurrent runs cannot steal each other's failure. See [behavior-modes.md §4.3](../../docs/behavior-modes.md#43-composition-srccombine-srccomposition).
- Prefer `safeTry` / `safeTryAsync` when the pipeline needs plain `yield*` syntax; use `composeK*` when building a reusable function from a fixed chain.

## Related

- [`operators`](../operators/README.md) — the steps that pipelines usually compose.
- [`adapters`](../adapters/README.md) — converts plain functions into Result-returning ones.
- [`async-result`](../async-result/README.md) — `fromSafeTryAsync` returns an AsyncResult thunk.
