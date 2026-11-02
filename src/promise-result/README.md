# promise-result

`@sandlada/result/promise-result` — eager operators on `Promise<IResultOfT<T, E>>`.

## Scope

- Operates on: `Promise<IResultOfT<T, E>>`; callbacks may be synchronous or asynchronous depending on the operator.
- Execution model: **eager** — the chain starts on the call and the returned Promise is already in flight.
- Not here: lazy thunks (`async-result`), Result construction (`factories`), synchronous operators (`operators`).

## API

### Constructors (re-exported from `factories`)

| Export | Description | Source |
| --- | --- | --- |
| `asyncOk` | Pre-resolved success Promise. | [../factories/asyncOk.ts](../factories/asyncOk.ts) |
| `asyncErr` | Pre-resolved failure Promise. | [../factories/asyncErr.ts](../factories/asyncErr.ts) |

### Synchronous-callback operators

| Export | Description | Source |
| --- | --- | --- |
| `map` / `mapErr` | Transform the success value / error with a sync callback. | [map.ts](./map.ts), [mapErr.ts](./mapErr.ts) |
| `flatten` | Flattens a nested `Promise<IResultOfT>`. | [flatten.ts](./flatten.ts) |
| `unwrapOr` / `unwrapOrElse` | Extract the value or fall back to a sync default. | [unwrapOr.ts](./unwrapOr.ts), [unwrapOrElse.ts](./unwrapOrElse.ts) |

### Asynchronous-callback operators

| Export | Description | Source |
| --- | --- | --- |
| `mapAsync` / `mapErrAsync` | Transform the success value / error with an async callback. | [mapAsync.ts](./mapAsync.ts), [mapErrAsync.ts](./mapErrAsync.ts) |
| `mapOrAsync` / `mapOrElseAsync` | Map the success value or fall back asynchronously. | [mapOrAsync.ts](./mapOrAsync.ts), [mapOrElseAsync.ts](./mapOrElseAsync.ts) |
| `bindAsync` / `orElseAsync` | Async monadic chain / recovery. | [bindAsync.ts](./bindAsync.ts), [orElseAsync.ts](./orElseAsync.ts) |
| `bindThroughAsync` | Async chained step that keeps the original success value. | [bindThroughAsync.ts](./bindThroughAsync.ts) |
| `matchAsync` | Async terminal pattern match. | [matchAsync.ts](./matchAsync.ts) |
| `tapAsync` / `tapErrAsync` | Async side effects on success / failure. | [tapAsync.ts](./tapAsync.ts), [tapErrAsync.ts](./tapErrAsync.ts) |
| `unwrapOrAsync` / `unwrapOrElseAsync` | Extract the value or an async default; resolves to the bare value `Promise<A>`. | [unwrapOrAsync.ts](./unwrapOrAsync.ts), [unwrapOrElseAsync.ts](./unwrapOrElseAsync.ts) |
| `bimapAsync` / `swapAsync` / `flattenAsync` | Async variant transforms. | [bimapAsync.ts](./bimapAsync.ts), [swapAsync.ts](./swapAsync.ts), [flattenAsync.ts](./flattenAsync.ts) |
| `containsAsync` / `existsAsync` / `filterOrElseAsync` | Async predicate queries. | [containsAsync.ts](./containsAsync.ts), [existsAsync.ts](./existsAsync.ts), [filterOrElseAsync.ts](./filterOrElseAsync.ts) |
| `catchErrAsync` | Recovery that lifts `onErr(error)` into `Ok`. | [catchErrAsync.ts](./catchErrAsync.ts) |

### Lift sync `IResultOfT` → async

| Export | Description | Source |
| --- | --- | --- |
| `asyncMap` / `asyncBind` / `asyncBindThrough` | **Deprecated re-exports** — use `@sandlada/result/bridge-result`. | [../bridge-result/README.md](../bridge-result/README.md) |
| `asyncMatch` / `asyncOrElse` / `asyncTap` / `asyncTapErr` | Same bridge; re-exported here until Phase 5 removal. | [../bridge-result/README.md](../bridge-result/README.md) |

### Applicative and combination

| Export | Description | Source |
| --- | --- | --- |
| `ap` | Applies a wrapped function to a wrapped value; a throwing applied function becomes `Err`. | [ap.ts](./ap.ts) |
| `combine` | Combines many Promises, selecting the first `Err` in input order. | [combine.ts](./combine.ts) |
| `combineWithAllErrors` | Combines many Promises, accumulating every error. | [combineWithAllErrors.ts](./combineWithAllErrors.ts) |

## Contract notes

- A rejection of the outer `Promise` itself always stays a rejection; it is never converted into `Err`.
- Callback policy is split: the `map` / `tap` / `bimapAsync` / `*BindThrough` families capture to values, the `bind` / `match` / `catchErrAsync` families propagate; `mapOrAsync` captures and returns the default. `ap` captures a throwing applied function as `Err` while a rejection of either operand stays a rejection. `map` throws an `Error` pointing at `mapAsync` when its sync mapper returns a thenable. See [behavior-modes.md §4.6](../../docs/behavior-modes.md#46-eager-async-srcpromise-result-srcpromise-option).
- This layer has no `unwrap` / `expect` / `orThrow`; extraction goes through the `unwrapOr*` family, whose async rejections travel on the outer rejection channel.
- `unwrapOrAsync` / `unwrapOrElseAsync` resolve to the bare value (`Promise<A>`), not to a Result.
- `combine` / `combineWithAllErrors` start every input Promise immediately; short-circuiting affects only which result is selected.
- Naming: a `*Async` suffix marks an async callback on `Promise<IResultOfT>`; an `async*` prefix marks the lift family that consumes a synchronous `IResultOfT`.

## Design notes

- **Eager and lazy async are separate modules.** `promise-result` works on Promises that are already in flight, while `async-result` wraps thunks; keeping the two apart avoids conflating two execution models.

## Related

- [`async-result`](../async-result/README.md) — the lazy thunk counterpart.
- [`promise-option`](../promise-option/README.md) — the same shape for `Promise<IOption>`.
- [`composition`](../composition/README.md) — `pipeAsync` for mixed Promise chains.
