---
title: Lazy AsyncOption operators
description: "Operators for lazy AsyncOption<T> thunks: map, bind, filter,
  orElse, okOr, zipWith, all and the terminal unwrap that runs the thunk."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/async-option
---

AsyncOption — barrel export.

Re-exports all AsyncOption factories and operators.

## Functions

### all()

Combines a tuple/array of `AsyncOption`s, preserving heterogeneous types.
Returns `AsyncOption<None>` if any element is `None`; otherwise
`AsyncOption<Some<[v0, v1, ...]>>`. Like `Promise.all` but with `None`
short-circuiting.

Two overloads:

* Tuple overload: preserves per-position heterogeneous types — yields
  `AsyncOption<Some<[number, string]>>`.
* Array overload: runtime-sized homogeneous arrays — yields
  `AsyncOption<Some<T[]>>`.

```ts
export function all<T extends readonly [AsyncOption<unknown>, ...AsyncOption<unknown>[]]>(
    aos: T,
): AsyncOption<
    { [K in keyof T]: T[K] extends AsyncOption<infer V> ? V : never }
>;
export function all<T>(
    aos: readonly AsyncOption<T>[],
): AsyncOption<T[]>;
```

Defined in: [async-option/all.ts](https://github.com/sandlada/result/blob/main/src/async-option/all.ts)

#### Example

```ts
import { ofSome, ofNone, all } from '@sandlada/result/async-option';
import type { AsyncOption } from '@sandlada/result';

// Heterogeneous tuple — per-position types preserved.
const a = await all([ofSome(1), ofSome('hi')]).run(); // Some([1, 'hi'])

// Homogeneous array — runtime-sized.
const arr: AsyncOption<number>[] = [ofSome(1), ofSome(2)];
const b = await all(arr).run(); // Some([1, 2])

const c = await all([ofSome(1), ofNone<number>()]).run(); // None
```

***

### bind()

Chains an AsyncOption-returning function on success (monadic bind / flatMap).
Supports interoperability by also accepting a function that returns `Promise<IOption<U>>`.
Lazy — returns a new AsyncOption without executing the inner computation.

```ts
export function bind<T, U>(
    fn: (value: T) => AsyncOption<U> | Promise<IOption<U>>,
): (ao: AsyncOption<T>) => AsyncOption<U>;
export function bind<T, U>(
    fn: (value: T) => AsyncOption<U> | Promise<IOption<U>>,
    ao: AsyncOption<T>,
): AsyncOption<U>;
```

Defined in: [async-option/bind.ts](https://github.com/sandlada/result/blob/main/src/async-option/bind.ts)

#### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, bind } from '@sandlada/result/async-option';

const ao = bind((x: number) => fromOption(ofSome(x * 2)), fromOption(ofSome(21)));
const result = await ao.run(); // Some(42)
```

***

### contains()

Returns a Promise\<boolean> indicating if the AsyncOption is Some and contains the given value.

***

```ts
export function contains<T>(
    value: T,
): (ao: AsyncOption<T>) => Promise<boolean>;
export function contains<T>(
    value: T,
    ao: AsyncOption<T>,
): Promise<boolean>;
```

Defined in: [async-option/contains.ts](https://github.com/sandlada/result/blob/main/src/async-option/contains.ts)

### exists()

Returns a Promise\<boolean> indicating if the AsyncOption is Some and the predicate holds.

**Throw policy**: a predicate that throws synchronously or rejects is
collapsed to `false` - the same contract the eager sibling
`promise-option/existsAsyncOption` has, and the convention of this module,
where every callback captures its failure instead of propagating it.

***

```ts
export function exists<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
): (ao: AsyncOption<T>) => Promise<boolean>;
export function exists<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ao: AsyncOption<T>,
): Promise<boolean>;
```

Defined in: [async-option/exists.ts](https://github.com/sandlada/result/blob/main/src/async-option/exists.ts)

### filter()

Filters the value of an AsyncOption with a predicate.
Keeps the Some if the predicate holds; converts to None otherwise. None passes through.
Lazy — returns a new AsyncOption without executing the inner computation.

**Throw policy**: If the predicate throws synchronously or returns a rejected
Promise, the error is caught and the result converts to `None`
(canonical catch+convert policy — see AGENTS.md).

```ts
export function filter<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
): (ao: AsyncOption<T>) => AsyncOption<T>;
export function filter<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ao: AsyncOption<T>,
): AsyncOption<T>;
```

Defined in: [async-option/filter.ts](https://github.com/sandlada/result/blob/main/src/async-option/filter.ts)

#### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, filter } from '@sandlada/result/async-option';
const ao = filter((x: number) => x > 10, fromOption(ofSome(21)));
const result = await ao.run(); // Some(21)
```

