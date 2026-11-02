---
title: Promise Option operators
description: "Eager operators on Promise of Option: map, bind, filter, orElse,
  okOr, match plus async map, bind and tap variants."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/promise-option
---

Eager operators on Promise of Option — barrel export.

Mirrors the structure of `promise-result/` but for the Option type.
For lifting sync Option into Promise of Option, see `../bridge-option/index.js`.

## Functions

### bindAsync()

Chains an async option-returning function. `fn` can return `IOption` or `Promise<IOption>`.

**Throw policy**: if `fn` throws synchronously or its returned Promise rejects,
the result is `None`. The thrown reason is discarded.

```ts
export function bindAsync<T, U>(
    f: (a: T) => IOption<U> | Promise<IOption<U>>,
): (r: Promise<IOption<T>>) => Promise<IOption<U>>;
export function bindAsync<T, U>(
    f: (a: T) => IOption<U> | Promise<IOption<U>>,
    r: Promise<IOption<T>>,
): Promise<IOption<U>>;
```

Defined in: [promise-option/bindAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/bindAsync.ts)

#### Example

```ts
import { bindAsync } from '@sandlada/result/promise-option';
import { ofSome, ofNone } from '@sandlada/result/option';
await bindAsync(
  (x: number) => x > 0 ? Promise.resolve(ofSome(x * 2)) : Promise.resolve(ofNone()),
  Promise.resolve(ofSome(21)),
);
```

***

### containsAsync()

Returns true if the `Promise<IOption>` is Some and contains the given value.

```ts
export function containsAsync<T>(
    value: T,
): (r: Promise<IOption<T>>) => Promise<boolean>;
export function containsAsync<T>(
    value: T,
    r: Promise<IOption<T>>,
): Promise<boolean>;
```

Defined in: [promise-option/containsAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/containsAsync.ts)

#### Example

```ts
import { containsAsync } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
const r = await containsAsync(42, Promise.resolve(ofSome(42))); // true
```

***

### existsAsync()

Returns true if the `Promise<IOption>` is Some and the predicate holds.
Returns false on None or when the predicate does not hold.

**Throw policy**: If the predicate throws synchronously or returns a rejected
Promise, the error is caught and the result converts to `false`
(canonical catch+convert policy — see AGENTS.md).

```ts
export function existsAsync<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
): (r: Promise<IOption<T>>) => Promise<boolean>;
export function existsAsync<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
    r: Promise<IOption<T>>,
): Promise<boolean>;
```

Defined in: [promise-option/existsAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/existsAsync.ts)

#### Example

```ts
import { existsAsync } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
const r = await existsAsync(async (x: number) => x > 10, Promise.resolve(ofSome(42)));
// true
```

***

### filterAsync()

Filters the value of a `Promise<IOption<T>>` with a predicate.
Keeps the Some if the predicate holds; converts to None otherwise. None passes through.

**Throw policy**: If the predicate throws synchronously or returns a rejected
Promise, the error is caught and the result converts to `None`
(canonical catch+convert policy — see AGENTS.md).

```ts
export function filterAsync<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function filterAsync<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
    r: Promise<IOption<T>>,
): Promise<IOption<T>>;
```

Defined in: [promise-option/filterAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/filterAsync.ts)

#### Example

```ts
import { filterAsync } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
const r = await filterAsync(async (x: number) => x > 10, Promise.resolve(ofSome(21)));
// Some(21)
```

***

### flattenAsync()

Flattens a nested `Promise<IOption<IOption<T>>>`.

**Single-step only**: unwraps exactly one layer. Call `flattenAsync`
repeatedly to flatten deeper nests.

```ts
export function flattenAsync<T>(
    r: Promise<IOption<IOption<T>>>,
): Promise<IOption<T>>;
```

Defined in: [promise-option/flattenAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/flattenAsync.ts)

#### Example

```ts
import { flattenAsync } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
const r = await flattenAsync(Promise.resolve(ofSome(ofSome(42)))); // Some(42)
const r2 = await flattenAsync(Promise.resolve(ofSome(ofSome(ofSome(7))))); // Some(Some(7))
```

***

### mapAsync()

Transforms the value of a `Promise<IOption<T>>`. The callback may be sync or async.

