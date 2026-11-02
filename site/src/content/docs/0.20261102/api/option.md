---
title: "Option operators: map, bind, match"
description: "Operators for IOption<T>: ofSome, ofNone, map, bind, filter,
  orElse, okOr, traverseArray and all — every callback throw becomes None."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/option
---

Option FP (batteries included) — barrel export.

Re-exports everything from the sub-modules: core constructors (`ofSome`/`ofNone`)
and operators for use in point-free pipelines.

## Functions

### all()

Combines a tuple/array of Options, preserving heterogeneous types.
Returns the first None or a Some of all values. Like `Promise.all` but for Option.

Two overloads:

* Tuple overload (`readonly [IOption<unknown>, ...IOption<unknown>[]]`):
  preserves per-position types — `all([ofSome(1), ofSome('hi')])` yields
  `IOption<readonly [number, string]>`.
* Array overload (`readonly IOption<T>[]`): collapses every element to a single
  homogeneous type `T`, yielding `IOption<T[]>` - fits runtime-sized arrays that
  are not literal tuples.

**Empty input (cross-module note)**: the three combiners of the library give
three different types for "combine nothing" - `combine([])` yields
`IResultOfT<[], never>`, `combine/all([])` yields `IResultOfT<unknown[], unknown>`
and `option/all([])` yields `IOption<unknown[]>`. The runtime behaviour is the
same everywhere (an empty success); only the static type differs.

```ts
export function all<T extends readonly [IOption<unknown>, ...IOption<unknown>[]]>(
    options: T,
): IOption<
    { [K in keyof T]: T[K] extends IOption<infer V> ? V : never }
>;
export function all<T>(options: readonly IOption<T>[]): IOption<T[]>;
```

