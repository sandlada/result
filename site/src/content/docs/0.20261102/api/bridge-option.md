---
title: "Bridge Option: sync → Promise<Option>"
description: "Bridge operators on plain IOption: map, bind, match, orElse and
  tap — promotion family with sync throw → None."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/bridge-option
---

Sync Option to Promise-of-Option lift operators.

## Functions

### bind()

Chains an async option-returning function over a **sync** `IOption`.
Bridges from the sync Option world to the async world — unlike `bind` in
`async-option/` which works on `AsyncOption`.

**Throw policy**: a synchronous throw from `fn` converts to `None`; a
rejected Promise from `fn` propagates as an outer rejection
(promotion-family rule — the sync track stays rejection-free, and async
failures are not swallowed).

```ts
export function bind<T, U>(
    fn: (value: T) => Promise<IOption<U>> | IOption<U>,
): (opt: IOption<T>) => Promise<IOption<U>>;
export function bind<T, U>(
    fn: (value: T) => Promise<IOption<U>> | IOption<U>,
    opt: IOption<T>,
): Promise<IOption<U>>;
```

Defined in: [bridge-option/bind.ts](https://github.com/sandlada/result/blob/main/src/bridge-option/bind.ts)

#### Example

```ts
import { bind } from '@sandlada/result/bridge-option';
import { ofSome } from '@sandlada/result/option';
const r = await bind(async (x: number) => ofSome(x * 2), ofSome(21));
// Some(42)
```

***

### map()

Lifts a sync `IOption<T>` into `Promise<IOption<U>>` via an
async mapper. Companion to ../bridge-result/map.ts | bridge-result map for the Result world.

```ts
export function map<A, B>(
    f: (a: A) => Promise<B>,
): (o: IOption<A>) => Promise<IOption<B>>;
export function map<A, B>(
    f: (a: A) => Promise<B>,
    o: IOption<A>,
): Promise<IOption<B>>;
```

Defined in: [bridge-option/map.ts](https://github.com/sandlada/result/blob/main/src/bridge-option/map.ts)

#### Example

```ts
import { map } from '@sandlada/result/bridge-option';
import { ofSome, ofNone } from '@sandlada/result/option';
await map(async (x: number) => x * 2, ofSome(21)); // Some(42)
await map(async (x: number) => x * 2, ofNone());    // None
```

***

### match()

Async `match` for sync `IOption<T>`. Pattern-matches with
async-allowed handlers.

```ts
export function match<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
): (o: IOption<T>) => Promise<U>;
export function match<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
    o: IOption<T>,
): Promise<U>;
```

Defined in: [bridge-option/match.ts](https://github.com/sandlada/result/blob/main/src/bridge-option/match.ts)

#### Example

```ts
import { match } from '@sandlada/result/bridge-option';
import { ofSome } from '@sandlada/result/option';
await match(
  { some: async (v: number) => `got ${v}`, none: async () => 'absent' },
  ofSome(42),
); // 'got 42'
```

***

### orElse()

Lifts a sync `IOption<T>` into `Promise<IOption<T>>` and
recovers from None via an async callback.

**Throw policy**: a synchronous throw from `f` converts to `None`; a
rejected Promise from `f` propagates as an outer rejection
(promotion-family rule).

```ts
export function orElse<T>(
    f: () => Promise<IOption<T>> | IOption<T>,
): (o: IOption<T>) => Promise<IOption<T>>;
export function orElse<T>(
    f: () => Promise<IOption<T>> | IOption<T>,
    o: IOption<T>,
): Promise<IOption<T>>;
```

Defined in: [bridge-option/orElse.ts](https://github.com/sandlada/result/blob/main/src/bridge-option/orElse.ts)

#### Example

```ts
import { orElse } from '@sandlada/result/bridge-option';
import { ofSome, ofNone } from '@sandlada/result/option';
await orElse(async () => ofSome(0), ofNone());   // Some(0)
await orElse(async () => ofSome(0), ofSome(42)); // Some(42)
```

***

### tap()

Side-effect on success for a sync `IOption` using an async callback.

Side-effect only. A synchronous throw from the callback converts to `None`
(side-effect dropped); a rejected Promise propagates as an outer rejection
(promotion-family rule, matches [bind](/0.20261102/api/bridge-option/#bind)).

```ts
export function tap<T>(
    fn: (a: T) => Promise<void | unknown>,
): (opt: IOption<T>) => Promise<IOption<T>>;
export function tap<T>(
    fn: (a: T) => Promise<void | unknown>,
    opt: IOption<T>,
): Promise<IOption<T>>;
```

Defined in: [bridge-option/tap.ts](https://github.com/sandlada/result/blob/main/src/bridge-option/tap.ts)

#### Example

```ts
import { tap } from '@sandlada/result/bridge-option';
import { ofSome } from '@sandlada/result/option';
const log = tap(async (x: number) => { console.log(x); });
await log(ofSome(42)); // Some(42) — side-effect only
```