***

### flatten()

Flattens a nested AsyncOption.

**Single-step only**: unwraps exactly one layer. Call `flatten` repeatedly
to flatten deeper nests.

***

```ts
export function flatten<T>(
    ao: AsyncOption<AsyncOption<T>>,
): AsyncOption<T>;
```

Defined in: [async-option/flatten.ts](https://github.com/sandlada/result/blob/main/src/async-option/flatten.ts)

### from()

Creates an AsyncOption from a thunk that returns an Option or a
Promise\<Option>. The thunk is lazy - it won't execute until `.run()` is
called.

The carrier's `run()` always returns a Promise: a thunk that returns a plain
Option is awaited, and a thunk that throws synchronously surfaces as a
rejected promise instead of escaping as a raw exception.

```ts
export function from<T>(
    thunk: () => IOption<T> | Promise<IOption<T>>,
): AsyncOption<T>;
```

Defined in: [async-option/from.ts](https://github.com/sandlada/result/blob/main/src/async-option/from.ts)

#### Example

```ts
import { from } from '@sandlada/result/async-option';
import { ofSome } from '@sandlada/result/option';

const ao = from(() => Promise.resolve(ofSome(42)));
const result = await ao.run(); // Some(42)
```

***

### fromOption()

Wraps a sync `IOption` into an AsyncOption (lifts a sync Option into the async world).

```ts
export function fromOption<T>(
    option: IOption<T>,
): AsyncOption<T>;
```

Defined in: [async-option/fromOption.ts](https://github.com/sandlada/result/blob/main/src/async-option/fromOption.ts)

#### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption } from '@sandlada/result/async-option';

const ao = fromOption(ofSome(42));
const result = await ao.run(); // Some(42)
```

***

### fromPromise()

Wraps a `Promise<T>` into an AsyncOption, catching rejections.
If the promise resolves, it returns `Some(value)`.
If it rejects, it returns `None`.

The inner Promise is not yet created at construction time; the factory thunk is invoked
lazily when `.run()` is called.

```ts
export function fromPromise<T>(
    thunk: () => Promise<T>,
): AsyncOption<T>;
```

Defined in: [async-option/fromPromise.ts](https://github.com/sandlada/result/blob/main/src/async-option/fromPromise.ts)

#### Example

```ts
import { fromPromise } from '@sandlada/result/async-option';
const ao = fromPromise(() => fetch('/api/data').then(r => r.json()));
const result = await ao.run();
```

***

### isNone()

Returns `true` if the `AsyncOption` resolves to `None`. Mirrors the
`IOption.isNone` discriminator as a standalone function.

```ts
export function isNone<T>(ao: AsyncOption<T>): Promise<boolean>;
```

Defined in: [async-option/isNone.ts](https://github.com/sandlada/result/blob/main/src/async-option/isNone.ts)

#### Example

```ts
import { ofSome, ofNone, isNone } from '@sandlada/result/async-option';

await isNone(ofSome(42)); // false
await isNone(ofNone<number>()); // true
```

***

### isSome()

Returns `true` if the `AsyncOption` resolves to `Some`. Mirrors the
`IOption.isSome` discriminator as a standalone function.

```ts
export function isSome<T>(ao: AsyncOption<T>): Promise<boolean>;
```

Defined in: [async-option/isSome.ts](https://github.com/sandlada/result/blob/main/src/async-option/isSome.ts)

#### Example

```ts
import { ofSome, ofNone, isSome } from '@sandlada/result/async-option';

await isSome(ofSome(42)); // true
await isSome(ofNone<number>()); // false
```

***

### map()

Maps the value of an AsyncOption using a synchronous function.
Lazy — returns a new AsyncOption without executing the inner computation.

```ts
export function map<T, U>(
    fn: (value: T) => U,
): (ao: AsyncOption<T>) => AsyncOption<U>;
export function map<T, U>(
    fn: (value: T) => U,
    ao: AsyncOption<T>,
): AsyncOption<U>;
```

Defined in: [async-option/map.ts](https://github.com/sandlada/result/blob/main/src/async-option/map.ts)

#### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, map } from '@sandlada/result/async-option';

const ao = map((x: number) => x * 2, fromOption(ofSome(21)));
const result = await ao.run(); // Some(42)
```

***

### mapAsync()

Maps the value of an AsyncOption using an async function.
Lazy — returns a new AsyncOption without executing the inner computation.

```ts
export function mapAsync<T, U>(
    fn: (value: T) => Promise<U>,
): (ao: AsyncOption<T>) => AsyncOption<U>;
export function mapAsync<T, U>(
    fn: (value: T) => Promise<U>,
    ao: AsyncOption<T>,
): AsyncOption<U>;
```

Defined in: [async-option/mapAsync.ts](https://github.com/sandlada/result/blob/main/src/async-option/mapAsync.ts)

#### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, mapAsync } from '@sandlada/result/async-option';

const ao = mapAsync(async (x: number) => x * 2, fromOption(ofSome(21)));
const result = await ao.run(); // Some(42)
```

***

### mapOr()

Maps the value of an `AsyncOption`, returning a default on `None`.
The mapper may be sync or async. Throws from the mapper are caught and
converted to the default (canonical AsyncOption catch+convert policy).

```ts
export function mapOr<T, U>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
): (ao: AsyncOption<T>) => Promise<U>;
export function mapOr<T, U>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
    ao: AsyncOption<T>,
): Promise<U>;
```

Defined in: [async-option/mapOr.ts](https://github.com/sandlada/result/blob/main/src/async-option/mapOr.ts)

#### Example

```ts
import { ofSome, ofNone, mapOr } from '@sandlada/result/async-option';

const v1 = await mapOr(-1, (x: number) => x * 2, ofSome(21)); // 42
const v2 = await mapOr(-1, (x: number) => x * 2, ofNone<number>()); // -1
```

***

### mapOrElse()

Maps the value of an `AsyncOption`, or computes a default from a thunk on `None`.
Both callbacks may be sync or async.

```ts
export function mapOrElse<T, U>(
    onNone: () => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
): (ao: AsyncOption<T>) => Promise<U>;
export function mapOrElse<T, U>(
    onNone: () => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
    ao: AsyncOption<T>,
): Promise<U>;
```

Defined in: [async-option/mapOrElse.ts](https://github.com/sandlada/result/blob/main/src/async-option/mapOrElse.ts)

#### Example

```ts
import { ofSome, ofNone, mapOrElse } from '@sandlada/result/async-option';

const v1 = await mapOrElse(() => -1, (x: number) => x * 2, ofSome(21)); // 42
const v2 = await mapOrElse(() => -1, (x: number) => x * 2, ofNone<number>()); // -1
```

***

### match()

Terminal — pattern-matches on both cases of an AsyncOption.

```ts
export function match<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
): (ao: AsyncOption<T>) => Promise<U>;
export function match<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
    ao: AsyncOption<T>,
): Promise<U>;
```

Defined in: [async-option/match.ts](https://github.com/sandlada/result/blob/main/src/async-option/match.ts)

#### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, match } from '@sandlada/result/async-option';

const value = await match(
  { some: (v: number) => `success: ${v}`, none: () => 'failure' },
  fromOption(ofSome(42))
); // "success: 42"
```

