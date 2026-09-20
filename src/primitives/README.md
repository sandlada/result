# primitives

`@sandlada/result/primitives` — high-frequency helpers: conditionals, collection folding and one-step lifting.

## Scope

- Operates on: `IResultOfT` (mostly), `IOption` collections and `AsyncResult` arrays.
- Execution model: synchronous; `sequenceAsyncResult` returns a lazy `AsyncResult`.
- Not here: the operators that most helpers delegate to (`operators`, `combine`).

## API

### Conditional

| Export | Description | Source |
| --- | --- | --- |
| `cond` | `Ok(value)` when the predicate passes, otherwise `Err(error)`. | [cond.ts](./cond.ts) |
| `condErr` | Inverse of `cond`: `Err(error)` when the predicate passes. | [condErr.ts](./condErr.ts) |

### Collection

| Export | Description | Source |
| --- | --- | --- |
| `sequence` | Alias of `combine` for an array of Results; fails fast. | [sequence.ts](./sequence.ts) |
| `reduce` | Left-fold over an array, short-circuiting on the first failed source or reducer step. | [reduce.ts](./reduce.ts) |
| `partitionOption` | Splits `IOption<T>[]` into `{ some, noneIndices }`, preserving `None` positions. | [partitionOption.ts](./partitionOption.ts) |
| `Partitioned` (type) | Return shape of `partitionOption`. | [partitionOption.ts](./partitionOption.ts) |

### Async

| Export | Description | Source |
| --- | --- | --- |
| `sequenceAsyncResult` | Turns an `AsyncResult[]` into a lazy `AsyncResult<T[], E>`. | [sequenceAsyncResult.ts](./sequenceAsyncResult.ts) |

### Lifting

| Export | Description | Source |
| --- | --- | --- |
| `lift` | Wraps a possibly-throwing function into a Result-returning one. | [lift.ts](./lift.ts) |

## Contract notes

- `cond` / `condErr` propagate a throw from the predicate; only the predicate result is interpreted.
- `sequence` delegates to `combine` and is `FailFirst`; `reduce` is also `FailFirst` on either a failed source or a failed reducer step.
- `lift` is dual-state: with an `errorFn` it captures to `Err`, without one it rethrows as-is. An `E = never` return type is a type-level promise only — the runtime can still throw.
- `partitionOption` returns the `None` **indices**, not the `None` values (there is no payload to preserve); use [`operators/separate`](../operators/separate.ts) for Results.
- `sequenceAsyncResult` is lazy: construction only grabs the `run` reference; a synchronous throw or runtime rejection inside `run()` propagates as a rejection and fails fast.
- Throw policy: [behavior-modes.md §4.4](../../docs/behavior-modes.md#44-adapters-and-high-frequency-primitives-srcadapters-srcprimitives).

## Related

- [`combine`](../combine/README.md) — `sequence` and the two combination policies.
- [`option`](../option/README.md) — `all` / `zipWith` for Option tuples.
- [`async-result`](../async-result/README.md) — the carrier `sequenceAsyncResult` builds.
