# promise-option

`@sandlada/result/promise-option` — eager operators on `Promise<IOption<T>>`.

## Scope

- Operates on: `Promise<IOption<T>>`; callbacks may be synchronous or asynchronous depending on the operator.
- Execution model: **eager** — the chain starts on the call and the returned Promise is already in flight.
- Not here: sync Option operators (`option`), sync-to-async lift (`bridge-option`), lazy thunks (`async-option`), Result variants (`promise-result`).

## API

### Operators on `Promise<IOption>`

| Export | Description | Source |
| --- | --- | --- |
| `mapAsync` | Transforms the `Some` value with an async callback. | [mapAsync.ts](./mapAsync.ts) |
| `bindAsync` | Async chain returning the next Option. | [bindAsync.ts](./bindAsync.ts) |
| `orElseAsync` | Async fallback on `None`. | [orElseAsync.ts](./orElseAsync.ts) |
| `matchAsync` | Async terminal pattern match. | [matchAsync.ts](./matchAsync.ts) |
| `mapOrAsync` / `mapOrElseAsync` | Map the `Some` value or fall back asynchronously. | [mapOrAsync.ts](./mapOrAsync.ts), [mapOrElseAsync.ts](./mapOrElseAsync.ts) |
| `tapAsync` / `tapErrAsync` | Async side effects; `tapErrAsync` observes the Some track with `fn` and the None track with `fnNone`. | [tapAsync.ts](./tapAsync.ts), [tapErrAsync.ts](./tapErrAsync.ts) |
| `unwrapOrAsync` / `unwrapOrElseAsync` | Extract the value or an async default. | [unwrapOrAsync.ts](./unwrapOrAsync.ts), [unwrapOrElseAsync.ts](./unwrapOrElseAsync.ts) |
| `containsAsync` / `existsAsync` / `filterAsync` | Async predicate queries. | [containsAsync.ts](./containsAsync.ts), [existsAsync.ts](./existsAsync.ts), [filterAsync.ts](./filterAsync.ts) |
| `flattenAsync` | Flattens `Promise<IOption<IOption<T>>>`. | [flattenAsync.ts](./flattenAsync.ts) |

## Contract notes

- A rejection of the outer `Promise` itself always stays a rejection; it is never converted into `None`.
- Callback policy: operators on `Promise<IOption>` collapse a throwing callback or an async rejection into `None` / `false` / the default value; `matchAsync`, `mapOrElseAsync` and `unwrapOrElseAsync` propagate instead. Sync `IOption` lifts are documented under [`bridge-option`](../bridge-option/README.md). See [behavior-modes.md §4.6](../../docs/behavior-modes.md#46-eager-async-srcpromise-result-srcpromise-option).
- This layer has no `unwrap` / `expect` / `orThrow`; extraction goes through the `unwrapOr*` family.
- There are no combination APIs here; combine Options with the sync [`option/all`](../option/all.ts) before lifting when needed.
- Naming mirrors `promise-result`: `*Async` on `Promise<IOption>`. Sync lifts use [`bridge-option`](../bridge-option/README.md).

## Design notes

- **Eager and lazy async are separate modules.** `promise-option` mirrors `promise-result` on the Option track, while `async-option` provides the lazy thunk counterpart.

## Related

- [`bridge-option`](../bridge-option/README.md) — lift sync `IOption` into `Promise<IOption>`.
- [`option`](../option/README.md) — synchronous Option operators.
- [`promise-result`](../promise-result/README.md) — the Result-track mirror.
