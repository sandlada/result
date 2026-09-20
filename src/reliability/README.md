# reliability

`@sandlada/result/reliability` — retry, timeout and concurrency primitives for production pipelines.

## Scope

- Operates on: `AsyncResult` thunks (plus one eager retry entry point). This is the only async layer that **never rejects**.
- Execution model: `retry` and `timeoutEager` are eager; `retryLazy`, `timeout`, `race`, `any` and `allSettled` are lazy and run on `.run()`.
- Not here: general async operators (`async-result`, `promise-result`).

## API

### Retry

| Export | Description | Source |
| --- | --- | --- |
| `retry` | Eager bounded retry; resolves `IResultOfT<T, E \| TE \| AE>` and never rejects. | [retry.ts](./retry.ts) |
| `retryLazy` | Lazy thunk wrap of `retry` with the same error contract. | [retryLazy.ts](./retryLazy.ts) |
| `RetryOptions` (type) | `times`, `delayMs`, `shouldRetry`, `onRetry`, `signal`, `onThrow`, `onAborted`. | [retry.ts](./retry.ts) |
| `ThrownError` (type) | Default `TE` — `{ kind: 'Thrown', thrown }`, preserving the thrown value verbatim. | [retry.ts](./retry.ts) |
| `AbortedError` (type) | Default `AE` — `{ kind: 'Aborted', reason, times }` when the loop never runs `fn`. | [retry.ts](./retry.ts) |

### Timeout

| Export | Description | Source |
| --- | --- | --- |
| `timeout` | Lazily races an AsyncResult against `setTimeout`; the default error is `{ kind: 'Timeout', ms }`. | [timeout.ts](./timeout.ts) |
| `timeoutEager` | Eager counterpart of `timeout`. | [timeoutEager.ts](./timeoutEager.ts) |
| `TimeoutError` (type) | Default timeout error shape; replace it through `onTimeout`. | [timeout.ts](./timeout.ts) |

### Concurrency

| Export | Description | Source |
| --- | --- | --- |
| `race` | First `Ok` wins; if all fail, the lowest input index wins; an empty array becomes `Err(EmptyInputsError)` unless `onEmpty` overrides it. | [race.ts](./race.ts) |
| `EmptyInputsError` (type) | Default error for an empty `race` input. | [race.ts](./race.ts) |
| `any` | Runs everything; returns all successes, or all errors when none succeed (rejections tagged `{ kind: 'Rejected' }`). | [any.ts](./any.ts) |
| `allSettled` | Always `Ok`: every thunk's outcome in input order. | [allSettled.ts](./allSettled.ts) |
| `Settled` (type) | Per-thunk outcome: `{ ok: true, value }`, `{ ok: false, error }` or `{ ok: false, kind: 'Rejected', error }`. | [allSettled.ts](./allSettled.ts) |

## Contract notes

- **NeverRejects**: synchronous throws, async rejections and throwing hooks are all collapsed into `Err`. This is a stronger guarantee than the `promise-*` / `async-*` layers.
- `retry` keeps error channels additive: `E` from your `fn`, `TE` when something throws (`ThrownError` by default), `AE` when the loop never runs `fn` (`AbortedError` by default). Supply `onThrow` / `onAborted` to fold them into your own `E`.
- A timeout cannot cancel the inner operation: after `Err(onTimeout(ms))` the inner `run()` keeps executing and its settlement is discarded.
- `race` policy: the first `Ok` wins regardless of order; among errors the lowest input index wins; a genuine `Err` outranks a Promise rejection. A statically non-empty array keeps error type `E`; a dynamically-sized array widens to `E \| EE`.
- See [behavior-modes.md §4.8](../../docs/behavior-modes.md#48-reliability-srcreliability) for the per-export table.

## Related

- [`async-result`](../async-result/README.md) — the carrier all wrappers consume or return.
- [`primitives`](../primitives/README.md) — `sequenceAsyncResult` for ordered batch execution.
