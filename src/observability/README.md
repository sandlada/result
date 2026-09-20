# observability

`@sandlada/result/observability` — breadcrumb context, formatters and process-wide observer hooks.

## Scope

- Operates on: `IResultOfT` / `IOption` values and the surrounding async scope.
- Execution model: synchronous, with a per-scope frame stack backed by `AsyncLocalStorage` (falling back to a polyfill).
- Not here: logging destinations or reporters — hooks are seam points, not implementations.

## API

### Context

| Export | Description | Source |
| --- | --- | --- |
| `ctx` | Opens a fresh breadcrumb frame around `fn`; frames chain across nested scopes and are isolated across `await`. | [ctx.ts](./ctx.ts) |
| `getPath` | Snapshots the current path (outer segments first); returns `[]` outside any scope. | [ctx.ts](./ctx.ts) |
| `withPath` | Pushes a segment inside `ctx.run`; a no-op outside a scope. | [withPath.ts](./withPath.ts) |
| `tapErrContext` | On failure, invokes `fn(error, { path })`. | [tapErrContext.ts](./tapErrContext.ts) |
| `PathSegment` (type) | `string \| number` — a single breadcrumb segment. | [ctx.ts](./ctx.ts) |
| `PathStack` (type) | Read-only snapshot of the breadcrumb stack. | [ctx.ts](./ctx.ts) |
| `ErrContext` (type) | The `{ path }` argument passed to `tapErrContext`. | [tapErrContext.ts](./tapErrContext.ts) |

### Formatting

| Export | Description | Source |
| --- | --- | --- |
| `format` | Human-readable `Ok(...)` / `Err(...)` rendering. | [format.ts](./format.ts) |
| `inspect` | Structured `{ kind, value \| error }` view. | [inspect.ts](./inspect.ts) |
| `FormatOptions` (type) | Options accepted by `format`. | [format.ts](./format.ts) |
| `Inspected` (type) | Return shape of `inspect`. | [inspect.ts](./inspect.ts) |

### Observers

| Export | Description | Source |
| --- | --- | --- |
| `observe` | Pass-through hook that fires the installed observer with the result and current path. | [observe.ts](./observe.ts) |
| `installObserver` | Installs a process-wide observer (or clears with `null`) and returns a LIFO disposer. | [observe.ts](./observe.ts) |
| `getActiveObserver` | Returns the currently active observer or `null`. | [observe.ts](./observe.ts) |
| `Observer` (type) | Observer callback signature. | [observe.ts](./observe.ts) |
| `ObserveEvent` (type) | `{ kind: 'ok' \| 'err', result, path }` passed to observers. | [observe.ts](./observe.ts) |

## Contract notes

- `ctx.run` opens an independent frame per scope: concurrent scopes never observe each other's segments. Without a real `AsyncLocalStorage` (browser bundles without a polyfill), the fallback is correct for synchronous code and degrades to a thread-local pointer under concurrent async flow.
- Observer errors from `observe` / `installObserver` / `tapErrContext` are always swallowed and never change the main flow; `installObserver` accepts an optional `onObserverError` audit hook whose own failures are swallowed too.
- `format` and `inspect` never throw.
- Throw policy: [behavior-modes.md §4.9](../../docs/behavior-modes.md#49-observability-srcobservability).

## Related

- [`operators`](../operators/README.md) — where `tap` / `tapErr` side effects usually live.
- [`async-result`](../async-result/README.md) — `observe` works on any Result value, including after `run()`.