**Throw policy**: if `f` throws synchronously or its returned Promise rejects,
the result is `None`. The thrown reason is discarded.

```ts
export function mapAsync<T, U>(
    f: (a: T) => U | Promise<U>,
): (r: Promise<IOption<T>>) => Promise<IOption<U>>;
export function mapAsync<T, U>(
    f: (a: T) => U | Promise<U>,
    r: Promise<IOption<T>>,
): Promise<IOption<U>>;
```

Defined in: [promise-option/mapAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/mapAsync.ts)

#### Example

```ts
import { mapAsync } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
await mapAsync((x: number) => x * 2, Promise.resolve(ofSome(21))); // Some(42)
```

***

### mapOrAsync()

Maps the value of `Promise<IOption<T>>`, returning a default on None.
Mirrors `mapOrAsync` for the Option-flavored pipeline.

```ts
export function mapOrAsync<A, B>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
): (r: Promise<IOption<A>>) => Promise<B>;
export function mapOrAsync<A, B>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    r: Promise<IOption<A>>,
): Promise<B>;
```

Defined in: [promise-option/mapOrAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/mapOrAsync.ts)

#### Example

```ts
import { mapOrAsync } from '@sandlada/result/promise-option';
import { ofSome, ofNone } from '@sandlada/result/option';

await mapOrAsync(-1, (x: number) => x * 2, Promise.resolve(ofSome(21)));  // 42
await mapOrAsync(-1, (x: number) => x * 2, Promise.resolve(ofNone()));    // -1
```

***

### mapOrElseAsync()

Maps the value of `Promise<IOption<T>>`, or computes a default
from a thunk on None. Mirrors `mapOrElseAsync` for the Option-flavored pipeline.

```ts
export function mapOrElseAsync<A, B>(
    onNone: () => B | Promise<B>,
    fn: (a: A) => B | Promise<B>,
): (r: Promise<IOption<A>>) => Promise<B>;
export function mapOrElseAsync<A, B>(
    onNone: () => B | Promise<B>,
    fn: (a: A) => B | Promise<B>,
    r: Promise<IOption<A>>,
): Promise<B>;
```

Defined in: [promise-option/mapOrElseAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/mapOrElseAsync.ts)

#### Example

```ts
import { mapOrElseAsync } from '@sandlada/result/promise-option';
import { ofSome, ofNone } from '@sandlada/result/option';

await mapOrElseAsync(() => -1, (x: number) => x * 2, Promise.resolve(ofSome(21))); // 42
await mapOrElseAsync(() => -1, (x: number) => x * 2, Promise.resolve(ofNone()));    // -1
```

***

### matchAsync()

Terminal — pattern-matches on both cases of an async option.

```ts
export function matchAsync<T, U>(
    onSome: (a: T) => U | Promise<U>,
    onNone: () => U | Promise<U>,
): (r: Promise<IOption<T>>) => Promise<U>;
export function matchAsync<T, U>(
    onSome: (a: T) => U | Promise<U>,
    onNone: () => U | Promise<U>,
    r: Promise<IOption<T>>,
): Promise<U>;
```

Defined in: [promise-option/matchAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/matchAsync.ts)

#### Example

```ts
import { matchAsync } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
await matchAsync(
  (v: number) => `some: ${v}`,
  () => `none`,
  Promise.resolve(ofSome(42)),
); // "some: 42"
```

***

### orElseAsync()

Error recovery for async options.

**Throw policy**: if `f` throws synchronously or its returned Promise rejects,
the result is `None`. The thrown reason is discarded.

```ts
export function orElseAsync<T>(
    f: () => IOption<T> | Promise<IOption<T>>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function orElseAsync<T>(
    f: () => IOption<T> | Promise<IOption<T>>,
    r: Promise<IOption<T>>,
): Promise<IOption<T>>;
```

Defined in: [promise-option/orElseAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/orElseAsync.ts)

#### Example

```ts
import { orElseAsync } from '@sandlada/result/promise-option';
import { ofSome, ofNone } from '@sandlada/result/option';
await orElseAsync(
  () => Promise.resolve(ofSome(0)),
  Promise.resolve(ofNone()),
);
```

***

### tapAsync()

Side-effect on the success track of an async option.

