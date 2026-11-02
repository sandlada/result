---
title: "Bridge Result: sync → Promise<Result>"
description: "Bridge operators on plain IResultOfT: map, bind, bindThrough,
  match, orElse, tap and tapErr — same names as operators/, different input
  type."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/bridge-result
---

Sync Result to Promise-of-Result lift operators.

## Functions

### bind()

Chains a result-producing async function over a **sync** `IResultOfT`.
The callback returns `Promise<IResultOfT<B, F>>`, and the result is wrapped
into a `Promise<IResultOfT<B, F>>`.

Bridges from the sync result world to the async world — unlike `bindAsync`
which works on `Promise<IResultOfT>`. Where `bindAsync` accepts callbacks that
may return sync or async results, `bind` requires an async callback.

**Throw policy**: a synchronous throw from `f` propagates via the outer promise
rejection. A rejected Promise from `f` propagates as a rejection. Matches
the canonical AsyncResult throw policy.

**Type contract**: the success path produces `Promise<IResultOfT<B, F>>`.
The input's error type `E` is not widened into the success branch - at
runtime `E` only flows through on the failure short-circuit, where `f` is
never invoked.

The callback is invoked inside the promise chain, so the returned promise
is unwrapped by the await chain exactly once: `await bind(...)` yields
the `IResultOfT`, not a promise of a promise.

```ts
export function bind<A, B, F>(
    f: (a: A) => Promise<IResultOfT<B, F>>,
): <E>(r: IResultOfT<A, E>) => Promise<IResultOfT<B, F>>;
export function bind<A, B, E, F>(
    f: (a: A) => Promise<IResultOfT<B, F>>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<B, F>>;
```

