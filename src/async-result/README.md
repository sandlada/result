# async-result

`@sandlada/result/async-result` — operators on the lazy `AsyncResult<T, E>` thunk.

## Scope

- Operates on: `AsyncResult<T, E>` — a plain object `{ readonly run: () => Promise<IResultOfT<T, E>> }`.
- Execution model: **lazy** — middleware returns a new thunk without running anything; terminals such as `match` / `unwrap` / `unwrapOr` return a Promise and call `run()` immediately.
- Not here: eager Promises (`promise-result`), synchronous operators (`operators`), reliability wrappers (`reliability`).

## API

### Constructors

| Export | Description | Source |
| --- | --- | --- |
| `from` | Wraps a thunk returning a Result (or a plain Result) into an AsyncResult. | [from.ts](./from.ts) |
| `fromPromise` | Wraps a thunk returning a Promise; the thunk's throw or the Promise's rejection becomes `Err`. | [fromPromise.ts](./fromPromise.ts) |
| `fromResult` | Lifts a synchronous `IResultOfT` into an AsyncResult. | [fromResult.ts](./fromResult.ts) |

### Transform

| Export | Description | Source |
| --- | --- | --- |
| `map` / `mapAsync` | Transform the success value with a sync / async callback. | [map.ts](./map.ts), [mapAsync.ts](./mapAsync.ts) |
| `mapErr` / `mapErrAsync` | Transform the error with a sync / async callback. | [mapErr.ts](./mapErr.ts), [mapErrAsync.ts](./mapErrAsync.ts) |
| `bimap` | Transforms both variants in one pass. | [bimap.ts](./bimap.ts) |
| `flatten` | Flattens a nested `AsyncResult`. | [flatten.ts](./flatten.ts) |
| `swapAsync` | Swaps the `Ok` and `Err` tracks. | [swapAsync.ts](./swapAsync.ts) |

### Chain, recover and fall back

| Export | Description | Source |
| --- | --- | --- |
| `bind` | Monadic chain: the callback returns the next AsyncResult. | [bind.ts](./bind.ts) |
| `orElse` | Recovery on failure. | [orElse.ts](./orElse.ts) |
| `and` / `or` | Picks the second AsyncResult on success / failure, lazily. | [and.ts](./and.ts), [or.ts](./or.ts) |
| `ap` | Applies a wrapped function to a wrapped value. | [ap.ts](./ap.ts) |
| `filterOrElse` | Keeps the success value when the predicate passes, otherwise maps it to an error. | [filterOrElse.ts](./filterOrElse.ts) |
| `catchErr` | Recovery that lifts `onErr(error)` into `Ok`. | [catchErr.ts](./catchErr.ts) |
| `mapOr` / `mapOrElse` | Map the success value or fall back. | [mapOr.ts](./mapOr.ts), [mapOrElse.ts](./mapOrElse.ts) |

### Side effects

| Export | Description | Source |
| --- | --- | --- |
| `tap` / `tapAsync` | Side effects on success. | [tap.ts](./tap.ts), [tapAsync.ts](./tapAsync.ts) |
| `tapErr` / `tapErrAsync` | Side effects on failure. | [tapErr.ts](./tapErr.ts), [tapErrAsync.ts](./tapErrAsync.ts) |
| `andTee` / `orTee` | Run a side effect and ignore its result. | [andTee.ts](./andTee.ts), [orTee.ts](./orTee.ts) |
| `andThrough` | Chained step that keeps the original success value. | [andThrough.ts](./andThrough.ts) |

### Queries

| Export | Description | Source |
| --- | --- | --- |
| `contains` / `containsErr` | Equality checks against the success value / error. | [contains.ts](./contains.ts), [containsErr.ts](./containsErr.ts) |
| `exists` | Predicate check on the success value. | [exists.ts](./exists.ts) |
| `isOk` / `isErr` | Standalone boolean predicates. | [isOk.ts](./isOk.ts), [isErr.ts](./isErr.ts) |

### Combination

| Export | Description | Source |
| --- | --- | --- |
| `combine` | Combines many AsyncResults, selecting the first `Err`. | [combine.ts](./combine.ts) |
| `combineWithAllErrors` | Combines many AsyncResults, accumulating every error. | [combineWithAllErrors.ts](./combineWithAllErrors.ts) |

### Terminals

| Export | Description | Source |
| --- | --- | --- |
| `match` | Exhaustive pattern match; triggers `run()`. | [match.ts](./match.ts) |
| `unwrap` / `unwrapErr` / `expect` / `expectErr` | Terminal contract panics; `cause` keeps the original `E`. | [unwrap.ts](./unwrap.ts), [unwrapErr.ts](./unwrapErr.ts), [expect.ts](./expect.ts), [expectErr.ts](./expectErr.ts) |
| `unwrapOr` / `unwrapOrElse` | Extract the value or fall back; triggers `run()`. | [unwrapOr.ts](./unwrapOr.ts), [unwrapOrElse.ts](./unwrapOrElse.ts) |

## Contract notes

- Nothing runs until a terminal calls `run()`; middleware returns a new thunk. Each `run()` invocation re-executes the chain.
- `mapAsync` propagates directly — the only capture-policy counterexample in this module; everything else in the `map` / `tap` / `bind` / `catchErr` families collapses throws and rejections into `Err`. See [behavior-modes.md §4.7](../../docs/behavior-modes.md#47-lazy-async-srcasync-result-srcasync-option).
- `combine`, `combineWithAllErrors` and the sibling `async-option/all` start every carrier through `Promise.all` once `run()` is called; short-circuiting affects only result selection, not execution.
- Terminal panics (`unwrap` / `expect`) throw a `TypeError` and keep the original error in `cause`.
- Naming: the `async` prefix denotes the `AsyncResult` type, not the `async`/`await` keyword; `mapAsync` / `tapAsync` are the async-callback variants.

## Design notes

- **Eager and lazy async are separate modules.** `async-result` defers execution behind `run()`, while `promise-result` operates on Promises already in flight; the two execution models are never mixed in one API.

## Related

- [`promise-result`](../promise-result/README.md) — the eager counterpart.
- [`reliability`](../reliability/README.md) — `retryLazy`, `timeout`, `race`, `any`, `allSettled` all operate on AsyncResult.
- [`async-option`](../async-option/README.md) — the Option-flavored thunk, bridged via `okOr` / `transpose`.
