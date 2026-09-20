---
editUrl: false
next: false
prev: false
title: promise-option
slug: 0.20260811/api/promise-option
---

## Functions

### asyncBindOption()

#### Call Signature

> **asyncBindOption**\<`T`, `U`>(`fn`): (`opt`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

Defined in: [promise-option/asyncBindOption.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/asyncBindOption.ts#L23)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### fn

(`value`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

##### Returns

(`opt`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

##### Fileoverview

Chains an async option-returning function over a **sync** `IOption`.
Bridges from the sync Option world to the async world — unlike `bind` in
`async-option/` which works on `AsyncOption`.

**Throw policy**: a synchronous throw from `fn` converts to `None`; a
rejected Promise from `fn` propagates as an outer rejection
(promotion-family rule — the sync track stays rejection-free, and async
failures are not swallowed).

##### Example

```ts
import { asyncBindOption, ofSome } from '@sandlada/result';
const r = await asyncBindOption(async (x: number) => ofSome(x * 2), ofSome(21));
// Some(42)
```

*

##### Note

Ready for Product

#### Call Signature

> **asyncBindOption**\<`T`, `U`>(`fn`, `opt`): `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

Defined in: [promise-option/asyncBindOption.ts:26](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/asyncBindOption.ts#L26)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### fn

(`value`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

###### opt

[`IOption`](/0.20260811/api/types/#ioption)\<`T`>

##### Returns

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

##### Fileoverview

Chains an async option-returning function over a **sync** `IOption`.
Bridges from the sync Option world to the async world — unlike `bind` in
`async-option/` which works on `AsyncOption`.

**Throw policy**: a synchronous throw from `fn` converts to `None`; a
rejected Promise from `fn` propagates as an outer rejection
(promotion-family rule — the sync track stays rejection-free, and async
failures are not swallowed).

##### Example

```ts
import { asyncBindOption, ofSome } from '@sandlada/result';
const r = await asyncBindOption(async (x: number) => ofSome(x * 2), ofSome(21));
// Some(42)
```

*

##### Note

Ready for Product

***

### asyncMapOption()

#### Call Signature

> **asyncMapOption**\<`A`, `B`>(`f`): (`o`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`B`>>

Defined in: [promise-option/asyncMapOption.ts:17](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/asyncMapOption.ts#L17)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### f

(`a`) => `Promise`\<`B`>

##### Returns

(`o`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`B`>>

#### Call Signature

> **asyncMapOption**\<`A`, `B`>(`f`, `o`): `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`B`>>

Defined in: [promise-option/asyncMapOption.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/asyncMapOption.ts#L20)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### f

(`a`) => `Promise`\<`B`>

###### o

[`IOption`](/0.20260811/api/types/#ioption)\<`A`>

##### Returns

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`B`>>

***

### asyncMatchOption()

#### Call Signature

> **asyncMatchOption**\<`T`, `U`>(`handlers`): (`o`) => `Promise`\<`U`>

Defined in: [promise-option/asyncMatchOption.ts:18](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/asyncMatchOption.ts#L18)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### handlers

###### none

() => `U` | `Promise`\<`U`>

###### some

(`value`) => `U` | `Promise`\<`U`>

##### Returns

(`o`) => `Promise`\<`U`>

#### Call Signature

> **asyncMatchOption**\<`T`, `U`>(`handlers`, `o`): `Promise`\<`U`>

Defined in: [promise-option/asyncMatchOption.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/asyncMatchOption.ts#L21)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### handlers

###### none

() => `U` | `Promise`\<`U`>

###### some

(`value`) => `U` | `Promise`\<`U`>

###### o

[`IOption`](/0.20260811/api/types/#ioption)\<`T`>

##### Returns

`Promise`\<`U`>

***

### asyncOrElseOption()

#### Call Signature

> **asyncOrElseOption**\<`T`>(`f`): (`o`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/asyncOrElseOption.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/asyncOrElseOption.ts#L21)

##### Type Parameters

###### T

`T`

##### Parameters

###### f

() => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Returns

(`o`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

#### Call Signature

> **asyncOrElseOption**\<`T`>(`f`, `o`): `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/asyncOrElseOption.ts:24](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/asyncOrElseOption.ts#L24)

##### Type Parameters

###### T

`T`

##### Parameters

###### f

() => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

###### o

[`IOption`](/0.20260811/api/types/#ioption)\<`T`>

##### Returns

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

***

### asyncTapOption()

#### Call Signature

> **asyncTapOption**\<`T`>(`fn`): (`opt`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/asyncTapOption.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/asyncTapOption.ts#L20)

##### Type Parameters

###### T

`T`

##### Parameters

###### fn

(`a`) => `Promise`\<`unknown`>

##### Returns

(`opt`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Fileoverview

Side-effect on success for a sync `IOption` using an async callback.

Side-effect only. A synchronous throw from the callback converts to `None`
(side-effect dropped); a rejected Promise propagates as an outer rejection
(promotion-family rule, matches `asyncBindOption`).

##### Example

```ts
import { ofSome, asyncTapOption } from '@sandlada/result';
const log = asyncTapOption(async (x: number) => { console.log(x); });
await log(ofSome(42)); // Some(42) — side-effect only
```

*

##### Note

Ready for Product

#### Call Signature

> **asyncTapOption**\<`T`>(`fn`, `opt`): `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/asyncTapOption.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/asyncTapOption.ts#L23)

##### Type Parameters

###### T

`T`

##### Parameters

###### fn

(`a`) => `Promise`\<`unknown`>

###### opt

[`IOption`](/0.20260811/api/types/#ioption)\<`T`>

##### Returns

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Fileoverview

Side-effect on success for a sync `IOption` using an async callback.

Side-effect only. A synchronous throw from the callback converts to `None`
(side-effect dropped); a rejected Promise propagates as an outer rejection
(promotion-family rule, matches `asyncBindOption`).

##### Example

```ts
import { ofSome, asyncTapOption } from '@sandlada/result';
const log = asyncTapOption(async (x: number) => { console.log(x); });
await log(ofSome(42)); // Some(42) — side-effect only
```

*

##### Note

Ready for Product

***

### bindAsyncOption()

#### Call Signature

> **bindAsyncOption**\<`T`, `U`>(`f`): (`r`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

Defined in: [promise-option/bindAsyncOption.ts:22](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/bindAsyncOption.ts#L22)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### f

(`a`) => [`IOption`](/0.20260811/api/types/#ioption)\<`U`> | `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

##### Returns

(`r`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

##### Fileoverview

Chains an async option-returning function. `fn` can return `IOption` or `Promise<IOption>`.

**Throw policy**: if `fn` throws synchronously or its returned Promise rejects,
the result is `None`. The thrown reason is discarded.

##### Example

```ts
import { bindAsyncOption } from '@sandlada/result';
import { ofSome, ofNone } from '@sandlada/result/option';
await bindAsyncOption(
  (x: number) => x > 0 ? Promise.resolve(ofSome(x * 2)) : Promise.resolve(ofNone()),
  Promise.resolve(ofSome(21)),
);
```

*

##### Note

Ready for Product

#### Call Signature

> **bindAsyncOption**\<`T`, `U`>(`f`, `r`): `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

Defined in: [promise-option/bindAsyncOption.ts:25](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/bindAsyncOption.ts#L25)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### f

(`a`) => [`IOption`](/0.20260811/api/types/#ioption)\<`U`> | `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Returns

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

##### Fileoverview

Chains an async option-returning function. `fn` can return `IOption` or `Promise<IOption>`.

**Throw policy**: if `fn` throws synchronously or its returned Promise rejects,
the result is `None`. The thrown reason is discarded.

##### Example

```ts
import { bindAsyncOption } from '@sandlada/result';
import { ofSome, ofNone } from '@sandlada/result/option';
await bindAsyncOption(
  (x: number) => x > 0 ? Promise.resolve(ofSome(x * 2)) : Promise.resolve(ofNone()),
  Promise.resolve(ofSome(21)),
);
```

*

##### Note

Ready for Product

***

### containsAsyncOption()

#### Call Signature

> **containsAsyncOption**\<`T`>(`value`): (`r`) => `Promise`\<`boolean`>

Defined in: [promise-option/containsAsyncOption.ts:14](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/containsAsyncOption.ts#L14)

##### Type Parameters

###### T

`T`

##### Parameters

###### value

`T`

##### Returns

(`r`) => `Promise`\<`boolean`>

##### Fileoverview

Returns true if the `Promise<IOption>` is Some and contains the given value.

##### Example

```ts
import { containsAsyncOption, ofSome } from '@sandlada/result';
const r = await containsAsyncOption(42, Promise.resolve(ofSome(42))); // true
```

*

##### Note

Ready for Product

#### Call Signature

> **containsAsyncOption**\<`T`>(`value`, `r`): `Promise`\<`boolean`>

Defined in: [promise-option/containsAsyncOption.ts:17](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/containsAsyncOption.ts#L17)

##### Type Parameters

###### T

`T`

##### Parameters

###### value

`T`

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Returns

`Promise`\<`boolean`>

##### Fileoverview

Returns true if the `Promise<IOption>` is Some and contains the given value.

##### Example

```ts
import { containsAsyncOption, ofSome } from '@sandlada/result';
const r = await containsAsyncOption(42, Promise.resolve(ofSome(42))); // true
```

*

##### Note

Ready for Product

***

### existsAsyncOption()

#### Call Signature

> **existsAsyncOption**\<`T`>(`predicate`): (`r`) => `Promise`\<`boolean`>

Defined in: [promise-option/existsAsyncOption.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/existsAsyncOption.ts#L20)

##### Type Parameters

###### T

`T`

##### Parameters

###### predicate

(`a`) => `boolean` | `Promise`\<`boolean`>

##### Returns

(`r`) => `Promise`\<`boolean`>

##### Fileoverview

Returns true if the `Promise<IOption>` is Some and the predicate holds.
Returns false on None or when the predicate does not hold.

**Throw policy**: If the predicate throws synchronously or returns a rejected
Promise, the error is caught and the result converts to `false`
(canonical catch+convert policy — see AGENTS.md).

##### Example

```ts
import { existsAsyncOption, ofSome } from '@sandlada/result';
const r = await existsAsyncOption(async (x: number) => x > 10, Promise.resolve(ofSome(42)));
// true
```

*

##### Note

Ready for Product

#### Call Signature

> **existsAsyncOption**\<`T`>(`predicate`, `r`): `Promise`\<`boolean`>

Defined in: [promise-option/existsAsyncOption.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/existsAsyncOption.ts#L23)

##### Type Parameters

###### T

`T`

##### Parameters

###### predicate

(`a`) => `boolean` | `Promise`\<`boolean`>

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Returns

`Promise`\<`boolean`>

##### Fileoverview

Returns true if the `Promise<IOption>` is Some and the predicate holds.
Returns false on None or when the predicate does not hold.

**Throw policy**: If the predicate throws synchronously or returns a rejected
Promise, the error is caught and the result converts to `false`
(canonical catch+convert policy — see AGENTS.md).

##### Example

```ts
import { existsAsyncOption, ofSome } from '@sandlada/result';
const r = await existsAsyncOption(async (x: number) => x > 10, Promise.resolve(ofSome(42)));
// true
```

*

##### Note

Ready for Product

***

### filterAsyncOption()

#### Call Signature

> **filterAsyncOption**\<`T`>(`predicate`): (`r`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/filterAsyncOption.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/filterAsyncOption.ts#L21)

##### Type Parameters

###### T

`T`

##### Parameters

###### predicate

(`a`) => `boolean` | `Promise`\<`boolean`>

##### Returns

(`r`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Fileoverview

Filters the value of a `Promise<IOption<T>>` with a predicate.
Keeps the Some if the predicate holds; converts to None otherwise. None passes through.

**Throw policy**: If the predicate throws synchronously or returns a rejected
Promise, the error is caught and the result converts to `None`
(canonical catch+convert policy — see AGENTS.md).

##### Example

```ts
import { filterAsyncOption, ofSome } from '@sandlada/result';
const r = await filterAsyncOption(async (x: number) => x > 10, Promise.resolve(ofSome(21)));
// Some(21)
```

*

##### Note

Ready for Product

#### Call Signature

> **filterAsyncOption**\<`T`>(`predicate`, `r`): `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/filterAsyncOption.ts:24](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/filterAsyncOption.ts#L24)

##### Type Parameters

###### T

`T`

##### Parameters

###### predicate

(`a`) => `boolean` | `Promise`\<`boolean`>

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Returns

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Fileoverview

Filters the value of a `Promise<IOption<T>>` with a predicate.
Keeps the Some if the predicate holds; converts to None otherwise. None passes through.

**Throw policy**: If the predicate throws synchronously or returns a rejected
Promise, the error is caught and the result converts to `None`
(canonical catch+convert policy — see AGENTS.md).

##### Example

```ts
import { filterAsyncOption, ofSome } from '@sandlada/result';
const r = await filterAsyncOption(async (x: number) => x > 10, Promise.resolve(ofSome(21)));
// Some(21)
```

*

##### Note

Ready for Product

***

### flattenAsyncOption()

> **flattenAsyncOption**\<`T`>(`r`): `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/flattenAsyncOption.ts:18](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/flattenAsyncOption.ts#L18)

#### Type Parameters

##### T

`T`

#### Parameters

##### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>>

#### Returns

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

#### Fileoverview

Flattens a nested `Promise<IOption<IOption<T>>>`.

**Single-step only**: unwraps exactly one layer. Call `flattenAsyncOption`
repeatedly to flatten deeper nests.

#### Example

```ts
import { flattenAsyncOption, ofSome } from '@sandlada/result';
const r = await flattenAsyncOption(Promise.resolve(ofSome(ofSome(42)))); // Some(42)
const r2 = await flattenAsyncOption(Promise.resolve(ofSome(ofSome(ofSome(7))))); // Some(Some(7))
```

*

#### Note

Ready for Product

***

### mapAsyncOption()

#### Call Signature

> **mapAsyncOption**\<`T`, `U`>(`f`): (`r`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

Defined in: [promise-option/mapAsyncOption.ts:19](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/mapAsyncOption.ts#L19)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### f

(`a`) => `U` | `Promise`\<`U`>

##### Returns

(`r`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

##### Fileoverview

Transforms the value of a `Promise<IOption<T>>`. The callback may be sync or async.

**Throw policy**: if `f` throws synchronously or its returned Promise rejects,
the result is `None`. The thrown reason is discarded.

##### Example

```ts
import { mapAsyncOption } from '@sandlada/result';
import { ofSome } from '@sandlada/result/option';
await mapAsyncOption((x: number) => x * 2, Promise.resolve(ofSome(21))); // Some(42)
```

*

##### Note

Ready for Product

#### Call Signature

> **mapAsyncOption**\<`T`, `U`>(`f`, `r`): `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

Defined in: [promise-option/mapAsyncOption.ts:22](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/mapAsyncOption.ts#L22)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### f

(`a`) => `U` | `Promise`\<`U`>

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Returns

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

##### Fileoverview

Transforms the value of a `Promise<IOption<T>>`. The callback may be sync or async.

**Throw policy**: if `f` throws synchronously or its returned Promise rejects,
the result is `None`. The thrown reason is discarded.

##### Example

```ts
import { mapAsyncOption } from '@sandlada/result';
import { ofSome } from '@sandlada/result/option';
await mapAsyncOption((x: number) => x * 2, Promise.resolve(ofSome(21))); // Some(42)
```

*

##### Note

Ready for Product

***

### mapOrAsyncOption()

#### Call Signature

> **mapOrAsyncOption**\<`A`, `B`>(`defaultValue`, `fn`): (`r`) => `Promise`\<`B`>

Defined in: [promise-option/mapOrAsyncOption.ts:16](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/mapOrAsyncOption.ts#L16)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### defaultValue

`B`

###### fn

(`a`) => `B` | `Promise`\<`B`>

##### Returns

(`r`) => `Promise`\<`B`>

#### Call Signature

> **mapOrAsyncOption**\<`A`, `B`>(`defaultValue`, `fn`, `r`): `Promise`\<`B`>

Defined in: [promise-option/mapOrAsyncOption.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/mapOrAsyncOption.ts#L20)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### defaultValue

`B`

###### fn

(`a`) => `B` | `Promise`\<`B`>

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`A`>>

##### Returns

`Promise`\<`B`>

***

### mapOrElseAsyncOption()

#### Call Signature

> **mapOrElseAsyncOption**\<`A`, `B`>(`onNone`, `fn`): (`r`) => `Promise`\<`B`>

Defined in: [promise-option/mapOrElseAsyncOption.ts:16](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/mapOrElseAsyncOption.ts#L16)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### onNone

() => `B` | `Promise`\<`B`>

###### fn

(`a`) => `B` | `Promise`\<`B`>

##### Returns

(`r`) => `Promise`\<`B`>

#### Call Signature

> **mapOrElseAsyncOption**\<`A`, `B`>(`onNone`, `fn`, `r`): `Promise`\<`B`>

Defined in: [promise-option/mapOrElseAsyncOption.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/mapOrElseAsyncOption.ts#L20)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### onNone

() => `B` | `Promise`\<`B`>

###### fn

(`a`) => `B` | `Promise`\<`B`>

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`A`>>

##### Returns

`Promise`\<`B`>

***

### matchAsyncOption()

#### Call Signature

> **matchAsyncOption**\<`T`, `U`>(`onSome`, `onNone`): (`r`) => `Promise`\<`U`>

Defined in: [promise-option/matchAsyncOption.ts:19](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/matchAsyncOption.ts#L19)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### onSome

(`a`) => `U` | `Promise`\<`U`>

###### onNone

() => `U` | `Promise`\<`U`>

##### Returns

(`r`) => `Promise`\<`U`>

##### Fileoverview

Terminal — pattern-matches on both cases of an async option.

##### Example

```ts
import { matchAsyncOption } from '@sandlada/result';
import { ofSome } from '@sandlada/result/option';
await matchAsyncOption(
  (v: number) => `some: ${v}`,
  () => `none`,
  Promise.resolve(ofSome(42)),
); // "some: 42"
```

*

##### Note

Ready for Product

#### Call Signature

> **matchAsyncOption**\<`T`, `U`>(`onSome`, `onNone`, `r`): `Promise`\<`U`>

Defined in: [promise-option/matchAsyncOption.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/matchAsyncOption.ts#L23)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### onSome

(`a`) => `U` | `Promise`\<`U`>

###### onNone

() => `U` | `Promise`\<`U`>

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Returns

`Promise`\<`U`>

##### Fileoverview

Terminal — pattern-matches on both cases of an async option.

##### Example

```ts
import { matchAsyncOption } from '@sandlada/result';
import { ofSome } from '@sandlada/result/option';
await matchAsyncOption(
  (v: number) => `some: ${v}`,
  () => `none`,
  Promise.resolve(ofSome(42)),
); // "some: 42"
```

*

##### Note

Ready for Product

***

### orElseAsyncOption()

#### Call Signature

> **orElseAsyncOption**\<`T`>(`f`): (`r`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/orElseAsyncOption.ts:22](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/orElseAsyncOption.ts#L22)

##### Type Parameters

###### T

`T`

##### Parameters

###### f

() => [`IOption`](/0.20260811/api/types/#ioption)\<`T`> | `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Returns

(`r`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Fileoverview

Error recovery for async options.

**Throw policy**: if `f` throws synchronously or its returned Promise rejects,
the result is `None`. The thrown reason is discarded.

##### Example

```ts
import { orElseAsyncOption } from '@sandlada/result';
import { ofSome, ofNone } from '@sandlada/result/option';
await orElseAsyncOption(
  () => Promise.resolve(ofSome(0)),
  Promise.resolve(ofNone()),
);
```

*

##### Note

Ready for Product

#### Call Signature

> **orElseAsyncOption**\<`T`>(`f`, `r`): `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/orElseAsyncOption.ts:25](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/orElseAsyncOption.ts#L25)

##### Type Parameters

###### T

`T`

##### Parameters

###### f

() => [`IOption`](/0.20260811/api/types/#ioption)\<`T`> | `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Returns

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Fileoverview

Error recovery for async options.

**Throw policy**: if `f` throws synchronously or its returned Promise rejects,
the result is `None`. The thrown reason is discarded.

##### Example

```ts
import { orElseAsyncOption } from '@sandlada/result';
import { ofSome, ofNone } from '@sandlada/result/option';
await orElseAsyncOption(
  () => Promise.resolve(ofSome(0)),
  Promise.resolve(ofNone()),
);
```

*

##### Note

Ready for Product

***

### tapAsyncOption()

#### Call Signature

> **tapAsyncOption**\<`T`>(`fn`): (`r`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/tapAsyncOption.ts:19](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/tapAsyncOption.ts#L19)

##### Type Parameters

###### T

`T`

##### Parameters

###### fn

(`a`) => `void` | `Promise`\<`void`>

##### Returns

(`r`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Fileoverview

Side-effect on the success track of an async option.

**Throw policy**: if `fn` throws synchronously or its returned Promise rejects,
the result is `None`. The thrown reason is discarded.

##### Example

```ts
import { tapAsyncOption } from '@sandlada/result';
import { ofSome } from '@sandlada/result/option';
await tapAsyncOption((v: number) => console.log(v), Promise.resolve(ofSome(42)));
```

*

##### Note

Ready for Product

#### Call Signature

> **tapAsyncOption**\<`T`>(`fn`, `r`): `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/tapAsyncOption.ts:22](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/tapAsyncOption.ts#L22)

##### Type Parameters

###### T

`T`

##### Parameters

###### fn

(`a`) => `void` | `Promise`\<`void`>

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Returns

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Fileoverview

Side-effect on the success track of an async option.

**Throw policy**: if `fn` throws synchronously or its returned Promise rejects,
the result is `None`. The thrown reason is discarded.

##### Example

```ts
import { tapAsyncOption } from '@sandlada/result';
import { ofSome } from '@sandlada/result/option';
await tapAsyncOption((v: number) => console.log(v), Promise.resolve(ofSome(42)));
```

*

##### Note

Ready for Product

***

### tapErrAsyncOption()

#### Call Signature

> **tapErrAsyncOption**\<`T`>(`fn`, `fnNone?`): (`r`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/tapErrAsyncOption.ts:46](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/tapErrAsyncOption.ts#L46)

##### Type Parameters

###### T

`T`

##### Parameters

###### fn

(`value`) => `void` | `Promise`\<`void`>

###### fnNone?

() => `void` | `Promise`\<`void`>

##### Returns

(`r`) => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

#### Call Signature

> **tapErrAsyncOption**\<`T`>(`fn`, `r`, `fnNone?`): `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [promise-option/tapErrAsyncOption.ts:50](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/tapErrAsyncOption.ts#L50)

##### Type Parameters

###### T

`T`

##### Parameters

###### fn

(`value`) => `void` | `Promise`\<`void`>

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

###### fnNone?

() => `void` | `Promise`\<`void`>

##### Returns

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

***

### unwrapOrAsyncOption()

#### Call Signature

> **unwrapOrAsyncOption**\<`T`, `D`>(`defaultValue`): (`r`) => `Promise`\<`T` | `D`>

Defined in: [promise-option/unwrapOrAsyncOption.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/unwrapOrAsyncOption.ts#L21)

##### Type Parameters

###### T

`T`

###### D

`D` = `T`

##### Parameters

###### defaultValue

`D` | `Promise`\<`D`>

##### Returns

(`r`) => `Promise`\<`T` | `D`>

##### Fileoverview

Extracts the value on success from an async option, or returns a default on failure.

The default value type `D` is independent of the success type `T`, so a wider
or sentinel value can be supplied as a fallback — e.g.
`unwrapOrAsyncOption<number, null>(null)` for a `Promise<IOption<User>>` resolves
to `Promise<User | null>`.

##### Example

```ts
import { unwrapOrAsyncOption } from '@sandlada/result';
import { ofSome, ofNone } from '@sandlada/result/option';
await unwrapOrAsyncOption(0, Promise.resolve(ofSome(42))); // 42
await unwrapOrAsyncOption(0, Promise.resolve(ofNone())); // 0
```

##### Note

Ready for Product

#### Call Signature

> **unwrapOrAsyncOption**\<`T`, `D`>(`defaultValue`, `r`): `Promise`\<`T` | `D`>

Defined in: [promise-option/unwrapOrAsyncOption.ts:24](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/unwrapOrAsyncOption.ts#L24)

##### Type Parameters

###### T

`T`

###### D

`D`

##### Parameters

###### defaultValue

`D` | `Promise`\<`D`>

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Returns

`Promise`\<`T` | `D`>

##### Fileoverview

Extracts the value on success from an async option, or returns a default on failure.

The default value type `D` is independent of the success type `T`, so a wider
or sentinel value can be supplied as a fallback — e.g.
`unwrapOrAsyncOption<number, null>(null)` for a `Promise<IOption<User>>` resolves
to `Promise<User | null>`.

##### Example

```ts
import { unwrapOrAsyncOption } from '@sandlada/result';
import { ofSome, ofNone } from '@sandlada/result/option';
await unwrapOrAsyncOption(0, Promise.resolve(ofSome(42))); // 42
await unwrapOrAsyncOption(0, Promise.resolve(ofNone())); // 0
```

##### Note

Ready for Product

***

### unwrapOrElseAsyncOption()

#### Call Signature

> **unwrapOrElseAsyncOption**\<`T`, `D`>(`onNone`): (`r`) => `Promise`\<`T` | `D`>

Defined in: [promise-option/unwrapOrElseAsyncOption.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/unwrapOrElseAsyncOption.ts#L20)

##### Type Parameters

###### T

`T`

###### D

`D` = `T`

##### Parameters

###### onNone

() => `D` | `Promise`\<`D`>

##### Returns

(`r`) => `Promise`\<`T` | `D`>

##### Fileoverview

Lazily extracts the value of `Promise<IOption<T>>`, computing a
default from a thunk on None. Returns `Promise<T | D>`. Mirrors
`unwrapOrElseAsync` for the Option-flavored pipeline.

The default value type `D` is independent of the success type `T`.

##### Example

```ts
import { unwrapOrElseAsyncOption, asyncSome, asyncNone } from '@sandlada/result';
await unwrapOrElseAsyncOption(() => 0, asyncSome(42)); // 42
await unwrapOrElseAsyncOption(() => 0, asyncNone());    // 0
```

##### Note

Ready for Product

#### Call Signature

> **unwrapOrElseAsyncOption**\<`T`, `D`>(`onNone`, `r`): `Promise`\<`T` | `D`>

Defined in: [promise-option/unwrapOrElseAsyncOption.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/promise-option/unwrapOrElseAsyncOption.ts#L23)

##### Type Parameters

###### T

`T`

###### D

`D`

##### Parameters

###### onNone

() => `D` | `Promise`\<`D`>

###### r

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

##### Returns

`Promise`\<`T` | `D`>

##### Fileoverview

Lazily extracts the value of `Promise<IOption<T>>`, computing a
default from a thunk on None. Returns `Promise<T | D>`. Mirrors
`unwrapOrElseAsync` for the Option-flavored pipeline.

The default value type `D` is independent of the success type `T`.

##### Example

```ts
import { unwrapOrElseAsyncOption, asyncSome, asyncNone } from '@sandlada/result';
await unwrapOrElseAsyncOption(() => 0, asyncSome(42)); // 42
await unwrapOrElseAsyncOption(() => 0, asyncNone());    // 0
```

##### Note

Ready for Product

## References

### asyncErr

Re-exports [asyncErr](/0.20260811/api/factories/#asyncerr)

***

### asyncOk

Re-exports [asyncOk](/0.20260811/api/factories/#asyncok)

***

### ofNone

Re-exports [ofNone](/0.20260811/api/option/#ofnone)

***

### ofSome

Re-exports [ofSome](/0.20260811/api/option/#ofsome)
