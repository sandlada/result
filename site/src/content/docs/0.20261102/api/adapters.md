---
title: "Adapters: switchFn, tee"
description: Bridge existing code into Result pipelines with switchFn, tee,
  toOption and fromOption — adapters without rewriting call sites.
editUrl: false
next: false
prev: false
slug: 0.20261102/api/adapters
---

Adapters — barrel export.

Re-exports adapter/interop functions for bridging between Result and other patterns.

## Functions

### fromOption()

Converts an Option to a Result, providing an error for the None case. `Some(value)` → `Ok(value)`, `None` → `Err(errorOnNone)`.

```ts
export function fromOption<E>(errorOnNone: E): <A>(opt: IOption<A>) => IResultOfT<A, E>;
export function fromOption<A, E>(errorOnNone: E, opt: IOption<A>): IResultOfT<A, E>;
```

Defined in: [adapters/fromOption.ts](https://github.com/sandlada/result/blob/main/src/adapters/fromOption.ts)

#### Example

```ts
import { fromOption } from '@sandlada/result/adapters';
import { ofSome, ofNone } from '@sandlada/result/option';
fromOption('missing', ofSome(42)); // Ok(42)
fromOption('missing', ofNone()); // Err('missing')
```

***

### switchFn()

Converts a one-track (plain) function into a switch function — lifts it to return a Result.

Optional `errorFn` (when supplied) maps the caught exception to a typed error;
without it the error type defaults to `unknown` — mirrors `tryCatch`/`fromPromise`.

Wlaschin equivalent: `succeed ∘ f`

```ts
export function switchFn<A, B, E = unknown>(
    f: (a: A) => B,
    errorFn?: (error: unknown) => E,
): (a: A) => IResultOfT<B, E>;
```

Defined in: [adapters/switchFn.ts](https://github.com/sandlada/result/blob/main/src/adapters/switchFn.ts)

#### Example

```ts
import { switchFn } from '@sandlada/result/adapters';
const safe = switchFn((x: number) => x * 2);
safe(21); // Ok(42)
```

***

### switchFnAsync()

Converts a one-track async function into an async switch function — lifts it to return a `Promise<IResultOfT>`.

Optional `errorFn` (when supplied) maps the caught exception to a typed error;
without it the error type defaults to `unknown` — mirrors `tryCatchAsync`/`fromPromise`.

```ts
export function switchFnAsync<A, B, E = unknown>(
    f: (a: A) => B | Promise<B>,
    errorFn?: (error: unknown) => E,
): (a: A) => Promise<IResultOfT<B, E>>;
```

Defined in: [adapters/switchFnAsync.ts](https://github.com/sandlada/result/blob/main/src/adapters/switchFnAsync.ts)

#### Example

```ts
import { switchFnAsync } from '@sandlada/result/adapters';
const safeFetch = switchFnAsync(async (url: string) => fetch(url).then(r => r.json()));
await safeFetch('https://api.example.com/data');
```

***

### tee()

Side-effect on the one-track — calls `f` and returns the value unchanged.
Unlike `tap` (which operates on the success track of a Result), `tee` operates on a
plain value outside the railway.

**Throw policy**: Unlike railway `tap`, `tee` operates on a plain value with no failure
state, so a throwing `f` **propagates**. Ensure `f` does not throw.

Wlaschin equivalent: `tee` (dead-end function)

```ts
export function tee<A>(f: (a: A) => void): (a: A) => A;
```

Defined in: [adapters/tee.ts](https://github.com/sandlada/result/blob/main/src/adapters/tee.ts)

#### Example

```ts
import { tee } from '@sandlada/result/adapters';
const logged = tee((x: number) => console.log('got:', x));
logged(42); // logs "got: 42", returns 42
```

***

### teeAsync()

Async side-effect on the one-track — calls `f` and returns the value unchanged.

**Throw policy**: Unlike railway `tap`, `teeAsync` operates on a plain value with no
failure state, so a throwing (or rejecting) `f` **propagates**. Ensure `f` does not throw.

```ts
export function teeAsync<A>(f: (a: A) => void | Promise<void>): (a: A) => Promise<A>;
```

Defined in: [adapters/teeAsync.ts](https://github.com/sandlada/result/blob/main/src/adapters/teeAsync.ts)

#### Example

```ts
import { teeAsync } from '@sandlada/result/adapters';
const logged = teeAsync(async (x: number) => { console.log('got:', x); });
await logged(42); // returns 42 after the side effect
```

***

### toOption()

Converts a Result to an Option. `Ok(value)` → `Some(value)`, `Err(_)` → `None`. Discards the error information.

```ts
export function toOption<A, E>(r: IResultOfT<A, E>): IOption<A>;
```

Defined in: [adapters/toOption.ts](https://github.com/sandlada/result/blob/main/src/adapters/toOption.ts)

#### Example

```ts
import { toOption } from '@sandlada/result/adapters';
import { ok, err } from '@sandlada/result/factories';
toOption(ok(42)); // Some(42)
toOption(err('boom')); // None
```
