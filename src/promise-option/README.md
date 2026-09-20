# promise-option

`@sandlada/result/promise-option` — eager operators on `Promise<IOption<T>>`.

## Scope

- Operates on: `Promise<IOption<T>>`; callbacks may be synchronous or asynchronous depending on the operator.
- Execution model: **eager** — the chain starts on the call and the returned Promise is already in flight.
- Not here: sync Option operators (`option`), lazy thunks (`async-option`), Result variants (`promise-result`).

## API

### Constructors (re-exported)

| Export | Description | Source |
| --- | --- | --- |
| `asyncOk` / `asyncErr` | Pre-resolved Result Promises from `factories`. | [../factories/asyncOk.ts](../factories/asyncOk.ts), [../factories/asyncErr.ts](../factories/asyncErr.ts) |
| `ofSome` / `ofNone` | Sync Option constructors from `option`. | [../option/ofSome.ts](../option/ofSome.ts), [../option/ofNone.ts](../option/ofNone.ts) |

### Operators on `Promise<IOption>`

| Export | Description | Source |
| --- | --- | --- |
| `mapAsyncOption` | Transforms the `Some` value with an async callback. | [mapAsyncOption.ts](./mapAsyncOption.ts) |
| `bindAsyncOption` | Async chain returning the next Option. | [bindAsyncOption.ts](./bindAsyncOption.ts) |
| `orElseAsyncOption` | Async fallback on `None`. | [orElseAsyncOption.ts](./orElseAsyncOption.ts) |
| `matchAsyncOption` | Async terminal pattern match. | [matchAsyncOption.ts](./matchAsyncOption.ts) |
| `mapOrAsyncOption` / `mapOrElseAsyncOption` | Map the `Some` value or fall back asynchronously. | [mapOrAsyncOption.ts](./mapOrAsyncOption.ts), [mapOrElseAsyncOption.ts](./mapOrElseAsyncOption.ts) |
| `tapAsyncOption` / `tapErrAsyncOption` | Async side effects. | [tapAsyncOption.ts](./tapAsyncOption.ts), [tapErrAsyncOption.ts](./tapErrAsyncOption.ts) |
| `unwrapOrAsyncOption` / `unwrapOrElseAsyncOption` | Extract the value or an async default. | [unwrapOrAsyncOption.ts](./unwrapOrAsyncOption.ts), [unwrapOrElseAsyncOption.ts](./unwrapOrElseAsyncOption.ts) |
| `containsAsyncOption` / `existsAsyncOption` / `filterAsyncOption` | Async predicate queries. | [containsAsyncOption.ts](./containsAsyncOption.ts), [existsAsyncOption.ts](./existsAsyncOption.ts), [filterAsyncOption.ts](./filterAsyncOption.ts) |
| `flattenAsyncOption` | Flattens `Promise<IOption<IOption<T>>>`. | [flattenAsyncOption.ts](./flattenAsyncOption.ts) |

### Lift sync `IOption` → async

| Export | Description | Source |
| --- | --- | --- |
| `asyncMapOption` | Async map on a sync `IOption`. | [asyncMapOption.ts](./asyncMapOption.ts) |
| `asyncBindOption` | Async chain on a sync `IOption`. | [asyncBindOption.ts](./asyncBindOption.ts) |
| `asyncOrElseOption` | Async fallback on a sync `IOption`. | [asyncOrElseOption.ts](./asyncOrElseOption.ts) |
| `asyncMatchOption` | Async terminal match on a sync `IOption`. | [asyncMatchOption.ts](./asyncMatchOption.ts) |
| `asyncTapOption` | Async side effect on a sync `IOption`. | [asyncTapOption.ts](./asyncTapOption.ts) |

## Contract notes

- A rejection of the outer `Promise` itself always stays a rejection; it is never converted into `None`.
- Callback policy: operators on `Promise<IOption>` collapse a throwing callback or an async rejection into `None` / `false` / the default value; `matchAsyncOption`, `mapOrElseAsyncOption` and `unwrapOrElseAsyncOption` propagate instead. The lifting family (`asyncMapOption`, `asyncBindOption`, `asyncTapOption`, `asyncOrElseOption`) turns a synchronous throw into `None` but lets a rejected Promise propagate. See [behavior-modes.md §4.6](../../docs/behavior-modes.md#46-eager-async-srcpromise-result-srcpromise-option).
- This layer has no `unwrap` / `expect` / `orThrow`; extraction goes through the `unwrapOr*` family.
- There are no combination APIs here; combine Options with the sync [`option/all`](../option/all.ts) before lifting when needed.
- Naming: the `AsyncOption` suffix marks operators that consume a `Promise<IOption>`; the `async*Option` prefix marks the lift family that consumes a synchronous `IOption`.

## Design notes

- **Eager and lazy async are separate modules.** `promise-option` mirrors `promise-result` on the Option track, while `async-option` provides the lazy thunk counterpart.

## Related

- [`option`](../option/README.md) — the synchronous operator set.
- [`async-option`](../async-option/README.md) — the lazy thunk counterpart.
- [`promise-result`](../promise-result/README.md) — the same shape on the Result track.
