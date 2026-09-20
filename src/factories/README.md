# factories

`@sandlada/result/factories` — constructors that turn values, predicates, throws and Promises into Results.

## Scope

- Operates on: `IResultOfT` construction (sync) and `Promise<IResultOfT>` construction (eager).
- Execution model: synchronous; `fromPromise`, `fromSafePromise`, `tryCatchAsync`, `asyncOk` and `asyncErr` return in-flight Promises.
- Not here: transformations (`operators`, `promise-result`), Option constructors (`option`).

## API

### Synchronous constructors

| Export | Description | Source |
| --- | --- | --- |
| `ok` | Success without a value (`IResult<never>`) or with `value` (`IResultOfT<T, never>`); the error channel starts as `never` so it widens at the use site. | [ok.ts](./ok.ts) |
| `err` | Failure carrying `error`; the error type is inferred from the argument and the value channel starts as `never`. | [err.ts](./err.ts) |
| `fromPredicate` | `Ok(value)` when the predicate passes, otherwise `Err(error)`. | [fromPredicate.ts](./fromPredicate.ts) |
| `fromThrowable` | Wraps a possibly-throwing function into a Result-returning one. | [fromThrowable.ts](./fromThrowable.ts) |
| `tryCatch` | Runs a thunk and captures a synchronous throw as `Err`. | [tryCatch.ts](./tryCatch.ts) |

### Eager async constructors

| Export | Description | Source |
| --- | --- | --- |
| `asyncOk` | Pre-resolved success `Promise<IResultOfT<T, never>>`. | [asyncOk.ts](./asyncOk.ts) |
| `asyncErr` | Pre-resolved failure `Promise<IResultOfT<never, E>>`. | [asyncErr.ts](./asyncErr.ts) |
| `fromPromise` | Wraps a Promise; a rejection becomes `Err` instead of staying a rejection. | [fromPromise.ts](./fromPromise.ts) |
| `fromSafePromise` | Wraps a Promise that is known never to reject; `E` defaults to `Error`. | [fromSafePromise.ts](./fromSafePromise.ts) |
| `tryCatchAsync` | Runs an async thunk; throws and rejections become `Err`. | [tryCatchAsync.ts](./tryCatchAsync.ts) |

## Contract notes

- `ok` and `err` return the narrowest variant (`IResultOfT<T, never>` / `IResultOfT<never, E>`). Use the dual-parameter overloads `ok<T, E>(value)` / `err<T, E>(error)` to widen without a cast when the surrounding context already declares a wider channel.
- Every capture helper turns throws and rejections into values; none of them rejects.
- `fromSafePromise` normalizes a non-`Error` rejection value to `new Error(String(e))` when no `errorFn` is supplied; pass `errorFn` to keep your own error type.
- Throw policy: [behavior-modes.md §4.1](../../docs/behavior-modes.md#41-factories-srcfactories).

## Design notes

- **Generic `TError`, defaulting to `unknown`.** Constructors never coerce a failure into `Error`: `err` keeps the caller's error type, and `ok` leaves the error channel at `never` until it widens at the use site.

## Related

- [`operators`](../operators/README.md) — transforms the Results these factories build.
- [`promise-result`](../promise-result/README.md) — operates on the eager Promises these factories return.
- [`async-result`](../async-result/README.md) — lazy thunks as an alternative async carrier.
