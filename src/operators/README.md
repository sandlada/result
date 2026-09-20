# operators

`@sandlada/result/operators` — data-last curried operators on synchronous `IResultOfT`.

## Scope

- Operates on: `IResultOfT<T, E>`.
- Execution model: synchronous; every operator returns a new Result or a plain value.
- Not here: Option operators (`option`), eager async (`promise-result`), lazy thunks (`async-result`).

## API

### Transform

| Export | Description | Source |
| --- | --- | --- |
| `map` | Transforms the success value. | [map.ts](./map.ts) |
| `mapErr` | Transforms the error. | [mapErr.ts](./mapErr.ts) |
| `bimap` | Transforms both variants in one pass. | [bimap.ts](./bimap.ts) |
| `swap` | Swaps `Ok` and `Err`. | [swap.ts](./swap.ts) |
| `flatten` | Flattens a nested `IResultOfT<IResultOfT<T, E>, E>`. | [flatten.ts](./flatten.ts) |
| `filterOrElse` | Keeps the success value when the predicate passes, otherwise maps it to an error. | [filterOrElse.ts](./filterOrElse.ts) |

### Chain and recover

| Export | Description | Source |
| --- | --- | --- |
| `bind` | Monadic chain: the callback returns the next Result. | [bind.ts](./bind.ts) |
| `orElse` | Recovery: the callback returns a replacement Result on failure. | [orElse.ts](./orElse.ts) |
| `catchErr` | Lifts `onErr(error)` straight into `Ok`, widening the value channel to `A \| B`. | [catchErr.ts](./catchErr.ts) |
| `and` / `or` | Picks the second Result on success / failure. | [and.ts](./and.ts), [or.ts](./or.ts) |

### Query and collect

| Export | Description | Source |
| --- | --- | --- |
| `contains` | Equality check against the success value. | [contains.ts](./contains.ts) |
| `exists` | Predicate check on the success value. | [exists.ts](./exists.ts) |
| `separate` | Partitions a list of Results into `{ ok, err }` arrays. | [separate.ts](./separate.ts) |
| `traverseArray` | Maps an array with a Result-returning function; fails fast on the first `Err`. | [traverseArray.ts](./traverseArray.ts) |
| `choose` | Maps an array and keeps the success values, skipping `Err`s and continuing. | [choose.ts](./choose.ts) |
| `unzip` | Turns `IResultOfT<readonly [A, B], E>` into `[IResultOfT<A, E>, IResultOfT<B, E>]`. | [unzip.ts](./unzip.ts) |
| `mapOr` / `mapOrElse` | Maps the success value or falls back to a default. | [mapOr.ts](./mapOr.ts), [mapOrElse.ts](./mapOrElse.ts) |
| `ap` | Applies a wrapped function to a wrapped value. | [ap.ts](./ap.ts) |

### Side effects

| Export | Description | Source |
| --- | --- | --- |
| `tap` / `tapErr` | Synchronous side effects on success / failure; the original Result is returned. | [tap.ts](./tap.ts), [tapErr.ts](./tapErr.ts) |
| `andTee` / `orTee` | Runs a side effect and ignores its result. | [andTee.ts](./andTee.ts), [orTee.ts](./orTee.ts) |
| `andThrough` | Runs a chained step but keeps the original success value. | [andThrough.ts](./andThrough.ts) |

### Terminals

| Export | Description | Source |
| --- | --- | --- |
| `match` | Exhaustive pattern match over both variants. | [match.ts](./match.ts) |
| `unwrapOr` / `unwrapOrElse` | Extracts the value, falling back to a default. | [unwrapOr.ts](./unwrapOr.ts), [unwrapOrElse.ts](./unwrapOrElse.ts) |

### Escape hatches

| Export | Description | Source |
| --- | --- | --- |
| `unwrap` / `expect` / `unwrapErr` / `expectErr` | Panic with a `TypeError` on contract violation (`expect*` adds a message). | [unwrap.ts](./unwrap.ts), [expect.ts](./expect.ts), [unwrapErr.ts](./unwrapErr.ts), [expectErr.ts](./expectErr.ts) |
| `unsafeUnwrap` / `unsafeUnwrapErr` | Throws the carried value verbatim, without wrapping. | [unsafeUnwrap.ts](./unsafeUnwrap.ts), [unsafeUnwrapErr.ts](./unsafeUnwrapErr.ts) |
| `orThrow` / `orThrowWith` | Throws a typed error: `orThrow` requires `E extends Error`, `orThrowWith` maps through an error factory first. | [orThrow.ts](./orThrow.ts) |

## Contract notes

- Data-last and curried: `map(fn)(result)`; every operator also accepts the direct form `map(fn, result)`.
- Throw policy is split by family. The `map` family captures a synchronous callback throw into `Err`; the `bind` / `mapErr` / `match` / `catchErr` / `unwrapOrElse` / `mapOr*` / `exists` family propagates directly. `choose` propagates without capturing and never short-circuits; `separate` accumulates into partitions; everything else fails fast (`FailFirst`). See [behavior-modes.md §4.2](../../docs/behavior-modes.md#42-synchronous-operators-srcoperators).
- The escape hatches are three distinct channels: panic (`unwrap` / `expect`), raw throw (`unsafe*`), typed throw (`orThrow*`). Choose one deliberately.
- `catchErr` and `orElse` both recover, but only `catchErr` lifts a plain value into `Ok`; `orElse` expects a new Result.

## Design notes

- **Standalone curried functions, not methods.** Keeping operators off the result objects makes `pipe(...)` composition natural, avoids prototype mutation, and supports dead-code elimination.

## Related

- [`option`](../option/README.md) — the parallel operator set on `IOption`.
- [`adapters`](../adapters/README.md) — bridges between plain functions and Result-returning ones.
- [`composition`](../composition/README.md) — `pipe`, `composeK`, `safeTry`.
