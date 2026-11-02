# bridge-result

`@sandlada/result/bridge-result` — lifts a **sync** `IResultOfT<T, E>` into `Promise<IResultOfT<…>>` using async callbacks. Input is always a plain Result; output is always a Promise of Result. Same export names as `operators/map` and friends, but a different subpath and carrier type.

## Scope

- Operates on: synchronous `IResultOfT<T, E>`; callbacks return `Promise<…>`.
- Execution model: eager — calling the operator starts the returned Promise immediately.
- Not here: `Promise<IResultOfT>` pipelines (`promise-result`), lazy thunks (`async-result`), or sync operators (`operators`).

## API

| Export | Description | Source |
| --- | --- | --- |
| `map` | Async map on a sync Result. | [map.ts](./map.ts) |
| `bind` | Async bind on a sync Result. | [bind.ts](./bind.ts) |
| `bindThrough` | Async side step that keeps the original success value. | [bindThrough.ts](./bindThrough.ts) |
| `match` | Async terminal match on a sync Result. | [match.ts](./match.ts) |
| `orElse` | Async recovery on a sync Result. | [orElse.ts](./orElse.ts) |
| `tap` | Async side effect on success. | [tap.ts](./tap.ts) |
| `tapErr` | Async side effect on failure. | [tapErr.ts](./tapErr.ts) |

## Contract notes

- Throw policy matches the former `promise-result` lift family; see [behavior-modes.md §4.6.1](../../docs/behavior-modes.md#461-bridge-result-srcbridge-result).
- `bind` / `match` / `orElse` propagate synchronous handler throws via Promise rejection; `map` / `bindThrough` / `tap` / `tapErr` capture to `Err`.

## Related

- [`promise-result`](../promise-result/README.md) — eager operators on `Promise<IResultOfT>`.
- [`operators`](../operators/README.md) — sync operators on `IResultOfT`.
