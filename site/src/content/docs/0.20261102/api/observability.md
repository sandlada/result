---
title: "Observability: ctx, withPath, format"
description: "Breadcrumb context and observer hooks for Result pipelines: ctx,
  withPath, tapErrContext, observe, installObserver, format and inspect."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/observability
---

Observability — barrel export.

Re-exports formatters, breadcrumbs, global observer hooks, and structured
error-context plumbing.

## Interfaces

### ErrContext

Defined in: [observability/tapErrContext.ts:28](https://github.com/sandlada/result/blob/main/src/observability/tapErrContext.ts#L28)

Like `tapErr`, but the callback receives both the error and the
current breadcrumb path snapshot. Use to attach structured context when you log
or report a failure.

Always returns `Promise<IResultOfT<T, E>>` so a single signature threads
through pipelines — no `Promise<IResultOfT<T,E>> | IResultOfT<T,E>` union
that forces downstream narrowing. The callback may be sync or async;
the return value is awaited before resolving.

#### Example

```ts
import { ctx, tapErrContext, withPath } from '@sandlada/result/observability';
import { err } from '@sandlada/result/factories';

ctx.run(() => {
  withPath('fetchUser');
  withPath('id:42');
  tapErrContext((error, { path }) => {
    console.log({ event: 'user.fetch.failed', path, error });
  }, err('boom'));
});
```

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-path" /> `path` | `readonly` | [`PathStack`](/0.20261102/api/observability/#pathstack) |

***

### FormatOptions

Defined in: [observability/format.ts:20](https://github.com/sandlada/result/blob/main/src/observability/format.ts#L20)

Human-readable formatting for `IResultOfT`. Useful in logs, error
reporters, and assertions. Falls back to `String(...)` for non-primitive errors.

* `Ok(42)` → `Ok(42)`
* `Err('boom')` → `Err("boom")`
* `Err(new Error('boom'))` → `Err(Error: boom)` (and optionally a stack trace)

#### Example

```ts
import { format } from '@sandlada/result/observability';
import { ok, err } from '@sandlada/result/factories';

console.log(format(ok(42)));           // "Ok(42)"
console.log(format(err('boom')));       // "Err(\"boom\")"
```

#### Properties

| Property | Modifier | Type | Description |
| ------ | ------ | ------ | ------ |
| <a id="property-includestack" /> `includeStack?` | `readonly` | `boolean` | Include `Error.stack` if available. Default `false`. |
| <a id="property-maxdepth" /> `maxDepth?` | `readonly` | `number` | Truncate long values at `maxDepth` recursive levels for object values. Default `3`. |
| <a id="property-quotestrings" /> `quoteStrings?` | `readonly` | `boolean` | Wrap strings in quotes so values with whitespace don't confuse readers. Default `true`. |

***

### ObserveEvent

Defined in: [observability/observe.ts:28](https://github.com/sandlada/result/blob/main/src/observability/observe.ts#L28)

The integration seam between library code and process-wide observers.

`observe(r)` returns the result unchanged — its only side-effect is firing the
currently installed observer (set via [installObserver](/0.20261102/api/observability/#installobserver), off by default).
Use `observe` at meaningful checkpoints (terminal handlers, retry hooks, log
boundaries) to keep the Result pipeline observable without monkey-patching
`unwrap`/`expect`/`orThrow`.

#### Example

```ts
import { observe, installObserver } from '@sandlada/result/observability';
import { pipe } from '@sandlada/result/composition';
import { match } from '@sandlada/result/operators';
import { ok } from '@sandlada/result/factories';

const cancel = installObserver((event) => { console.log(event.kind, event.path); });

const r = pipe(ok(42), observe, match(v => `ok: ${v}`, e => `err: ${e}`));

// When done observing:
cancel();
```

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `E` |

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-kind" /> `kind` | `readonly` | `"ok"` | `"err"` |
| <a id="property-path-1" /> `path` | `readonly` | readonly (`string` | `number`)\[] |
| <a id="property-result" /> `result` | `readonly` | [`IResultOfT`](/0.20261102/api/types/#iresultoft)\<`T`, `E`> |

## Type Aliases

### Inspected

> **Inspected**\<`T`, `E`> = \{ `kind`: `"ok"`; `value`: `T`; } | \{ `error`: `E`; `kind`: `"err"`; }

Defined in: [observability/inspect.ts:18](https://github.com/sandlada/result/blob/main/src/observability/inspect.ts#L18)

Structured inspection — returns a `{kind: 'ok', value}` or
`{kind: 'err', error}` object that is **easier to destructure** than the underlying
discriminated union. Useful for feeding results into logging frameworks, JSON
serialization, or test helpers.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `E` |

#### Example

```ts
import { inspect } from '@sandlada/result/observability';
import { ok, err } from '@sandlada/result/factories';

const summary = inspect(err('boom'));
// { kind: 'err', error: 'boom' }
```

***

### Observer

> **Observer** = (`event`) => `void`

Defined in: [observability/observe.ts:34](https://github.com/sandlada/result/blob/main/src/observability/observe.ts#L34)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`ObserveEvent`](/0.20261102/api/observability/#observeevent)\<`unknown`, `unknown`> |

#### Returns

`void`

***

### PathSegment

> **PathSegment** = `string` | `number`

Defined in: [observability/ctx.ts:73](https://github.com/sandlada/result/blob/main/src/observability/ctx.ts#L73)

Per-async-scope path stack — drives `withPath` breadcrumbs and
[tapErrContext](/0.20261102/api/observability/#taperrcontext) structured logging.

Each `ctx.run(fn)` opens a **fresh frame** with its own `PathSegment[]`.
Frames are stored in Node's `AsyncLocalStorage` (`node:async_hooks`) when
available, so they propagate automatically across `await` boundaries and
remain isolated between concurrent scopes.

**Why this design?** A single process-global mutable stack cannot satisfy
three requirements:

1. **Async-context isolation.** Every `ctx.run` would share the same array.
2. **Concurrent pollution.** `Promise.all([ctx.run(a), ctx.run(b)])` would
   see interleaved segments from both scopes.
3. **Concurrent cleanup corrupting state.** When scope A's `finally` ran
   `stack.length = savedLength`, it could pop segments that scope B was
   actively pushing, leaving holes or out-of-order paths.

Per-scope frames solve all three: each scope has its own stack, cleanup
happens by **dropping the frame** (no global to corrupt), and concurrent
scopes never see each other's segments.

**Runtime requirement**: Node (any version with `node:async_hooks`),
Bun, or Deno. Browser bundles without an `async_hooks` polyfill fall
back to a best-effort thread-local frame pointer that is correct for
synchronous code and degrades to a shared frame pointer under concurrent
async flow.

**Concurrency caveat (polyfill only)**: under the polyfill, concurrent
async scopes may observe each other's segments. To get full isolation in
non-Node runtimes, bundle a real `AsyncLocalStorage` polyfill.

#### Example

```ts
import { ctx, getPath, withPath, tapErrContext } from '@sandlada/result/observability';
import { err } from '@sandlada/result/factories';

await ctx.run(async () => {
  withPath('fetchUser');
  tapErrContext((e, { path }) => { console.log(path, e); }, err('boom'));
});
```

***

### PathStack

> **PathStack** = `ReadonlyArray`\<[`PathSegment`](/0.20261102/api/observability/#pathsegment)>

Defined in: [observability/ctx.ts:76](https://github.com/sandlada/result/blob/main/src/observability/ctx.ts#L76)

Read-only snapshot of the current breadcrumb stack.

## Variables

### ctx

> `const` **ctx**: `object`

Defined in: [observability/ctx.ts:265](https://github.com/sandlada/result/blob/main/src/observability/ctx.ts#L265)

Synchronous + async scope: `ctx.run(fn)` opens a fresh frame chained to
the enclosing scope's frame (if any) and runs `fn` inside it. The frame
is dropped when `fn` returns (sync) or when its returned thenable
settles (async). Concurrent scopes each have independent frame chains
— `getPath()` inside one scope never observes another scope's segments.

#### Type Declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `push()` | (`segment`) => `void` | Append a segment to the current frame's stack. No-op outside any `ctx.run(fn)` scope — the leak warning in `withPath`'s JSDoc still applies. |
| `run()` | (`fn`) => `T` | - |

## Functions

### format()

Render a result as `Ok(...)` / `Err(...)`. Stack traces (when requested)
appear on subsequent lines after the closing parenthesis.

***

```ts
export function format<T, E>(
    r: IResultOfT<T, E>,
    options: FormatOptions = {},
): string;
```

Defined in: [observability/format.ts](https://github.com/sandlada/result/blob/main/src/observability/format.ts)

### getActiveObserver()

Returns the currently active observer or `null`. Mostly exposed for testing.

***

```ts
export const getActiveObserver: () => Observer | null;
```

Defined in: [observability/observe.ts](https://github.com/sandlada/result/blob/main/src/observability/observe.ts)

### getPath()

Snapshot the current path. Walks the frame chain from the innermost
scope outward, concatenating segments so that nested `ctx.run`s see
the full breadcrumb trail (outer segments first, inner last).

Returns an empty array when no scope is active (e.g., called from a
top-level test without `ctx.run`).

***

```ts
export const getPath: () => PathStack;
```

Defined in: [observability/ctx.ts](https://github.com/sandlada/result/blob/main/src/observability/ctx.ts)

### inspect()

Returns a structurally-friendly view of `r` that drops the `isSuccess`/`isFailure`
discriminants in favor of a single `kind` discriminator.

**Caching note**: every call allocates a fresh `{kind, value}` or
`{kind, error}` object. The wrapper itself is **not memoized**, so
`inspect(r) === inspect(r)` is `false` even though `r.value` and
`r.error` keep their reference identity. Do not key caches or memo
maps on the returned wrapper — key on the source `r` instead (or on
a stable identity like `r.value` / `r.error`).

***

```ts
export function inspect<T, E>(r: IResultOfT<T, E>): Inspected<T, E>;
```

Defined in: [observability/inspect.ts](https://github.com/sandlada/result/blob/main/src/observability/inspect.ts)

### installObserver()

Install a process-wide observer. Returns a disposer. Pass `null` to remove
the active observer.

**Disposal semantics**: the returned disposer follows LIFO restoration-stack
behavior — when called, it removes its own entry from the stack. If observer
A is installed, then B, then A's disposer is called while B is still
active, the call is a no-op (B remains active). Disposers must be called in
**LIFO** order to clean up correctly.

**Clearing**: `installObserver(null)` removes the **active** observer (the
top of the stack) only — the observers below it stay installed and become
active again. This mirrors the disposer, which also removes a single entry.

**Observer error audit hook**: the optional `onObserverError` callback
receives any error thrown by the installed observer. Without it,
observer errors are silently swallowed so a misbehaving reporter cannot
blow up an otherwise healthy Result pipeline. With it, operators can route
observer failures to a secondary telemetry channel. `onObserverError`
itself is wrapped in try/catch — its own throw is silently swallowed to
preserve the pipeline guarantee.

***

```ts
export function installObserver(
    handler: Observer | null,
    onObserverError?: (error: unknown) => void,
): () => void;
```

Defined in: [observability/observe.ts](https://github.com/sandlada/result/blob/main/src/observability/observe.ts)

### observe()

Side-effecting pass-through. If an observer is installed, fires it with the
result and the current breadcrumb path; otherwise this is a no-op.

**Observer errors are intentionally swallowed** so that a misbehaving reporter
cannot blow up an otherwise healthy Result pipeline. If you need telemetry on
a broken observer, wrap your handler with a `try / catch` that emits to a
secondary channel.

***

```ts
export function observe<T, E>(r: IResultOfT<T, E>): IResultOfT<T, E>;
```

Defined in: [observability/observe.ts](https://github.com/sandlada/result/blob/main/src/observability/observe.ts)

### tapErrContext()

Fires `fn(error, ctx)` for failures, returning the original result wrapped
in a `Promise<IResultOfT<T, E>>`. The callback may be sync or async — its
return value (if a Promise) is awaited before the outer Promise resolves.

***

```ts
export function tapErrContext<T, E>(
    fn: (error: E, context: ErrContext) => unknown,
): (r: IResultOfT<T, E>) => Promise<IResultOfT<T, E>>;
export function tapErrContext<T, E>(
    fn: (error: E, context: ErrContext) => unknown,
    r: IResultOfT<T, E>,
): Promise<IResultOfT<T, E>>;
```

Defined in: [observability/tapErrContext.ts](https://github.com/sandlada/result/blob/main/src/observability/tapErrContext.ts)

### withPath()

Tags a result with a path segment so downstream [tapErrContext](/0.20261102/api/observability/#taperrcontext)
callbacks (or other observers) can include the breadcrumb trail. The returned
result is structurally identical to its input — `withPath` is
**observability-only** and does not modify `r.value` or `r.error`.

The segment is pushed onto the current frame as soon as `withPath(segment)` is
called; you do not need to invoke a returned curried function. Combine with
`ctx.run(fn)` for lexically scoped paths.

The curried form (`withPath(segment)` returning a unary function) lets the
operator slot directly into `pipe` without an arrow wrapper, matching the
shape of `tap`, `map`, `bind`, etc.

**Out-of-scope behavior**: calling `withPath(segment)` outside of any active
`ctx.run(fn)` scope is a **silent no-op** — the segment is discarded and
`getPath()` remains empty. There is no process-global path stack to leak
into; standalone calls simply have no observable effect. Wrap standalone
calls in `ctx.run` when you actually want the segment recorded.

```ts
export function withPath(segment: PathSegment): <T, E>(r: IResultOfT<T, E>) => IResultOfT<T, E>;
export function withPath<T, E>(segment: PathSegment, r: IResultOfT<T, E>): IResultOfT<T, E>;
```

Defined in: [observability/withPath.ts](https://github.com/sandlada/result/blob/main/src/observability/withPath.ts)

#### Example

```ts
import { ctx, withPath } from '@sandlada/result/observability';
import { pipe } from '@sandlada/result/composition';
import { ok } from '@sandlada/result/factories';

// Direct form — push a segment and return the result unchanged.
const direct = withPath('fetchUser', ok(42));

// Curried form — slots directly into `pipe`.
const piped = ctx.run(() => pipe(ok(42), withPath('fetchUser'), withPath('id:42')));
```

Direct form — push `segment` and return `r` unchanged.
