# combine

`@sandlada/result/combine` — combines many synchronous Results under two policies: fail first or accumulate every error.

## Scope

- Operates on: arrays and tuples of `IResultOfT`.
- Execution model: synchronous, pure value combination with no callbacks.
- Not here: async combination (`promise-result/combine`, `async-result/combine`), Option combination (`option/all`).

## API

| Export | Description | Source |
| --- | --- | --- |
| `combine` | Combines an array or tuple, returning the first `Err` or an `Ok` carrying all values. | [combine.ts](./combine.ts) |
| `all` | Combines a heterogeneous tuple, preserving each position's type; returns the first `Err`. | [all.ts](./all.ts) |
| `combineWithAllErrors` | Runs every input and accumulates all errors into `Err(E[])`. | [combineWithAllErrors.ts](./combineWithAllErrors.ts) |

## Contract notes

- `combine` and `all` are `FailFirst`: they keep the first error and never touch the remaining inputs. `combineWithAllErrors` is `Accumulate` and visits every input.
- An empty input returns `Ok([])` for all three. This is an intentional divergence from [`option/all`](../option/all.ts), which rejects the empty tuple at the type level.
- `combine` has two overloads: a heterogeneous tuple form and a homogeneous array form (`IResultOfT<A, E>[]` → `IResultOfT<A[], E>`).
- Nothing here throws; there are no callbacks to capture.
- Throw and short-circuit policy: [behavior-modes.md §4.3](../../docs/behavior-modes.md#43-composition-srccombine-srccomposition).

## Related

- [`primitives`](../primitives/README.md) — `sequence` delegates to `combine`.
- [`promise-result`](../promise-result/README.md) and [`async-result`](../async-result/README.md) — async combination with the same two policies.
- [`option`](../option/README.md) — the Option-side `all` and `zipWith`.
