# async-option

`@sandlada/result/async-option` — operators on the lazy `AsyncOption<T>` thunk.

## Scope

- Operates on: `AsyncOption<T>` — a plain object `{ readonly run: () => Promise<IOption<T>> }`.
- Execution model: **lazy** — middleware returns a new thunk without running anything; terminals such as `match` / `unwrap` / `unwrapOr` return a Promise and call `run()` immediately.
- Not here: eager Promises (`promise-option`), sync operators (`option`), Result carriers (`async-result`).

## API

### Constructors

| Export | Description | Source |
| --- | --- | --- |
| `from` | Wraps a thunk returning an Option (or a plain Option) into an AsyncOption. | [from.ts](./from.ts) |
| `fromPromise` | Wraps a thunk returning `Promise<IOption>`; a throw or rejection becomes `None`. | [fromPromise.ts](./fromPromise.ts) |
| `fromOption` | Lifts a synchronous `IOption` into an AsyncOption. | [fromOption.ts](./fromOption.ts) |
| `ofSome` / `ofNone` | Direct `Some` / `None` constructors. | [ofSome.ts](./ofSome.ts), [ofNone.ts](./ofNone.ts) |

### Transform

| Export | Description | Source |
| --- | --- | --- |
| `map` / `mapAsync` | Transform the `Some` value with a sync / async callback. | [map.ts](./map.ts), [mapAsync.ts](./mapAsync.ts) |
| `mapOr` / `mapOrElse` | Map the `Some` value or fall back. | [mapOr.ts](./mapOr.ts), [mapOrElse.ts](./mapOrElse.ts) |
| `filter` | Turns `Some` into `None` when the predicate fails. | [filter.ts](./filter.ts) |
| `flatten` | Flattens a nested `AsyncOption`. | [flatten.ts](./flatten.ts) |
| `transpose` | Swaps `AsyncOption<AsyncResult>` and `AsyncResult<AsyncOption>`. | [transpose.ts](./transpose.ts) |

### Chain and recover

| Export | Description | Source |
| --- | --- | --- |
| `bind` | Monadic chain: the callback returns the next AsyncOption. | [bind.ts](./bind.ts) |
| `orElse` | Fallback on `None`. | [orElse.ts](./orElse.ts) |

### Side effects

| Export | Description | Source |
| --- | --- | --- |
| `tap` / `tapAsync` | Side effects on `Some`. | [tap.ts](./tap.ts), [tapAsync.ts](./tapAsync.ts) |

### Queries

| Export | Description | Source |
| --- | --- | --- |
| `contains` | Equality check against the `Some` value. | [contains.ts](./contains.ts) |
| `exists` | Predicate check on the `Some` value. | [exists.ts](./exists.ts) |
| `isSome` / `isNone` | Standalone boolean predicates. | [isSome.ts](./isSome.ts), [isNone.ts](./isNone.ts) |

### Combination

| Export | Description | Source |
| --- | --- | --- |
| `all` | Combines many AsyncOptions; an empty array is `Some([])`. | [all.ts](./all.ts) |
| `zipWith` | Combines N≥2 AsyncOptions with a function (explicit arities 2–10, mapped type beyond). | [zipWith.ts](./zipWith.ts) |

### Bridge to AsyncResult

| Export | Description | Source |
| --- | --- | --- |
| `okOr` / `okOrElse` | `Some` becomes `Ok`; `None` becomes `Err(error)` / `Err(errorFn())`. | [okOr.ts](./okOr.ts), [okOrElse.ts](./okOrElse.ts) |

### Terminals

| Export | Description | Source |
| --- | --- | --- |
| `match` | Pattern match over `Some` / `None`; triggers `run()`. | [match.ts](./match.ts) |
| `unwrap` | Terminal contract panic; the only panic API in this module. | [unwrap.ts](./unwrap.ts) |
| `unwrapOr` / `unwrapOrElse` | Extract the value or fall back; triggers `run()`. | [unwrapOr.ts](./unwrapOr.ts), [unwrapOrElse.ts](./unwrapOrElse.ts) |

## Contract notes

- Nothing runs until a terminal calls `run()`; middleware returns a new thunk.
- `mapAsync` captures fully here, the opposite of `async-result/mapAsync`: a sync throw or rejected Promise becomes `None`. `match`, `mapOrElse`, `unwrapOrElse`, `exists` and `zipWith` propagate instead. See [behavior-modes.md §4.7](../../docs/behavior-modes.md#47-lazy-async-srcasync-result-srcasync-option).
- `all` starts every carrier through `Promise.all` once `run()` is called; any `None` selects `None`, but every side effect still happens.
- `zipWith` resolves to `None` when any argument is `None`.
- The module has only `unwrap` as a panic API; there is no `expect` or `orThrow`. Bridge to AsyncResult with `okOr` / `okOrElse` when a typed throw is required.
- Naming: the `async` prefix denotes the `AsyncOption` type, not the `async`/`await` keyword.

## Design notes

- **Eager and lazy async are separate modules.** `async-option` mirrors `async-result` on the Option track, while `promise-option` operates on Promises already in flight.

## Related

- [`async-result`](../async-result/README.md) — the Result-flavored thunk, bridged via `okOr` / `transpose`.
- [`option`](../option/README.md) — the synchronous operator set.
- [`promise-option`](../promise-option/README.md) — the eager counterpart.
