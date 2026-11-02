---
title: "Result operators: map, bind, match"
description: "Synchronous operators on IResultOfT: map, bind, orElse, match,
  unwrap, unwrapOr, tap, separate and the unwrap/expect escape hatches."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/operators
---

Sync operators — barrel export.

Re-exports all synchronous operators for working with Result values.

## Functions

### and()

Logical AND — returns `other` if `r` is success, otherwise returns the original failure.

Rust equivalent: `result.and(other)`

```ts
export function and<B, F>(other: IResultOfT<B, F>): <A, E>(r: IResultOfT<A, E>) => IResultOfT<B, E | F>;
export function and<A, E, B, F>(other: IResultOfT<B, F>, r: IResultOfT<A, E>): IResultOfT<B, E | F>;
```

Defined in: [operators/and.ts](https://github.com/sandlada/result/blob/main/src/operators/and.ts)

#### Example

```ts
import { and } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
and(ok(2), ok(1)); // Ok(2)
and(err('fail'), ok(1)); // Err('fail')
```

***

### andTee()

Side-effect on the success track. Calls `fn` with the value on success
and passes the original result through unchanged. Unlike `bind`, `fn`'s return value
(a `IResultOfT`) is **ignored** — even if `fn` returns a failure, the original success
is preserved.

**Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
The thrown value is captured **verbatim** and cast to the declared error
type, so without an `errorFn` the declared type is a structural claim only.
Pass `errorFn` to customise how the thrown value maps onto your error type
(canonical tap/tee policy).

**Phantom types — `B`, `F`**: These generics appear only to type `fn`'s
callback return (`IResultOfT<B, F>`). The operator **discards** `fn`'s
return value entirely; the produced carrier uses the input's `A`, `E`
types. They are intentionally inert — callers who rely on `B`/`F` for
constraint resolution will be surprised.

Curried form.

```ts
export function andTee<A, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    errorFn?: (thrown: unknown) => unknown,
): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function andTee<A, E, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;
```

Defined in: [operators/andTee.ts](https://github.com/sandlada/result/blob/main/src/operators/andTee.ts)

#### Type Param

**A**

— Input value type (carried through).

#### Type Param

**B**

— **Phantom**: callback's success type, ignored at runtime.

#### Type Param

**F**

— **Phantom**: callback's error type, ignored at runtime.

#### Type Param

**E**

— Input error type (carried through).

#### Example

```ts
import { andTee } from '@sandlada/result/operators';
import { pipe } from '@sandlada/result/composition';
import { ok, err } from '@sandlada/result/factories';
pipe(
  ok('hello'),
  andTee(v => { console.log('got:', v); return ok('ignored'); }),
); // Ok('hello') — logs "got: hello"

pipe(
  ok('hello'),
  andTee(v => err('ignored-error')),
); // Ok('hello') — fn's error is ignored
```

Direct form.

***

### andThrough()

Side-effect on the success track that **can** propagate errors.
Calls `fn` with the value on success. If `fn` returns a failure, that failure
replaces the original result (error propagates). If `fn` returns a success,
the **original** result passes through unchanged.

The key difference from `bind` is that `andThrough` preserves the **original**
success value on success, while `bind` replaces it with `fn`'s result.

**Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
The thrown value is captured **verbatim** and cast to the declared error
type, so without an `errorFn` the declared type is a structural claim only.
Pass `errorFn` to customise how the thrown value maps onto your error union -
e.g. `andThrough(fn, thrown => new MyError(String(thrown)))`.

```ts
export function andThrough<A, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    errorFn?: (thrown: unknown) => unknown,
): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E | F>;
export function andThrough<A, E, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E | F,
): IResultOfT<A, E | F>;
```

Defined in: [operators/andThrough.ts](https://github.com/sandlada/result/blob/main/src/operators/andThrough.ts)

#### Example

```ts
import { andThrough } from '@sandlada/result/operators';
import { pipe } from '@sandlada/result/composition';
import { ok, err } from '@sandlada/result/factories';

// Log and pass through on success:
pipe(
  ok('hello'),
  andThrough(v => { console.log(v); return ok('ignored'); }),
); // Ok('hello') — logs "hello"

// Propagate callback error:
pipe(
  ok('data'),
  andThrough(v => v.length > 0 ? ok(v) : err('empty')), // returns Err on invalid
); // Err('empty') if invalid, Ok('data') if valid
```

***

### ap()

Applicative `ap` — applies a function wrapped in a Result to a value wrapped in a Result.
If either the function or the value is a failure, the first failure propagates.

The function-result and value-result are allowed to have **different** error
types — the combined error widens to `E | F`. This matches the sibling
`bind` operator and supports heterogeneous-error pipelines.

fp-ts equivalent: `ap` / `ap(applyToValue, wrappedFn)`

```ts
export function ap<A, B, E, F>(
    fnResult: IResultOfT<(a: A) => B, E>,
): (result: IResultOfT<A, F>) => IResultOfT<B, E | F>;
export function ap<A, B, E, F>(
    fnResult: IResultOfT<(a: A) => B, E>,
    result: IResultOfT<A, F>,
): IResultOfT<B, E | F>;
```

Defined in: [operators/ap.ts](https://github.com/sandlada/result/blob/main/src/operators/ap.ts)

#### Example

```ts
import { ap } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';

ap(ok((x: number) => x * 2), ok(21)); // Ok(42)
ap(err<string>('fn failed'), ok(21)); // Err('fn failed')

// Both sides may fail with different error types; the result unions them.
const fn = err<TypeError>(new TypeError('nope'));
const value = err<RangeError>(new RangeError('range'));
ap(fn, value); // Err(TypeError | RangeError)
```

***

### bimap()

Simultaneous map over both success and failure variants.

**Throw policy**: If either `onOk` or `onErr` throws, the result converts to
`err(caughtError)`. The thrown value is captured **verbatim** and cast to the
declared error type, so without an `errorFn` the declared type is a structural
claim only. Pass `errorFn` to customise how the thrown value maps onto your
error union.

The curried form defers `<A2, E2>` to the application site so an input
with a different value or error type than the callbacks' parameter types
still typechecks — mirrors `map` / `mapErr`'s design.

```ts
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    errorFn?: (thrown: unknown) => unknown,
): <A2 extends A, E2 extends E>(r: IResultOfT<A2, E2>) => IResultOfT<C, F>;
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => F,
): IResultOfT<C, F>;
```

Defined in: [operators/bimap.ts](https://github.com/sandlada/result/blob/main/src/operators/bimap.ts)

#### Example

```ts
import { bimap } from '@sandlada/result/operators';
import { ok } from '@sandlada/result/factories';
bimap(x => x * 2, e => `!${e}`, ok(21)); // Ok(42)
```

***

### bind()

Chains a result-producing function (monadic bind). On success, calls `f` with the value and returns its result. On failure, short-circuits. The error type widens to `E | F`.

**Throw policy**: a synchronous throw from `f` propagates to the caller — it is
NOT caught and converted to `Err`. Matches the canonical Result throw policy
("sync throws propagate, async rejections are caught"). Use `bindAsync` or
wrap the call site with `tryCatch` if you need different semantics.

F# equivalent: `Result.bind f r`

```ts
export function bind<A, B, F>(
    f: (a: A) => IResultOfT<B, F>,
): <E>(r: IResultOfT<A, E>) => IResultOfT<B, E | F>;
export function bind<A, B, E, F>(
    f: (a: A) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
): IResultOfT<B, E | F>;
```

Defined in: [operators/bind.ts](https://github.com/sandlada/result/blob/main/src/operators/bind.ts)

#### Example

```ts
import { bind } from '@sandlada/result/operators';
import { pipe } from '@sandlada/result/composition';
import { ok, err } from '@sandlada/result/factories';
pipe(ok('Alice'), bind(name => name.length > 0 ? ok(name) : err('required')));
```

***

### catchErr()

Converts a failure into a success value, maintaining the Result track.

The recovery handler's return type (`B`) is **independent** of the input's value type
(`A`), so the fallback can be a structurally different shape (a default-object, a
sentinel, a value derived from the error, …). The result widens to
`IResultOfT<A | B, never>` because the recovered branch can produce either shape —
control-flow at the use site narrows `r.isSuccess` to `A` on the original track and
`r.value` to `A | B` overall (with `B` reachable only through the recovery path).

This is the canonical "catch error → produce a different shape" recovery. Compare
with `orElse`, which requires the callback to return a new `IResultOfT`; `catchErr`
simplifies that case by lifting `onErr(e)` straight into `Ok(...)` for you.

**Throw policy**: a synchronous throw from `onErr` propagates to the caller — it
is NOT caught and converted to `Err`. The recovery handler is the only escape
hatch for an `Err` source; making it swallow its own failures would hide bugs
that should surface. This matches the policy documented on `unwrapOrElse` and
`orThrow`. Wrap your `onErr` body in a `try/catch` locally if you need a
recoverable fallback.

Curried form. The inner `<A>` is **deferred** so the input's value type is
re-inferred at every application site — `catchErr(handler)(IResultOfT<A, E>)` widens
`A | B` per call instead of locking `A` at the currying boundary.

```ts
export function catchErr<B, E>(
    onErr: (e: E) => B,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A | B, never>;
export function catchErr<A, B, E>(
    onErr: (e: E) => B,
    r: IResultOfT<A, E>,
): IResultOfT<A | B, never>;
```

Defined in: [operators/catchErr.ts](https://github.com/sandlada/result/blob/main/src/operators/catchErr.ts)

#### Example

```ts
import { catchErr } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';

catchErr((e: string) => 0)(err('boom')); // Ok(0)
catchErr((e: string) => 0)(ok(42));     // Ok(42) — pass-through on success

// Cross-shape default — `A = { kind: 'Config' }`, `B = { kind: 'Default' }`,
// result widens to `IResultOfT<{ kind: 'Config' } | { kind: 'Default' }, never>`
const configResult = err<{ kind: 'Config' }>({ kind: 'Config' });
catchErr((e: { kind: 'Config' }) => ({ kind: 'Default', reason: e.kind }))(configResult);

// Direct form
catchErr((e: string) => ({ kind: 'Default' }), err('boom'));
// → Ok({ kind: 'Default' })
```

Direct form. `A` is inferred from the supplied result; the recovery widens to
`A | B`. The error track collapses to `never` because the recovery always succeeds.

***

### choose()

Maps an array with a function returning a Result, and keeps only the success values.

F# equivalent: `List.choose`

**Throw policy**: pure collector with no `Err` channel in its return type —
a synchronous throw from `fn` propagates to the caller; `Err` values are
skipped and collection continues.

```ts
export function choose<A, B, E>(
    fn: (a: A) => IResultOfT<B, E>,
): (items: readonly A[]) => B[];
export function choose<A, B, E>(
    fn: (a: A) => IResultOfT<B, E>,
    items: readonly A[],
): B[];
```

Defined in: [operators/choose.ts](https://github.com/sandlada/result/blob/main/src/operators/choose.ts)

#### Example

```ts
import { choose } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
const result = choose(x => x > 0 ? ok(x * 2) : err('neg'), [1, -2, 3]);
// [2, 6]
```

***

### contains()

Returns `true` if the result is success and the value equals `target`.

Rust equivalent: `result.contains(target)`

```ts
export function contains<A>(target: A): <E>(r: IResultOfT<A, E>) => boolean;
export function contains<A, E>(target: A, r: IResultOfT<A, E>): boolean;
```

Defined in: [operators/contains.ts](https://github.com/sandlada/result/blob/main/src/operators/contains.ts)

#### Example

```ts
import { contains } from '@sandlada/result/operators';
import { pipe } from '@sandlada/result/composition';
import { ok } from '@sandlada/result/factories';
pipe(ok(42), contains(42)); // true
```

***

### exists()

Returns `true` if the result is success and the predicate holds.

Rust equivalent: `result.is_ok_and(predicate)`

```ts
export function exists<A>(predicate: (a: A) => boolean): <E>(r: IResultOfT<A, E>) => boolean;
export function exists<A, E>(predicate: (a: A) => boolean, r: IResultOfT<A, E>): boolean;
```

Defined in: [operators/exists.ts](https://github.com/sandlada/result/blob/main/src/operators/exists.ts)

#### Example

```ts
import { exists } from '@sandlada/result/operators';
import { pipe } from '@sandlada/result/composition';
import { ok } from '@sandlada/result/factories';
pipe(ok(42), exists(x => x > 0)); // true
```

***

### expect()

Panics on failure — throws a `TypeError` with the given message. Returns the value on success.

Pass `throwingFn` to customise the error class — e.g.
`expect(msg, r, info => new MyError(info.message, info.value))`.
Without `throwingFn`, a built-in `TypeError` is thrown.

Rust equivalent: `result.expect("msg")`

```ts
export function expect<A, E>(msg: string): <A2 extends A>(r: IResultOfT<A2, E>) => A2;
export function expect<A, E>(msg: string, r: IResultOfT<A, E>): A;
export function expect<A, E>(
    msg: string,
    r: IResultOfT<A, E>,
    throwingFn: (info: { message: string; value: E }) => Error,
): A;
```

Defined in: [operators/expect.ts](https://github.com/sandlada/result/blob/main/src/operators/expect.ts)

#### Example

```ts
import { expect } from '@sandlada/result/operators';
import { ok } from '@sandlada/result/factories';
expect('should not fail', ok(42)); // 42
```

***

### expectErr()

Panics on success — throws a `TypeError` with the given message. Returns the error on failure.

Pass `throwingFn` to customise the error class — e.g.
`expectErr(msg, r, info => new MyError(info.message, info.value))`.
Without `throwingFn`, a built-in `TypeError` is thrown.

Rust equivalent: `result.expect_err("msg")`

```ts
export function expectErr<A, E>(msg: string): <E2 extends E>(r: IResultOfT<A, E2>) => E2;
export function expectErr<A, E>(msg: string, r: IResultOfT<A, E>): E;
export function expectErr<A, E>(
    msg: string,
    r: IResultOfT<A, E>,
    throwingFn: (info: { message: string; value: A }) => Error,
): E;
```

Defined in: [operators/expectErr.ts](https://github.com/sandlada/result/blob/main/src/operators/expectErr.ts)

#### Example

```ts
import { expectErr } from '@sandlada/result/operators';
import { err } from '@sandlada/result/factories';
expectErr('should fail', err('boom')); // 'boom'
```

***

### filterOrElse()

Filters a success value with a predicate. If the predicate holds, the original
success passes through. If it fails, returns `err(errorFn(value))`. Failures pass through unchanged.

Rust equivalent: `result.filter_or_else(errorFn, predicate)`

**Throw policy**: If either the predicate or `errorFn` throws, the result converts to
`err(caughtError)`. The thrown value is captured **verbatim** and cast to the
declared error type, so without a `throwErrorFn` the declared type is a
structural claim only. Pass `throwErrorFn` to customise how the thrown value
maps onto your error union.

```ts
export function filterOrElse<A, E>(
    predicate: (a: A) => boolean,
    errorFn: (a: A) => E,
    throwErrorFn?: (thrown: unknown) => unknown,
): (r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function filterOrElse<A, E>(
    predicate: (a: A) => boolean,
    errorFn: (a: A) => E,
    r: IResultOfT<A, E>,
    throwErrorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;
```

Defined in: [operators/filterOrElse.ts](https://github.com/sandlada/result/blob/main/src/operators/filterOrElse.ts)

#### Example

```ts
import { filterOrElse } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
filterOrElse((x: number) => x > 0, (x: number) => `${x} is not positive`, ok(5)); // Ok(5)
filterOrElse((x: number) => x > 0, (x: number) => `${x} is not positive`, ok(-1)); // Err("-1 is not positive")
filterOrElse((x: number) => x > 0, (x: number) => `${x} is not positive`, err('down')); // Err('down')
```

***

### flatten()

Flattens a nested result: `IResultOfT<IResultOfT<A, E>, E>` → `IResultOfT<A, E>`.

**Single-step only**: `flatten` unwraps exactly one layer. If the inner value is
itself a `Result` (e.g. `Result<Result<Result<A, E>, E>, E>`), call `flatten`
repeatedly until you reach the target depth.

Rust equivalent: `result.flatten()`

```ts
export function flatten<A, E>(r: IResultOfT<IResultOfT<A, E>, E>): IResultOfT<A, E>;
```

Defined in: [operators/flatten.ts](https://github.com/sandlada/result/blob/main/src/operators/flatten.ts)

#### Example

```ts
import { flatten } from '@sandlada/result/operators';
import { ok } from '@sandlada/result/factories';
flatten(ok(ok(42))); // Ok(42)
flatten(ok(ok(ok(7)))); // Ok(ok(7)) — call flatten again to reach Ok(7).
```

***

### map()

Transforms the success value. If the result is a failure, it is passed through unchanged.

**Throw policy**: If `f` throws, the result converts to `err(caughtError)`.
The thrown value is captured **verbatim** and cast to the declared error
type, so without an `errorFn` the declared type is a structural claim only.
Pass `errorFn` to customise how the thrown value maps onto your error union -
e.g. `map(f, e => new MyError(String(e)))`. An `errorFn` that throws itself is
collapsed the same way: the mapper's error becomes the error of the result,
it never escapes the Result wrapper.

F# equivalent: `Result.map f r`

```ts
export function map<A, B>(
    f: (a: A) => B,
    errorFn?: (thrown: unknown) => unknown,
): <E>(r: IResultOfT<A, E>) => IResultOfT<B, E>;
export function map<A, B, E>(
    f: (a: A) => B,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<B, E>;
```

Defined in: [operators/map.ts](https://github.com/sandlada/result/blob/main/src/operators/map.ts)

#### Example

```ts
import { map } from '@sandlada/result/operators';
import { pipe } from '@sandlada/result/composition';
import { ok } from '@sandlada/result/factories';
pipe(ok(5), map(x => x * 2)); // Ok(10)
```

***

### mapErr()

Transforms the error value. If the result is a success, it is passed through unchanged.

**Throw policy**: a synchronous throw from `f` propagates to the caller — it is
NOT caught and converted to `Err`. This matches the canonical Result throw
policy ("synchronous throws propagate, async rejections are caught"). If you
need `f`'s throw to become an `Err`, wrap the call site with `tryCatch`.

F# equivalent: `Result.mapError f r`

```ts
export function mapErr<E, F>(f: (e: E) => F): <A>(r: IResultOfT<A, E>) => IResultOfT<A, F>;
export function mapErr<A, E, F>(f: (e: E) => F, r: IResultOfT<A, E>): IResultOfT<A, F>;
```

Defined in: [operators/mapErr.ts](https://github.com/sandlada/result/blob/main/src/operators/mapErr.ts)

#### Example

```ts
import { mapErr } from '@sandlada/result/operators';
import { err } from '@sandlada/result/factories';
mapErr(e => `[wrapped] ${e}`, err('boom')); // Err('[wrapped] boom')
```

***

### mapOr()

Maps the success value, or returns `defaultValue` on failure. Equivalent to `map(fn).unwrapOr(defaultValue)` but more efficient.

```ts
export function mapOr<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B,
): (r: IResultOfT<A, E>) => B;
export function mapOr<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B,
    r: IResultOfT<A, E>,
): B;
```

Defined in: [operators/mapOr.ts](https://github.com/sandlada/result/blob/main/src/operators/mapOr.ts)

#### Example

```ts
import { mapOr } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
mapOr(-1, (x: number) => x * 2, ok(5)); // 10
mapOr(-1, (x: number) => x * 2, err('boom')); // -1
```

***

### mapOrElse()

Maps the success value, or computes a default from the error on failure. Equivalent to `map(fn).unwrapOrElse(onErr)` but more efficient.

```ts
export function mapOrElse<A, B, E>(
    onErr: (e: E) => B,
    fn: (a: A) => B,
): (r: IResultOfT<A, E>) => B;
export function mapOrElse<A, B, E>(
    onErr: (e: E) => B,
    fn: (a: A) => B,
    r: IResultOfT<A, E>,
): B;
```

Defined in: [operators/mapOrElse.ts](https://github.com/sandlada/result/blob/main/src/operators/mapOrElse.ts)

#### Example

```ts
import { mapOrElse } from '@sandlada/result/operators';
import { ok } from '@sandlada/result/factories';
mapOrElse((e: string) => 0, (x: number) => x * 2, ok(5)); // 10
```

***

### match()

Terminal handler — pattern-matches on both success and failure
cases. Supports both positional `(onOk, onErr, r?)` and object
`({ ok, err }, r?)` handler shapes, matching the convention used by
`match` in `@sandlada/result/async-result`. Prefer the object form for
consistency across the library.

F# equivalent: `function Ok v → onOk v | Error e → onErr e`

```ts
export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
): (r: IResultOfT<A, E>) => C;
export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
    r: IResultOfT<A, E>,
): C;
export function match<A, E, C>(
    handlers: MatchHandlers<A, E, C>,
): (r: IResultOfT<A, E>) => C;
export function match<A, E, C>(
    handlers: MatchHandlers<A, E, C>,
    r: IResultOfT<A, E>,
): C;
```

Defined in: [operators/match.ts](https://github.com/sandlada/result/blob/main/src/operators/match.ts)

#### Example

```ts
import { match } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';

// Positional form (back-compatible):
match(v => `success: ${v}`, e => `failure: ${e}`, ok(42)); // "success: 42"

// Object form (preferred):
match({ ok: v => `success: ${v}`, err: e => `failure: ${e}` }, ok(42));
// "success: 42"
```

***

### or()

Logical OR — returns `other` if `r` is failure, otherwise returns the original success.

Rust equivalent: `result.or(other)`

The curried form defers `E` (the input error type) to the application site,
so the returned function preserves heterogeneous inference rather than
widening the input's error to `unknown`.

```ts
export function or<A, F>(other: IResultOfT<A, F>): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E | F>;
export function or<A, E, F>(other: IResultOfT<A, F>, r: IResultOfT<A, E>): IResultOfT<A, E | F>;
```

Defined in: [operators/or.ts](https://github.com/sandlada/result/blob/main/src/operators/or.ts)

#### Example

```ts
import { or } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
import type { IResultOfT } from '@sandlada/result';
or(ok(2), ok(1)); // Ok(1)
or(ok(2), err('fail')); // Ok(2)

// Curried: error type is preserved per-application
const fn = or(ok(1) as IResultOfT<number, RangeError>);
const out = fn(err(new TypeError()) as IResultOfT<number, TypeError>);
// out: IResultOfT<number, RangeError | TypeError>
```

***

### orElse()

Error recovery — tries an alternative path on failure. On failure, calls `f` with the error and its result replaces this one. On success, passes through unchanged.

**Throw policy**: If `f` throws, the result converts to `err(caughtError)`.
The thrown value is captured **verbatim** and cast to the declared error
type, so without an `errorFn` the declared type is a structural claim only.
Pass `errorFn` to customise how the thrown value maps onto your error union.

```ts
export function orElse<E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    errorFn?: (thrown: unknown) => unknown,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A | B, F>;
export function orElse<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => F,
): IResultOfT<A | B, F>;
```

Defined in: [operators/orElse.ts](https://github.com/sandlada/result/blob/main/src/operators/orElse.ts)

#### Example

```ts
import { orElse } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
const fallback = orElse((e: string) => ok('default'), err('boom')); // Ok('default')
```

***

### orTee()

Side-effect on the error track. Calls `fn` with the error on failure
and passes the original result through unchanged. Unlike `orElse`, `fn`'s return value
(a `IResultOfT`) is **ignored** — even if `fn` returns a success, the original failure
is preserved.

**Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
The thrown value is captured **verbatim** and cast to the declared error
type, so without an `errorFn` the declared type is a structural claim only.
Pass `errorFn` to customise how the thrown value maps onto your error type
(canonical tap/tee policy - see AGENTS.md).

```ts
export function orTee<E, B, F>(
    fn: (e: E) => IResultOfT<B, F>,
    errorFn?: (thrown: unknown) => unknown,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function orTee<A, E, B, F>(
    fn: (e: E) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;
```

Defined in: [operators/orTee.ts](https://github.com/sandlada/result/blob/main/src/operators/orTee.ts)

#### Example

```ts
import { orTee } from '@sandlada/result/operators';
import { pipe } from '@sandlada/result/composition';
import { ok, err } from '@sandlada/result/factories';
pipe(
  err('boom'),
  orTee(e => { console.warn('error:', e); return ok('ignored'); }),
); // Err('boom') — logs "error: boom"

pipe(
  err('boom'),
  orTee(e => err('ignored-error')),
); // Err('boom') — fn's error is ignored
```

***

### orThrow()

Unwraps a result, throwing the error on failure.
`orThrow` throws the error directly (requires `E extends Error`).
`orThrowWith` transforms the error via a callback before throwing.

Rust equivalent: `result.unwrap()` / `result.expect("msg")`

```ts
export function orThrow<T, E extends Error>(r: IResultOfT<T, E>): T;
```

Defined in: [operators/orThrow.ts](https://github.com/sandlada/result/blob/main/src/operators/orThrow.ts)

#### Example

```ts
import { orThrow, orThrowWith } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';

orThrow(ok(42)); // 42
orThrow(err(new Error('boom'))); // throws Error('boom')

orThrowWith(e => new Error(`Custom: ${e}`), err('fail')); // throws Error('Custom: fail')
```

***

### orThrowWith()

Unwraps the success value, throwing a custom error on failure.
Transforms the error via `errorFn` before throwing.

Data-last curried — supports both direct and partial application.

```ts
export function orThrowWith<T, E>(
    errorFn: (error: E) => Error,
): <T2 extends T>(r: IResultOfT<T2, E>) => T2;
export function orThrowWith<T, E>(
    errorFn: (error: E) => Error,
    r: IResultOfT<T, E>,
): T;
```

Defined in: [operators/orThrow.ts](https://github.com/sandlada/result/blob/main/src/operators/orThrow.ts)

#### Param

**errorFn**

Transforms the error into an `Error` to throw.

#### Param

**r**

The result to unwrap (omitted for curried form).

#### Throws

The transformed error if the result is a failure.

***

### separate()

Partitions an array of Results into two arrays: successes and errors.

Rust equivalent: `results.into_iter().partition_map()` / `Iter::partition_result()`

```ts
export function separate<T, E>(results: readonly IResultOfT<T, E>[]): { ok: T[]; err: E[] };
```

Defined in: [operators/separate.ts](https://github.com/sandlada/result/blob/main/src/operators/separate.ts)

#### Example

```ts
import { separate } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
separate([ok(1), err('a'), ok(2), err('b')]); // { ok: [1, 2], err: ['a', 'b'] }
separate([]); // { ok: [], err: [] }
```

***

### swap()

Swaps success and failure: `Ok(v)` → `Err(v)`, `Err(e)` → `Ok(e)`.

Rust equivalent: `result.swap()`

```ts
export function swap<A, E>(r: IResultOfT<A, E>): IResultOfT<E, A>;
```

Defined in: [operators/swap.ts](https://github.com/sandlada/result/blob/main/src/operators/swap.ts)

#### Example

```ts
import { swap } from '@sandlada/result/operators';
import { ok } from '@sandlada/result/factories';
swap(ok(42)); // Err(42)
```

***

### tap()

Side-effect on the success track. Calls `fn` with the value on success
and passes the original result through unchanged.

**Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
Pass `errorFn` to customise how the thrown value maps onto your error type —
e.g. `tap(v => persist(v), thrown => new MyError(String(thrown)))` — so the
result's `error` matches your domain shape (canonical tap/tee policy).

Without `errorFn` the thrown value is cast to the input result's `E`. For a
typed `E` like a tagged-union `MyError`, prefer supplying `errorFn` so the
runtime payload is not silently widened.

```ts
export function tap<A>(
    fn: (a: A) => void,
    errorFn?: (thrown: unknown) => unknown,
): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function tap<A, E>(
    fn: (a: A) => void,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;
```

Defined in: [operators/tap.ts](https://github.com/sandlada/result/blob/main/src/operators/tap.ts)

#### Example

```ts
import { tap } from '@sandlada/result/operators';
import { pipe } from '@sandlada/result/composition';
import { ok } from '@sandlada/result/factories';
pipe(ok('hello'), tap(v => console.log('got:', v)));
```

***

### tapErr()

Side-effect on the failure track. Calls `fn` with the error on failure
and passes the original result through unchanged.

**Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
The thrown value is captured **verbatim** and cast to the declared error
type, so without an `errorFn` the declared type is a structural claim only.
Pass `errorFn` to customise how the thrown value maps onto your error type
(canonical tap/tee policy - see AGENTS.md).

```ts
export function tapErr<E>(
    fn: (e: E) => void,
    errorFn?: (thrown: unknown) => unknown,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function tapErr<A, E>(
    fn: (e: E) => void,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;
```

Defined in: [operators/tapErr.ts](https://github.com/sandlada/result/blob/main/src/operators/tapErr.ts)

#### Example

```ts
import { tapErr } from '@sandlada/result/operators';
import { err } from '@sandlada/result/factories';
tapErr(e => console.log('err:', e), err('boom'));
```

***

### traverseArray()

Applies a Result-returning function to every element in an array and collects
the results. Short-circuits on the first failure (like `Promise.all`).

The callback `fn` receives each element **and its zero-based index** in the source
array — useful for debugging or for results that depend on positional context.

Rust equivalent: `iter.map(fn).collect::<Result<Vec<_>, _>>()`

```ts
export function traverseArray<A, B, E>(
    fn: (item: A, index: number) => IResultOfT<B, E>,
): (items: readonly A[]) => IResultOfT<B[], E>;
export function traverseArray<A, B, E>(
    fn: (item: A, index: number) => IResultOfT<B, E>,
    items: readonly A[],
): IResultOfT<B[], E>;
```

Defined in: [operators/traverseArray.ts](https://github.com/sandlada/result/blob/main/src/operators/traverseArray.ts)

#### Example

```ts
import { traverseArray } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
traverseArray(x => x > 0 ? ok(x * 2) : err('neg'), [1, 2, 3]); // Ok([2, 4, 6])
traverseArray(x => x > 0 ? ok(x * 2) : err('neg'), [1, -1, 3]); // Err('neg')
traverseArray((x, i) => ok(`${i}:${x}`), ['a', 'b']); // Ok(['0:a', '1:b'])
```

***

### unsafeUnwrap()

Throws on failure — returns the success value on success.
Unlike `unwrap`, this function does **not** constrain the error type `E`.
The raw error object is thrown directly (not wrapped in a `TypeError`).

**Use with care** — this is primarily a testing/escape-hatch utility.
Prefer `unwrap` for code paths where the error type is `Error`.

```ts
export function unsafeUnwrap<A, E>(r: IResultOfT<A, E>): A;
```

Defined in: [operators/unsafeUnwrap.ts](https://github.com/sandlada/result/blob/main/src/operators/unsafeUnwrap.ts)

#### Example

```ts
import { unsafeUnwrap } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
unsafeUnwrap(ok(42)); // 42
unsafeUnwrap(err('boom')); // throws 'boom'
```

***

### unsafeUnwrapErr()

Throws on success — returns the error value on failure.
Unlike `unwrapErr`, this function does **not** constrain the error type `E`.
The raw success value is thrown directly (not wrapped in a `TypeError`).

**Use with care** — this is primarily a testing/escape-hatch utility.
Prefer `unwrapErr` for code paths where the error type is `Error`.

```ts
export function unsafeUnwrapErr<A, E>(r: IResultOfT<A, E>): E;
```

Defined in: [operators/unsafeUnwrapErr.ts](https://github.com/sandlada/result/blob/main/src/operators/unsafeUnwrapErr.ts)

#### Example

```ts
import { unsafeUnwrapErr } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
unsafeUnwrapErr(err('boom')); // 'boom'
unsafeUnwrapErr(ok(42)); // throws 42
```

***

### unwrap()

Panics on failure — throws a `TypeError` with the error payload. Returns the value on success.

Pass `throwingFn` to customise the error class — e.g. `unwrap(r, info => new MyError(info.message, info.value))`.
Without `throwingFn`, a built-in `TypeError` is thrown with `String(r.error)` interpolated.

Rust equivalent: `result.unwrap()`

```ts
export function unwrap<T, E>(r: IResultOfT<T, E>, throwingFn?: (info: { message: string; value: E }) => Error): T;
```

Defined in: [operators/unwrap.ts](https://github.com/sandlada/result/blob/main/src/operators/unwrap.ts)

#### Example

```ts
import { unwrap } from '@sandlada/result/operators';
import { ok } from '@sandlada/result/factories';
unwrap(ok(42)); // 42
```

***

### unwrapErr()

Panics on success — throws a `TypeError`. Returns the error on failure.

Pass `throwingFn` to customise the error class — e.g.
`unwrapErr(r, info => new MyError(info.message, info.value))`.
Without `throwingFn`, a built-in `TypeError` is thrown.

Rust equivalent: `result.unwrap_err()`

```ts
export function unwrapErr<A, E>(r: IResultOfT<A, E>, throwingFn?: (info: { message: string; value: A }) => Error): E;
```

Defined in: [operators/unwrapErr.ts](https://github.com/sandlada/result/blob/main/src/operators/unwrapErr.ts)

#### Example

```ts
import { unwrapErr } from '@sandlada/result/operators';
import { err } from '@sandlada/result/factories';
unwrapErr(err('boom')); // 'boom'
```

***

### unwrapOr()

Extracts the value on success, or returns a default on failure. Never throws.

The `A` generic is widened from the literal — e.g. `unwrapOr(0)` infers `A = number`, not `A = 0`, so the operator composes with `IResultOfT<number,
E>` inputs. Without this widening, bare usage locks the success type to
the literal value of the default.

F# equivalent: `Result.defaultValue def r`

```ts
export function unwrapOr<A>(defaultValue: A): <E>(r: IResultOfT<A, E>) => A;
export function unwrapOr<A, E>(defaultValue: A, r: IResultOfT<A, E>): A;
```

Defined in: [operators/unwrapOr.ts](https://github.com/sandlada/result/blob/main/src/operators/unwrapOr.ts)

#### Example

```ts
import { unwrapOr } from '@sandlada/result/operators';
import { pipe } from '@sandlada/result/composition';
import { ok, err } from '@sandlada/result/factories';
pipe(ok(42), unwrapOr(0)); // 42
pipe(err('boom'), unwrapOr(0)); // 0
```

***

### unwrapOrElse()

Extracts the value on success, or computes a default from the error on failure (lazy).

**Throw policy**: Like `match`, exceptions thrown by `onErr` **propagate** to the
caller. Ensure `onErr` does not throw, or wrap it with `tryCatch` first if you need a
recoverable fallback.

F# equivalent: `Result.defaultWith f r`

```ts
export function unwrapOrElse<A, E>(onErr: (e: E) => A): (r: IResultOfT<A, E>) => A;
export function unwrapOrElse<A, E>(onErr: (e: E) => A, r: IResultOfT<A, E>): A;
```

Defined in: [operators/unwrapOrElse.ts](https://github.com/sandlada/result/blob/main/src/operators/unwrapOrElse.ts)

#### Example

```ts
import { unwrapOrElse } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
unwrapOrElse((e: Error) => 0, ok(42)); // 42
unwrapOrElse((e: Error) => 0, err(new Error('boom'))); // 0
```

***

### unzip()

Unzips a Result containing a tuple into a tuple of Results.

Rust equivalent: `Result::unzip`

```ts
export function unzip<A, B, E>(
    r: IResultOfT<readonly [A, B], E>,
): [IResultOfT<A, E>, IResultOfT<B, E>];
```

Defined in: [operators/unzip.ts](https://github.com/sandlada/result/blob/main/src/operators/unzip.ts)

#### Example

```ts
import { unzip } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
unzip(ok([1, 'a'])); // [Ok(1), Ok('a')]
unzip(err('e')); // [Err('e'), Err('e')]
```