**Throw policy**: if `fn` throws synchronously or its returned Promise rejects,
the result is `None`. The thrown reason is discarded.

```ts
export function tapAsync<T>(
    fn: (a: T) => void | Promise<void>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function tapAsync<T>(
    fn: (a: T) => void | Promise<void>,
    r: Promise<IOption<T>>,
): Promise<IOption<T>>;
```

Defined in: [promise-option/tapAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/tapAsync.ts)

#### Example

```ts
import { tapAsync } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
await tapAsync((v: number) => console.log(v), Promise.resolve(ofSome(42)));
```

***

### tapErrAsync()

Side-effect on both tracks of `Promise<IOption<T>>`.

Two callbacks: `fn` runs on the Some track (with the inner value), `fnNone`
runs on the None track - which is the failure track of an Option. Splitting
the callbacks eliminates the `(value: T | undefined)` lie - on None there is
genuinely no value, so the callback can't pretend to receive one.

The `Err` in the name refers to the failure track of the Option, which is
`None`: `fnNone` is the observer for it. `fn` observes the Some track, the
same track `tapAsyncOption` observes.

**Throw policy**: a synchronous throw from either callback converts to
`None`; a rejected Promise propagates as an outer rejection
(promotion-family rule).

```ts
export function tapErrAsync<T>(
    fn: (value: T) => void | Promise<void>,
    fnNone?: () => void | Promise<void>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function tapErrAsync<T>(
    fn: (value: T) => void | Promise<void>,
    r: Promise<IOption<T>>,
    fnNone?: () => void | Promise<void>,
): Promise<IOption<T>>;
```

Defined in: [promise-option/tapErrAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/tapErrAsync.ts)

#### Example

```ts
import { tapErrAsync } from '@sandlada/result/promise-option';
import { ofNone } from '@sandlada/result/option';

await tapErrAsync(
    (v: number) => console.log('value:', v),
    Promise.resolve(ofNone<number>()),
    () => console.warn('absent'),
);
```

***

### unwrapOrAsync()

Extracts the value on success from an async option, or returns a default on failure.

The default value type `D` is independent of the success type `T`, so a wider
or sentinel value can be supplied as a fallback — e.g.
`unwrapOrAsync<number, null>(null)` for a `Promise<IOption<User>>` resolves
to `Promise<User | null>`.

```ts
export function unwrapOrAsync<T = unknown, D = T>(
    defaultValue: D | Promise<D>,
): <T2 extends T>(r: Promise<IOption<T2>>) => Promise<T2 | D>;
export function unwrapOrAsync<T, D = T>(
    defaultValue: D | Promise<D>,
    r: Promise<IOption<T>>,
): Promise<T | D>;
```

Defined in: [promise-option/unwrapOrAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/unwrapOrAsync.ts)

#### Example

```ts
import { unwrapOrAsync } from '@sandlada/result/promise-option';
import { ofSome, ofNone } from '@sandlada/result/option';
await unwrapOrAsync(0, Promise.resolve(ofSome(42))); // 42
await unwrapOrAsync(0, Promise.resolve(ofNone())); // 0
```

***

### unwrapOrElseAsync()

Lazily extracts the value of `Promise<IOption<T>>`, computing a
default from a thunk on None. Returns `Promise<T | D>`. Mirrors
`unwrapOrElseAsync` for the Option-flavored pipeline.

The default value type `D` is independent of the success type `T`.

```ts
export function unwrapOrElseAsync<T = unknown, D = T>(
    onNone: () => D | Promise<D>,
): <T2 extends T>(r: Promise<IOption<T2>>) => Promise<T2 | D>;
export function unwrapOrElseAsync<T, D = T>(
    onNone: () => D | Promise<D>,
    r: Promise<IOption<T>>,
): Promise<T | D>;
```

Defined in: [promise-option/unwrapOrElseAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-option/unwrapOrElseAsync.ts)

#### Example

```ts
import { unwrapOrElseAsync } from '@sandlada/result/promise-option';
import { ofSome, ofNone } from '@sandlada/result/option';

await unwrapOrElseAsync(() => 0, Promise.resolve(ofSome(42))); // 42
await unwrapOrElseAsync(() => 0, Promise.resolve(ofNone()));    // 0
```