***

### ofNone()

Creates an `AsyncOption` that always resolves to `None`.
Equivalent to `fromOption(ofNone())` but skips the sync intermediate.

Default `T = unknown` mirrors option/ofNone so contextual typing flows
the same way (`const x: AsyncOption<number> = ofNone()` widens without
needing an explicit generic argument).

```ts
export function ofNone<T = unknown>(): AsyncOption<T>;
```

Defined in: [async-option/ofNone.ts](https://github.com/sandlada/result/blob/main/src/async-option/ofNone.ts)

#### Example

```ts
import { ofNone } from '@sandlada/result/async-option';

const ao = ofNone<number>();
const opt = await ao.run(); // None
```

***

### ofSome()

Lifts a raw value into an `AsyncOption<T>` that resolves to `Some(value)`.
Equivalent to `fromOption(ofSome(value))` but skips the sync intermediate.

```ts
export function ofSome<T>(value: T): AsyncOption<T>;
```

Defined in: [async-option/ofSome.ts](https://github.com/sandlada/result/blob/main/src/async-option/ofSome.ts)

#### Example

```ts
import { ofSome } from '@sandlada/result/async-option';

const ao = ofSome(42);
const opt = await ao.run(); // Some(42)
```

***

### okOr()

Converts an `AsyncOption<T>` into an `AsyncResult<T, E>`, supplying an error
value for the `None` case.

```ts
export function okOr<T, E>(
    error: E,
): (ao: AsyncOption<T>) => AsyncResult<T, E>;
export function okOr<T, E>(
    error: E,
    ao: AsyncOption<T>,
): AsyncResult<T, E>;
```

Defined in: [async-option/okOr.ts](https://github.com/sandlada/result/blob/main/src/async-option/okOr.ts)

#### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';
import { okOr } from '@sandlada/result/async-option';

const r1 = await okOr('missing', ofSome(42)).run(); // Ok(42)
const r2 = await okOr('missing', ofNone<number>()).run(); // Err('missing')
```

***

### okOrElse()

Converts an `AsyncOption<T>` into an `AsyncResult<T, E | Error>`, computing the
error from a thunk on `None` (lazy - error is only built when needed).

**Throw policy**: a thunk that throws synchronously or rejects is captured
as the result `error`. Because the caught value can be any `unknown`, the
return type is widened to `E | Error` - the runtime error may be an Error
instance even when the user-declared `E` is something else. A caught value
that is not an `Error` instance is wrapped in one (the original value stays
available through `cause`), so the declared error type holds for every value
the caller can receive.

```ts
export function okOrElse<T, E>(
    onNone: () => E | Promise<E>,
): (ao: AsyncOption<T>) => AsyncResult<T, E | Error>;
export function okOrElse<T, E>(
    onNone: () => E | Promise<E>,
    ao: AsyncOption<T>,
): AsyncResult<T, E | Error>;
```

Defined in: [async-option/okOrElse.ts](https://github.com/sandlada/result/blob/main/src/async-option/okOrElse.ts)

#### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';
import { okOrElse } from '@sandlada/result/async-option';

const r1 = await okOrElse(() => 'missing', ofSome(42)).run(); // Ok(42)
const r2 = await okOrElse(() => 'missing', ofNone<number>()).run(); // Err('missing')
```

***

### orElse()

Curried form. The inner `<T>` is **deferred** so the AsyncOption's value
type is re-inferred at every application site.

Recovers from None by chaining to an alternative AsyncOption or Promise\<IOption>.
Lazy — returns a new AsyncOption without executing the inner computation.

The fallback's value type (`U`) is independent of the input's value type (`T`),
so a recovery can return a structurally broader or different value — the
resulting carrier is `AsyncOption<T | U>`. Pattern-matching on the result narrows
to `T` on the original `Some` and to `U` on the recovered branch.

```ts
export function orElse<U>(
    fn: () => AsyncOption<U> | Promise<IOption<U>>,
): <T>(ao: AsyncOption<T>) => AsyncOption<T | U>;
export function orElse<T, U>(
    fn: () => AsyncOption<U> | Promise<IOption<U>>,
    ao: AsyncOption<T>,
): AsyncOption<T | U>;
```

Defined in: [async-option/orElse.ts](https://github.com/sandlada/result/blob/main/src/async-option/orElse.ts)

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/option';
import { fromOption, orElse } from '@sandlada/result/async-option';

const ao = orElse(() => fromOption(ofSome(0)), fromOption(ofNone()));
const result = await ao.run(); // Some(0)

// Cross-type recovery - input `AsyncOption<User>`, fallback `AsyncOption<string>`,
// result `AsyncOption<User | string>`.
type User = { readonly id: string };
const recovered = orElse(
    () => fromOption(ofSome('anonymous' as string)),
    fromOption(ofNone<User>()),
);
```

Direct form. `T` is inferred from the supplied AsyncOption; the result widens to `T | U`.

***

### tap()

Side-effect on the success track of an AsyncOption. Calls `fn`
with the value on Some and passes the original Option through unchanged.
Lazy — returns a new AsyncOption without executing the inner computation.

**Throw policy**: If the side-effect callback throws, the result converts
to `None` (canonical tap/tee policy — see AGENTS.md).

```ts
export function tap<T>(
    fn: (value: T) => void,
): (ao: AsyncOption<T>) => AsyncOption<T>;
export function tap<T>(
    fn: (value: T) => void,
    ao: AsyncOption<T>,
): AsyncOption<T>;
```

Defined in: [async-option/tap.ts](https://github.com/sandlada/result/blob/main/src/async-option/tap.ts)

#### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, tap } from '@sandlada/result/async-option';

const ao = tap((v: number) => console.log(v), fromOption(ofSome(42)));
await ao.run(); // Logs 42, returns Some(42)
```

***

### tapAsync()

Side-effect on the success track of an AsyncOption using an async function.
Calls `fn` with the value on Some and passes the original Option through unchanged.
Lazy — returns a new AsyncOption without executing the inner computation.

**Throw policy**: If the side-effect callback throws (or rejects), the result
converts to `None` (canonical tap/tee policy — see AGENTS.md).

```ts
export function tapAsync<T>(
    fn: (value: T) => void | Promise<void>,
): (ao: AsyncOption<T>) => AsyncOption<T>;
export function tapAsync<T>(
    fn: (value: T) => void | Promise<void>,
    ao: AsyncOption<T>,
): AsyncOption<T>;
```

Defined in: [async-option/tapAsync.ts](https://github.com/sandlada/result/blob/main/src/async-option/tapAsync.ts)

#### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, tapAsync } from '@sandlada/result/async-option';

const ao = tapAsync(async (v: number) => { console.log('saving', v); }, fromOption(ofSome(42)));
await ao.run(); // returns Some(42) after the async side effect
```

***

### transpose()

Transposes an `AsyncOption<AsyncResult<T, E>>` into an
`AsyncResult<AsyncOption<T>, E>`.

* `Some(Ok(v))`  → `Ok(Some(v))`
* `Some(Err(e))` → `Err(e)`
* `None`         → `Ok(None)`

```ts
export function transpose<T, E>(
    ao: AsyncOption<AsyncResult<T, E>>,
): AsyncResult<AsyncOption<T>, E>;
```

Defined in: [async-option/transpose.ts](https://github.com/sandlada/result/blob/main/src/async-option/transpose.ts)

#### Example

```ts
import { ofSome } from '@sandlada/result/async-option';
import { fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
import { transpose } from '@sandlada/result/async-option';

const r = await transpose(ofSome(fromResult(ok(42)))).run();
// r.isSuccess === true; r.value is an AsyncOption resolving to Some(42)
```

***

### unwrap()

Extracts the value from an `AsyncOption`, or throws if `None`.
Use sparingly — prefer `unwrapOr`, `unwrapOrElse`, or `match` in most code.

```ts
export function unwrap<T>(ao: AsyncOption<T>): Promise<T>;
```

Defined in: [async-option/unwrap.ts](https://github.com/sandlada/result/blob/main/src/async-option/unwrap.ts)

#### Example

```ts
import { ofSome, ofNone, unwrap } from '@sandlada/result/async-option';

const v = await unwrap(ofSome(42)); // 42
await unwrap(ofNone()); // throws Error
```

***

### unwrapOr()

Extracts the value from an AsyncOption, or returns a default value.

```ts
export function unwrapOr<T>(
    defaultValue: T | Promise<T>,
): (ao: AsyncOption<T>) => Promise<T>;
export function unwrapOr<T>(
    defaultValue: T | Promise<T>,
    ao: AsyncOption<T>,
): Promise<T>;
```

Defined in: [async-option/unwrapOr.ts](https://github.com/sandlada/result/blob/main/src/async-option/unwrapOr.ts)

#### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/option';
import { fromOption, unwrapOr } from '@sandlada/result/async-option';

const v1 = await unwrapOr(0, fromOption(ofSome(42))); // 42
const v2 = await unwrapOr(0, fromOption(ofNone())); // 0
```

***

### unwrapOrElse()

Extracts the value from an `AsyncOption`, or computes a default from a thunk
on `None`. Lazy — the default is only computed when needed.

```ts
export function unwrapOrElse<T>(
    onNone: () => T | Promise<T>,
): (ao: AsyncOption<T>) => Promise<T>;
export function unwrapOrElse<T>(
    onNone: () => T | Promise<T>,
    ao: AsyncOption<T>,
): Promise<T>;
```

Defined in: [async-option/unwrapOrElse.ts](https://github.com/sandlada/result/blob/main/src/async-option/unwrapOrElse.ts)

#### Example

```ts
import { ofSome, ofNone, unwrapOrElse } from '@sandlada/result/async-option';

const v1 = await unwrapOrElse(() => 0, ofSome(42)); // 42
const v2 = await unwrapOrElse(() => 0, ofNone<number>()); // 0
```

***

### zipWith()

Combines N AsyncOptions (N ≥ 2) with a function. If all
resolve to Some, returns `AsyncOption<Some(fn(a, b, ...))>`. If any
resolves to None, returns `AsyncOption<None>`. A *synchronous* throw from
the callback collapses to `None`; async rejections from the callback
propagate (they are not caught).

The arity of `fn` fixes the number of AsyncOptions accepted — variadic via
tuple inference. The catch-all mapped-type variadic handles every arity ≥ 2
in a single pair of overloads.

**Design note (type safety):** This file intentionally does NOT declare
per-arity overloads. TypeScript's function-type bivariance would let a
2-argument `fn` match a 3-argument overload (with the third parameter
silently ignored), and a 0-argument `fn` match a 2-argument curried form.
The single variadic below avoids both holes: `T` is inferred from `fn`'s
actual parameter list, and the constraint `readonly [unknown, unknown,
...unknown[]]` requires ≥ 2 elements.

```ts
export function zipWith<T extends readonly [unknown, unknown, ...unknown[]], R>(
    fn: (...args: T) => R | Promise<R>,
): (...aos: { [K in keyof T]: AsyncOption<T[K]> }) => AsyncOption<R>;
export function zipWith<T extends readonly [unknown, unknown, ...unknown[]], R>(
    fn: (...args: T) => R | Promise<R>,
    ...aos: { [K in keyof T]: AsyncOption<T[K]> }
): AsyncOption<R>;
```

Defined in: [async-option/zipWith.ts](https://github.com/sandlada/result/blob/main/src/async-option/zipWith.ts)

#### Example

```ts
import { zipWith, ofSome, ofNone } from '@sandlada/result/async-option';

// Arity 2
const r1 = await zipWith((a: number, b: number) => a + b, ofSome(1), ofSome(2)).run();
// Some(3)

// Arity 5
const r2 = await zipWith(
    (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e,
    ofSome(1), ofSome(2), ofSome(3), ofSome(4), ofSome(5),
).run();
// Some(15)
```