Defined in: [bridge-result/bind.ts](https://github.com/sandlada/result/blob/main/src/bridge-result/bind.ts)

#### Example

```ts
import { bind } from '@sandlada/result/bridge-result';
import { ok, err } from '@sandlada/result/factories';

const r = await bind(async (x: number) => ok(x * 2), ok(21));
// Ok(42)

// Curried form:
const process = bind(async (x: number) => x > 0 ? ok(x) : err('negative'));
const r2 = await process(ok(5));
```

***

### bindThrough()

Side-effect on the success track — calls an async function on success
that **can** propagate errors. If `fn` returns a failure, that failure propagates.
If `fn` returns a success, the **original** success value passes through unchanged.

The key difference from `bind` is that `bindThrough` preserves the
**original** success value on success, while `bind` replaces it.

Bridges from the sync result world to the async world — unlike `bindAsync`
which works on `Promise<IResultOfT>`.

```ts
export function bindThrough<A, B, F>(
    fn: (a: A) => Promise<IResultOfT<B, F>>,
): <E>(r: IResultOfT<A, E>) => Promise<IResultOfT<A, E | F>>;
export function bindThrough<A, B, E, F>(
    fn: (a: A) => Promise<IResultOfT<B, F>>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<A, E | F>>;
```

Defined in: [bridge-result/bindThrough.ts](https://github.com/sandlada/result/blob/main/src/bridge-result/bindThrough.ts)

#### Example

```ts
import { bindThrough } from '@sandlada/result/bridge-result';
import { ok, err } from '@sandlada/result/factories';

// Validate and preserve original value on success:
const r = await bindThrough(
    async (v: string) => v.length > 0 ? ok(v) : err('empty'),
    ok('data'),
);
// Ok('data') if valid, Err('empty') if invalid
```

***

### map()

Transforms the success value of a **sync** `IResultOfT` using an **async** callback.
The callback returns a `Promise`, and the result is wrapped into a `Promise<IResultOfT>`.

This bridges from the sync result world to the async world — unlike `mapAsync`
which works on `Promise<IResultOfT>`.

```ts
export function map<A, B>(
    f: (a: A) => Promise<B>,
): <E>(r: IResultOfT<A, E>) => Promise<IResultOfT<B, E>>;
export function map<A, B, E>(
    f: (a: A) => Promise<B>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<B, E>>;
```

Defined in: [bridge-result/map.ts](https://github.com/sandlada/result/blob/main/src/bridge-result/map.ts)

#### Example

```ts
import { map } from '@sandlada/result/bridge-result';
import { ok, err } from '@sandlada/result/factories';
import { pipe } from '@sandlada/result/composition';

const r = await map(async (x: number) => x * 2, ok(21));
// Ok(42)

// Curried form:
const doubled = map(async (x: number) => x * 2);
const r2 = await doubled(ok(21));
```

***

### match()

Async `match` for sync `IResultOfT`. Lifts a sync Result into
the async world and pattern-matches with async-allowed handlers.

```ts
export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
): (r: IResultOfT<T, E>) => Promise<U>;
export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
    r: IResultOfT<T, E>,
): Promise<U>;
```

Defined in: [bridge-result/match.ts](https://github.com/sandlada/result/blob/main/src/bridge-result/match.ts)

#### Example

```ts
import { match } from '@sandlada/result/bridge-result';
import { ok } from '@sandlada/result/factories';
await match({ ok: async (x: number) => `got ${x}`, err: async (e: string) => `error: ${e}` }, ok(42)); // 'got 42'
```

***

### orElse()

Async `orElse` for sync `IResultOfT`. Lifts a sync Result into
the async world and recovers from failure via an async callback.

Companion to [bind](/0.20261102/api/bridge-result/#bind) — `bind` chains forward on Ok; `orElse`
recovers on Err.

```ts
export function orElse<T, E, F>(
    f: (e: E) => Promise<IResultOfT<T, F>>,
): (r: IResultOfT<T, E>) => Promise<IResultOfT<T, E | F>>;
export function orElse<T, E, F>(
    f: (e: E) => Promise<IResultOfT<T, F>>,
    r: IResultOfT<T, E>,
): Promise<IResultOfT<T, E | F>>;
```

Defined in: [bridge-result/orElse.ts](https://github.com/sandlada/result/blob/main/src/bridge-result/orElse.ts)

#### Example

```ts
import { orElse } from '@sandlada/result/bridge-result';
import { ok, err } from '@sandlada/result/factories';
await orElse(async (e: string) => ok(0), err('boom')); // Ok(0)
await orElse(async (e: string) => ok(0), ok(42));       // Ok(42)
```

***

### tap()

Side-effect on success for a sync `IResultOfT` using an async callback.
Returns the original Result.
If the callback throws or returns a rejected Promise, the error is caught
and returned as an `Err` result.

```ts
export function tap<A, E>(
    fn: (a: A) => Promise<void | unknown>,
): (r: IResultOfT<A, E>) => Promise<IResultOfT<A, E>>;
export function tap<A, E>(
    fn: (a: A) => Promise<void | unknown>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<A, E>>;
```

Defined in: [bridge-result/tap.ts](https://github.com/sandlada/result/blob/main/src/bridge-result/tap.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { tap } from '@sandlada/result/bridge-result';
const log = tap(async (x: number) => { console.log(x); });
await log(ok(42)); // Ok(42) — side-effect only
```

***

### tapErr()

Side-effect on failure for a sync `IResultOfT` using an async callback.
Returns the original Result.
If the callback throws or returns a rejected Promise, the error is caught
and returned as an `Err` result.

```ts
export function tapErr<A, E>(
    fn: (e: E) => Promise<void | unknown>,
): (r: IResultOfT<A, E>) => Promise<IResultOfT<A, E>>;
export function tapErr<A, E>(
    fn: (e: E) => Promise<void | unknown>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<A, E>>;
```

Defined in: [bridge-result/tapErr.ts](https://github.com/sandlada/result/blob/main/src/bridge-result/tapErr.ts)

#### Example

```ts
import { err } from '@sandlada/result/factories';
import { tapErr } from '@sandlada/result/bridge-result';
const log = tapErr(async (e: string) => { console.error(e); });
await log(err('oops')); // Err('oops') — side-effect only
```
