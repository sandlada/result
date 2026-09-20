---
editUrl: false
next: false
prev: false
title: observability
slug: 0.20260811/api/observability
---

## Interfaces

### ErrContext

Defined in: [observability/tapErrContext.ts:32](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/tapErrContext.ts#L32)

#### Properties

##### path

> `readonly` **path**: [`PathStack`](/0.20260811/api/observability/#pathstack)

Defined in: [observability/tapErrContext.ts:33](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/tapErrContext.ts#L33)

***

### FormatOptions

Defined in: [observability/format.ts:23](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/format.ts#L23)

#### Properties

##### includeStack?

> `readonly` `optional` **includeStack?**: `boolean`

Defined in: [observability/format.ts:27](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/format.ts#L27)

Include `Error.stack` if available. Default `false`.

##### maxDepth?

> `readonly` `optional` **maxDepth?**: `number`

Defined in: [observability/format.ts:29](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/format.ts#L29)

Truncate long values at `maxDepth` recursive levels for object values. Default `3`.

##### quoteStrings?

> `readonly` `optional` **quoteStrings?**: `boolean`

Defined in: [observability/format.ts:25](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/format.ts#L25)

Wrap strings in quotes so values with whitespace don't confuse readers. Default `true`.

***

### ObserveEvent

Defined in: [observability/observe.ts:29](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/observe.ts#L29)

#### Type Parameters

##### T

`T`

##### E

`E`

#### Properties

##### kind

> `readonly` **kind**: `"ok"` | `"err"`

Defined in: [observability/observe.ts:30](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/observe.ts#L30)

##### path

> `readonly` **path**: readonly (`string` | `number`)\[]

Defined in: [observability/observe.ts:32](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/observe.ts#L32)

##### result

> `readonly` **result**: [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [observability/observe.ts:31](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/observe.ts#L31)

## Type Aliases

### Inspected

> **Inspected**\<`T`, `E`> = \{ `kind`: `"ok"`; `value`: `T`; } | \{ `error`: `E`; `kind`: `"err"`; }

Defined in: [observability/inspect.ts:21](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/inspect.ts#L21)

#### Type Parameters

##### T

`T`

##### E

`E`

***

### Observer

> **Observer** = (`event`) => `void`

Defined in: [observability/observe.ts:35](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/observe.ts#L35)

#### Parameters

##### event

[`ObserveEvent`](/0.20260811/api/observability/#observeevent)\<`unknown`, `unknown`>

#### Returns

`void`

***

### PathSegment

> **PathSegment** = `string` | `number`

Defined in: [observability/ctx.ts:77](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/ctx.ts#L77)

A single path segment. Strings are preferred for names; numbers are also accepted.

***

### PathStack

> **PathStack** = `ReadonlyArray`\<[`PathSegment`](/0.20260811/api/observability/#pathsegment)>

Defined in: [observability/ctx.ts:80](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/ctx.ts#L80)

Read-only snapshot of the current breadcrumb stack.

## Variables

### ctx

> `const` **ctx**: `object`

Defined in: [observability/ctx.ts:271](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/ctx.ts#L271)

Synchronous + async scope: `ctx.run(fn)` opens a fresh frame chained to
the enclosing scope's frame (if any) and runs `fn` inside it. The frame
is dropped when `fn` returns (sync) or when its returned thenable
settles (async). Concurrent scopes each have independent frame chains
— `getPath()` inside one scope never observes another scope's segments.

#### Type Declaration

##### push()

> **push**(`segment`): `void`

Append a segment to the current frame's stack. No-op outside any
`ctx.run(fn)` scope — the leak warning in `withPath`'s JSDoc still
applies.

###### Parameters

###### segment

[`PathSegment`](/0.20260811/api/observability/#pathsegment)

###### Returns

`void`

##### run()

> **run**\<`T`>(`fn`): `T`

###### Type Parameters

###### T

`T`

###### Parameters

###### fn

() => `T`

###### Returns

`T`

## Functions

### format()

> **format**\<`T`, `E`>(`r`, `options?`): `string`

Defined in: [observability/format.ts:89](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/format.ts#L89)

Render a result as `Ok(...)` / `Err(...)`. Stack traces (when requested)
appear on subsequent lines after the closing parenthesis.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

##### options?

[`FormatOptions`](/0.20260811/api/observability/#formatoptions) = `{}`

#### Returns

`string`

***

### getActiveObserver()

> **getActiveObserver**(): [`Observer`](/0.20260811/api/observability/#observer) | `null`

Defined in: [observability/observe.ts:102](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/observe.ts#L102)

Returns the currently active observer or `null`. Mostly exposed for testing.

#### Returns

[`Observer`](/0.20260811/api/observability/#observer) | `null`

***

### getPath()

> **getPath**(): [`PathStack`](/0.20260811/api/observability/#pathstack)

Defined in: [observability/ctx.ts:298](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/ctx.ts#L298)

Snapshot the current path. Walks the frame chain from the innermost
scope outward, concatenating segments so that nested `ctx.run`s see
the full breadcrumb trail (outer segments first, inner last).

Returns an empty array when no scope is active (e.g., called from a
top-level test without `ctx.run`).

#### Returns

[`PathStack`](/0.20260811/api/observability/#pathstack)

***

### inspect()

> **inspect**\<`T`, `E`>(`r`): [`Inspected`](/0.20260811/api/observability/#inspected)\<`T`, `E`>

Defined in: [observability/inspect.ts:36](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/inspect.ts#L36)

Returns a structurally-friendly view of `r` that drops the `isSuccess`/`isFailure`
discriminants in favor of a single `kind` discriminator.

**Caching note**: every call allocates a fresh `{kind, value}` or
`{kind, error}` object. The wrapper itself is **not memoized**, so
`inspect(r) === inspect(r)` is `false` even though `r.value` and
`r.error` keep their reference identity. Do not key caches or memo
maps on the returned wrapper — key on the source `r` instead (or on
a stable identity like `r.value` / `r.error`).

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

#### Returns

[`Inspected`](/0.20260811/api/observability/#inspected)\<`T`, `E`>

***

### installObserver()

> **installObserver**(`handler`, `onObserverError?`): () => `void`

Defined in: [observability/observe.ts:76](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/observe.ts#L76)

Install a process-wide observer. Returns a disposer. Pass `null` to remove.

**Disposal semantics**: the returned disposer follows LIFO restoration-stack
behavior — when called, it removes its own entry from the stack. If observer
A is installed, then B, then A's disposer is called while B is still
active, the call is a no-op (B remains active). Disposers must be called in
**LIFO** order to clean up correctly.

**Observer error audit hook**: the optional `onObserverError` callback
receives any error thrown by the installed observer. Without it,
observer errors are silently swallowed so a misbehaving reporter cannot
blow up an otherwise healthy Result pipeline. With it, operators can route
observer failures to a secondary telemetry channel. `onObserverError`
itself is wrapped in try/catch — its own throw is silently swallowed to
preserve the pipeline guarantee.

#### Parameters

##### handler

[`Observer`](/0.20260811/api/observability/#observer) | `null`

##### onObserverError?

(`error`) => `void`

#### Returns

() => `void`

***

### observe()

> **observe**\<`T`, `E`>(`r`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [observability/observe.ts:116](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/observe.ts#L116)

Side-effecting pass-through. If an observer is installed, fires it with the
result and the current breadcrumb path; otherwise this is a no-op.

**Observer errors are intentionally swallowed** so that a misbehaving reporter
cannot blow up an otherwise healthy Result pipeline. If you need telemetry on
a broken observer, wrap your handler with a `try / catch` that emits to a
secondary channel.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

#### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

***

### tapErrContext()

#### Call Signature

> **tapErrContext**\<`T`, `E`>(`fn`): (`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

Defined in: [observability/tapErrContext.ts:41](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/tapErrContext.ts#L41)

Fires `fn(error, ctx)` for failures, returning the original result wrapped
in a `Promise<IResultOfT<T, E>>`. The callback may be sync or async — its
return value (if a Promise) is awaited before the outer Promise resolves.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`error`, `context`) => `unknown`

##### Returns

(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

#### Call Signature

> **tapErrContext**\<`T`, `E`>(`fn`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

Defined in: [observability/tapErrContext.ts:44](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/tapErrContext.ts#L44)

Fires `fn(error, ctx)` for failures, returning the original result wrapped
in a `Promise<IResultOfT<T, E>>`. The callback may be sync or async — its
return value (if a Promise) is awaited before the outer Promise resolves.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`error`, `context`) => `unknown`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

***

### withPath()

#### Call Signature

> **withPath**(`segment`): \<`T`, `E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [observability/withPath.ts:44](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/withPath.ts#L44)

Push `segment` onto the current path frame and return a curried operator.
Use this form when you want `withPath(segment)` to slot into `pipe`
directly, mirroring `tap(segment)` / `map(segment)`.

##### Parameters

###### segment

[`PathSegment`](/0.20260811/api/observability/#pathsegment)

##### Returns

\<`T`, `E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

#### Call Signature

> **withPath**\<`T`, `E`>(`segment`, `r`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [observability/withPath.ts:49](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/observability/withPath.ts#L49)

Direct form — push `segment` and return `r` unchanged.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### segment

[`PathSegment`](/0.20260811/api/observability/#pathsegment)

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>
