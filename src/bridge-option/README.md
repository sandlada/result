# bridge-option

`@sandlada/result/bridge-option` — lifts a **sync** `IOption<T>` into `Promise<IOption<…>>` using async callbacks. Input is always a plain Option; output is always a Promise of Option. Same export names as `option/map`, but a different subpath and carrier type.

## Scope

- Operates on: synchronous `IOption<T>`; callbacks return `Promise<…>`.
- Execution model: eager — calling the operator starts the returned Promise immediately.
- Not here: `Promise<IOption>` pipelines (`promise-option`), lazy thunks (`async-option`), or sync operators (`option`).

## API

| Export | Description | Source |
| --- | --- | --- |
| `map` | Async map on a sync Option. | [map.ts](./map.ts) |
| `bind` | Async bind on a sync Option. | [bind.ts](./bind.ts) |
| `match` | Async terminal match on a sync Option. | [match.ts](./match.ts) |
| `orElse` | Async fallback on a sync Option. | [orElse.ts](./orElse.ts) |
| `tap` | Async side effect when Some. | [tap.ts](./tap.ts) |

## Contract notes

- Promotion family: a synchronous throw becomes `None`; an async rejection propagates. See [behavior-modes.md §4.6.1](../../docs/behavior-modes.md#461-bridge-result-srcbridge-result).
- `match` propagates handler throws like `promise-option/matchAsyncOption`.

## Related

- [`promise-option`](../promise-option/README.md) — eager operators on `Promise<IOption>`.
- [`option`](../option/README.md) — sync operators on `IOption`.