Defined in: [option/all.ts](https://github.com/sandlada/result/blob/main/src/option/all.ts)

#### Example

```ts
import { all, ofSome, ofNone } from '@sandlada/result/option';
import type { IOption } from '@sandlada/result';

// Tuple — heterogeneous types preserved.
all([ofSome(1), ofSome('hi'), ofSome(true)]);
// Some([1, 'hi', true])

// Array — runtime-sized homogeneous list.
const opts: IOption<number>[] = [ofSome(1), ofSome(2), ofSome(3)];
all(opts);
// Some([1, 2, 3])

all([ofSome(1), ofNone(), ofSome(true)]);
// None
```

***

### bind()

Chains an Option-returning function (monadic bind for Option). On None, short-circuits.

Data-last and curried: `bind(fn)(option)`. The direct form
`bind(fn, option)` is supported as well.

```ts
export function bind<T, U>(fn: (value: T) => IOption<U>): (opt: IOption<T>) => IOption<U>;
export function bind<T, U>(fn: (value: T) => IOption<U>, opt: IOption<T>): IOption<U>;
```

Defined in: [option/bind.ts](https://github.com/sandlada/result/blob/main/src/option/bind.ts)

#### Example

```ts
import { bind } from '@sandlada/result/option';
import { pipe } from '@sandlada/result/composition';
import { ofSome, ofNone } from '@sandlada/result/option';
pipe(ofSome(21), bind(n => n > 0 ? ofSome(n * 2) : ofNone<number>()));
```

***

### contains()

Returns `true` if the Option is Some and the value equals `target`.

Data-last and curried: `contains(target)(option)`. The direct form
`contains(target, option)` is supported as well.

```ts
export function contains<T>(target: T): (opt: IOption<T>) => boolean;
export function contains<T>(target: T, opt: IOption<T>): boolean;
```

Defined in: [option/contains.ts](https://github.com/sandlada/result/blob/main/src/option/contains.ts)

#### Example

```ts
import { contains, ofSome } from '@sandlada/result/option';
import { pipe } from '@sandlada/result/composition';

pipe(ofSome(42), contains(42)); // true
pipe(ofSome(42), contains(0)); // false
```

***

### filter()

Returns None if the predicate returns `false`. Otherwise passes through unchanged.

Data-last and curried: `filter(predicate)(option)`. The direct form
`filter(predicate, option)` is supported as well.

```ts
export function filter<T>(predicate: (value: T) => boolean): (opt: IOption<T>) => IOption<T>;
export function filter<T>(predicate: (value: T) => boolean, opt: IOption<T>): IOption<T>;
```

Defined in: [option/filter.ts](https://github.com/sandlada/result/blob/main/src/option/filter.ts)

#### Example

```ts
import { filter, ofSome } from '@sandlada/result/option';
import { pipe } from '@sandlada/result/composition';

pipe(ofSome(42), filter(n => n > 100)); // None
pipe(ofSome(42), filter(n => n > 0)); // Some(42)
```

***

### flatten()

Flattens a nested Option: `IOption<IOption<T>>` → `IOption<T>`.

```ts
export function flatten<T>(opt: IOption<IOption<T>>): IOption<T>;
```

Defined in: [option/flatten.ts](https://github.com/sandlada/result/blob/main/src/option/flatten.ts)

#### Example

```ts
import { flatten, ofSome } from '@sandlada/result/option';

flatten(ofSome(ofSome(42))); // Some(42)
```

***

### map()

Transforms the value if Some. On None, passes through unchanged.

Data-last and curried: `map(fn)(option)`. The direct form
`map(fn, option)` is supported as well.

```ts
export function map<T, U>(fn: (value: T) => U): (opt: IOption<T>) => IOption<U>;
export function map<T, U>(fn: (value: T) => U, opt: IOption<T>): IOption<U>;
```

Defined in: [option/map.ts](https://github.com/sandlada/result/blob/main/src/option/map.ts)

#### Example

```ts
import { map, ofSome } from '@sandlada/result/option';
import { pipe } from '@sandlada/result/composition';

pipe(ofSome(5), map(x => x * 2)); // Some(10)
```

***

### match()

Terminal — pattern-matches on both Some and None. Supports both
positional `(onSome, onNone, opt?)` and object `({ some, none }, opt?)`
handler shapes, matching the convention used by
`match` in `@sandlada/result/async-option`. Prefer the object form.

```ts
export function match<T, U>(
    onSome: (value: T) => U,
    onNone: () => U,
): (opt: IOption<T>) => U;
export function match<T, U>(
    onSome: (value: T) => U,
    onNone: () => U,
    opt: IOption<T>,
): U;
export function match<T, U>(
    handlers: MatchOptionHandlers<T, U>,
): (opt: IOption<T>) => U;
export function match<T, U>(
    handlers: MatchOptionHandlers<T, U>,
    opt: IOption<T>,
): U;
```

Defined in: [option/match.ts](https://github.com/sandlada/result/blob/main/src/option/match.ts)

#### Example

```ts
import { match, ofSome } from '@sandlada/result/option';
import { pipe } from '@sandlada/result/composition';

// Positional form (back-compatible):
pipe(ofSome(42), match(v => `value: ${v}`, () => 'nothing')); // "value: 42"

// Object form (preferred):
match({ some: v => `value: ${v}`, none: () => 'nothing' }, ofSome(42));
// "value: 42"
```

***

### ofNone()

Creates a `None` variant of [IOption](/0.20261102/api/types/#ioption) — represents absence of a value.

The returned object is a **singleton** — every call returns the same frozen
reference. The internal object is deep-frozen at module load, and the
`IOptionNone` interface marks every field `readonly`, so the singleton
cannot be mutated at runtime or via TypeScript.

Generic over `T` so the result can be substituted into any `IOption<T>`
slot. `T` defaults to `unknown` so a bare `ofNone()` slots into any
`IOption<X>` declaration via contextual typing — letting the surrounding
`const x: IOption<number> = ofNone()` flow without an explicit generic. The
`T` parameter is purely a type-level slot marker; the runtime payload
carries no value.

```ts
export function ofNone<T = unknown>(): IOption<T>;
```

Defined in: [option/ofNone.ts](https://github.com/sandlada/result/blob/main/src/option/ofNone.ts)

#### Example

```ts
import { ofNone } from '@sandlada/result/option';
import type { IOption } from '@sandlada/result';

// Contextual typing widens `unknown` to `number` here.
const a: IOption<number> = ofNone();

// Explicit generic still works when no contextual type is available.
const b = ofNone<string>();

// Every call returns the same frozen object.
const x = ofNone<number>();
const y = ofNone<string>();
x === y; // true
```

***

### ofSome()

Creates a `Some` variant of `IOption` containing a value.

```ts
export function ofSome<T>(value: T): IOption<T>;
```

Defined in: [option/ofSome.ts](https://github.com/sandlada/result/blob/main/src/option/ofSome.ts)

#### Example

```ts
import { ofSome } from '@sandlada/result/option';
ofSome(42); // { isSome: true, isNone: false, value: 42 }
```

***

### okOr()

Converts an `IOption<T>` to `IResultOfT<T, E>`. On Some, returns
`ok(value)`. On None, returns `err(error)`.

Data-last and curried: `okOr(error)(option)`. The direct form
`okOr(error, option)` is supported as well.

```ts
export function okOr<E>(error: E): <T>(opt: IOption<T>) => IResultOfT<T, E>;
export function okOr<E, T>(error: E, opt: IOption<T>): IResultOfT<T, E>;
```

Defined in: [option/okOr.ts](https://github.com/sandlada/result/blob/main/src/option/okOr.ts)

#### Example

```ts
import { okOr, ofSome, ofNone } from '@sandlada/result/option';
import { pipe } from '@sandlada/result/composition';

pipe(ofSome(42), okOr('missing')); // Ok(42)
pipe(ofNone(), okOr('missing')); // Err('missing')
```

***

### okOrElse()

Converts an `IOption<T>` to `IResultOfT<T, E | Error>`. On Some, returns
`ok(value)`. On None, calls `errorFn()` and returns `err(errorFn())`.

The error is computed lazily - `errorFn` is only called when the option is None.

**Throw policy**: if `errorFn()` throws synchronously, the thrown value is
captured as the result `error`. Because the thrown value can be any `unknown`,
the return type is widened to `IResultOfT<T, E | Error>` - the runtime error
may be an Error instance even when the user-declared `E` is something else.
A thrown value that is not an `Error` instance is wrapped in one (the
original value stays available through `cause`), so the declared error type
holds for every value the caller can receive.
Callers who want a precise error shape should wrap their `errorFn` body in a
try/catch and return their own `E` instead of relying on this catch.

The function signature accepts a synchronous `() => E`; passing an async
function is **not supported** - any returned Promise will be coerced via
`err(Promise)`. Bridge the async work yourself and return its settled
value from a synchronous thunk.

Data-last and curried: `okOrElse(errorFn)(option)`. The direct form
`okOrElse(errorFn, option)` is supported as well.

```ts
export function okOrElse<E>(errorFn: () => E): <T>(opt: IOption<T>) => IResultOfT<T, E | Error>;
export function okOrElse<E, T>(errorFn: () => E, opt: IOption<T>): IResultOfT<T, E | Error>;
```

Defined in: [option/okOrElse.ts](https://github.com/sandlada/result/blob/main/src/option/okOrElse.ts)

#### Example

```ts
import { okOrElse, ofSome, ofNone } from '@sandlada/result/option';
import { pipe } from '@sandlada/result/composition';

pipe(ofSome(42), okOrElse(() => 'missing')); // Ok(42)
pipe(ofNone(),  okOrElse(() => 'missing')); // Err('missing')

// The return type is widened to IResultOfT<T, E | Error> to reflect the
// catch-block's runtime payload when `errorFn` throws.
pipe(ofNone(), okOrElse(() => { throw new Error('boom'); }));
```

***

### orElse()

Falls back to an alternative `IOption` if the input is `None`.
On `Some`, the input is passed through unchanged.

The fallback's value type (`U`) is independent of the input's value type (`T`),
so a recovery can return a structurally broader or different value — the
resulting carrier is `IOption<T | U>`. Pattern-matching on the result narrows
to `T` on the original `Some` and to `U` on the recovered branch.

Curried form. The inner `<T>` is **deferred** so the option's value type is
re-inferred at every application site — `orElse(fn)(IOption<User>)` and
`orElse(fn)(IOption<number>)` both typecheck.

```ts
export function orElse<U>(fn: () => IOption<U>): <T>(opt: IOption<T>) => IOption<T | U>;
export function orElse<T, U>(fn: () => IOption<U>, opt: IOption<T>): IOption<T | U>;
```

Defined in: [option/orElse.ts](https://github.com/sandlada/result/blob/main/src/option/orElse.ts)

#### Example

```ts
import { orElse, ofSome, ofNone } from '@sandlada/result/option';
import { pipe } from '@sandlada/result/composition';

pipe(ofNone(),  orElse(() => ofSome(42))); // Some(42)
pipe(ofSome(5), orElse(() => ofSome(42))); // Some(5) (pass-through)

// Cross-type recovery — `T = number`, `U = string`, result is `IOption<number | string>`
pipe(ofSome(1), orElse(() => ofSome('anonymous')));

// Direct form
orElse(() => ofSome('fallback'), ofNone()); // Some('fallback')
```

Direct form. `T` is inferred from the supplied option; the result widens to `T | U`.

***

### tap()

Side-effect on the Some track. Calls `fn` with the value and passes the
original Option through unchanged.

**Throw policy**: If `fn` throws, the Option converts to `None`
(canonical tap/tee policy - see AGENTS.md).

Data-last and curried: `tap(fn)(option)`. The direct form `tap(fn, option)`
is supported as well.

```ts
export function tap<T>(fn: (value: T) => void): (opt: IOption<T>) => IOption<T>;
export function tap<T>(fn: (value: T) => void, opt: IOption<T>): IOption<T>;
```

Defined in: [option/tap.ts](https://github.com/sandlada/result/blob/main/src/option/tap.ts)

#### Example

```ts
import { tap, ofSome } from '@sandlada/result/option';
import { pipe } from '@sandlada/result/composition';

pipe(ofSome('hello'), tap(v => console.log('got:', v)));
```

***

### transpose()

Transposes an `IOption<IResultOfT<T, E>>` into `IResultOfT<IOption<T>, E>`.

* `Some(Ok(v))` → `Ok(Some(v))`
* `Some(Err(e))` → `Err(e)`
* `None` → `Ok(None)`

```ts
export function transpose<T, E>(
    opt: IOption<IResultOfT<T, E>>,
): IResultOfT<IOption<T>, E>;
```

Defined in: [option/transpose.ts](https://github.com/sandlada/result/blob/main/src/option/transpose.ts)

#### Example

```ts
import { transpose, ofSome, ofNone } from '@sandlada/result/option';
import { ok, err } from '@sandlada/result/factories';
import type { IResultOfT } from '@sandlada/result';

transpose(ofSome(ok(42))); // Ok(Some(42))
transpose(ofSome(err('boom'))); // Err('boom')
transpose(ofNone<IResultOfT<number, string>>()); // Ok(None)
```

***

### traverse()

Iterable overload of [traverseArray](/0.20261102/api/option/#traversearray): maps a generic `Iterable` with an
Option-returning function, short-circuiting on the first `None`. Useful for
generators, `Set`/`Map`, and custom iterables whose length isn't known up front.

```ts
export function traverse<A, B>(
    fn: (a: A) => IOption<B>,
): (items: Iterable<A>) => IOption<B[]>;
export function traverse<A, B>(
    fn: (a: A) => IOption<B>,
    items: Iterable<A>,
): IOption<B[]>;
```

Defined in: [option/traverseArray.ts](https://github.com/sandlada/result/blob/main/src/option/traverseArray.ts)

#### Example

```ts
import { traverse, ofSome } from '@sandlada/result/option';

function* gen(): IterableIterator<number> { yield 1; yield 2; yield 3; }
traverse(x => ofSome(x * 2), gen()); // Some([2, 4, 6])
```

***

### traverseArray()

Traverses an array of elements, mapping them with a function that returns an Option.
Short-circuits and returns `None` if the mapping function ever returns `None`.
A synchronous throw from the callback — or from the iterator's `next()` —
is captured as `None` (module policy). Otherwise, returns a `Some` containing
an array of the mapped values.

Two overloads:

* `Iterable<A>` — generic stream input (generators, sets, custom iterables).
* `readonly A[]` — concrete-array input with optional `(a, index)` callback.

fp-ts equivalent: `Array.traverse(Option.Applicative)`

```ts
export function traverseArray<A, B>(
    fn: (a: A, i: number) => IOption<B>,
): (items: readonly A[]) => IOption<B[]>;
export function traverseArray<A, B>(
    fn: (a: A, i: number) => IOption<B>,
    items: readonly A[],
): IOption<B[]>;
```

Defined in: [option/traverseArray.ts](https://github.com/sandlada/result/blob/main/src/option/traverseArray.ts)

#### Example

```ts
import { traverseArray, traverse, ofSome, ofNone } from '@sandlada/result/option';
traverseArray(x => x > 0 ? ofSome(x * 2) : ofNone(), [1, 2, 3]); // Some([2, 4, 6])
traverseArray(x => x > 0 ? ofSome(x * 2) : ofNone(), [1, -1, 3]); // None

// Iterable overload - use `traverse` for generators and other iterables.
function* gen(): IterableIterator<number> { yield 1; yield 2; yield 3; }
traverse(x => ofSome(x * 2), gen()); // Some([2, 4, 6])
```

***

### unwrapOr()

Extracts the value on Some, or returns a default on None. Never throws.

The default value's type (`D`) is independent of the option's value type (`T`), so a
sentinel of a different shape — `null`, `undefined`, a default-value object, a string —
can be substituted at the call site without re-typing the option. The result is
`T | D`, narrowing to `T` on `Some` and to `D` on `None` via standard control-flow
analysis at the use site.

Curried form. The inner `<T>` is **deferred** so the option's value type is
re-inferred at every application site — `unwrapOr(default)(IOption<User>)` and
`unwrapOr(default)(IOption<string>)` both typecheck, and both produce
`T | D` for their respective `T`.

```ts
export function unwrapOr<D>(defaultValue: D): <T>(opt: IOption<T>) => T | D;
export function unwrapOr<T, D>(defaultValue: D, opt: IOption<T>): T | D;
```

Defined in: [option/unwrapOr.ts](https://github.com/sandlada/result/blob/main/src/option/unwrapOr.ts)

#### Example

```ts
import { unwrapOr, ofSome, ofNone } from '@sandlada/result/option';
import { pipe } from '@sandlada/result/composition';

pipe(ofSome(42), unwrapOr(0)); // 42
pipe(ofNone(),   unwrapOr(0)); // 0

// Cross-shape default — `T = number`, `D = null`, result is `number | null`
pipe(ofSome(1), unwrapOr(null));

// Direct form: `T = 'high' | 'low'`, `D = 'low'`, result narrows naturally
unwrapOr('low', ofSome('high')); // 'high'
unwrapOr('low', ofNone());       // 'low'
```

Direct form. `T` is inferred from the supplied option.

***

### zipWith()

Combines N Options (N ≥ 2) with a function. If all are Some,
returns `Some(fn(a, b, ...))`. If any is None, returns None. If the callback
throws, returns None.

The arity of `fn` fixes the number of Options accepted — variadic via tuple
inference. The catch-all mapped-type variadic handles every arity ≥ 2 in a
single pair of overloads.

**Design note (type safety):** This file intentionally does NOT declare
per-arity overloads like `zipWith<A, B, R>(fn: (a, b) => R): ...`. TypeScript's
function-type bivariance would let a 2-argument `fn` match a 3-argument
overload (with the third parameter silently ignored), and a 0-argument `fn`
match a 2-argument curried form. The single variadic below avoids both holes:
`T` is inferred from `fn`'s actual parameter list, and the constraint
`readonly [unknown, unknown, ...unknown[]]` requires ≥ 2 elements.

```ts
export function zipWith<T extends readonly [unknown, unknown, ...unknown[]], R>(
    fn: (...args: T) => R,
): (...options: { [K in keyof T]: IOption<T[K]> }) => IOption<R>;
export function zipWith<T extends readonly [unknown, unknown, ...unknown[]], R>(
    fn: (...args: T) => R,
    ...options: { [K in keyof T]: IOption<T[K]> }
): IOption<R>;
```

Defined in: [option/zipWith.ts](https://github.com/sandlada/result/blob/main/src/option/zipWith.ts)

#### Example

```ts
import { zipWith, ofSome, ofNone } from '@sandlada/result/option';
import type { IOption } from '@sandlada/result';

// Arity 2
zipWith((a: number, b: string) => `${a}-${b}`)(ofSome(1), ofSome('a'));
// Some('1-a')

// Arity 5
zipWith(
    (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e,
)(ofSome(1), ofSome(2), ofSome(3), ofSome(4), ofSome(5));
// Some(15)

// Any None short-circuits to None.
zipWith((a: number, b: number) => a + b)(ofSome(1), ofNone() as IOption<number>);
// None
```
