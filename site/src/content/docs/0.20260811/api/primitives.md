---
editUrl: false
next: false
prev: false
title: primitives
slug: 0.20260811/api/primitives
---

## Interfaces

### Partitioned

Defined in: [primitives/partitionOption.ts:25](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/primitives/partitionOption.ts#L25)

#### Type Parameters

##### T

`T`

#### Properties

##### noneIndices

> `readonly` **noneIndices**: readonly `number`\[]

Defined in: [primitives/partitionOption.ts:27](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/primitives/partitionOption.ts#L27)

##### some

> `readonly` **some**: readonly `T`\[]

Defined in: [primitives/partitionOption.ts:26](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/primitives/partitionOption.ts#L26)

## Functions

### cond()

> **cond**\<`T`, `E`>(`predicate`, `errorOnFalse`, `value`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [primitives/cond.ts:28](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/primitives/cond.ts#L28)

If `predicate(value)` returns `true`, yields `Ok(value)`; otherwise yields
`Err(errorOnFalse)`.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### predicate

(`value`) => `boolean`

##### errorOnFalse

`E`

##### value

`T`

#### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

***

### condErr()

> **condErr**\<`T`, `E`>(`predicate`, `okValue`, `errorOnTrue`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [primitives/condErr.ts:23](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/primitives/condErr.ts#L23)

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### predicate

(`value`) => `boolean`

##### okValue

`T`

##### errorOnTrue

`E`

#### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

***

### lift()

#### Call Signature

> **lift**\<`A`, `T`, `E`>(`fn`): (...`args`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [primitives/lift.ts:37](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/primitives/lift.ts#L37)

##### Type Parameters

###### A

`A` *extends* `unknown`\[]

###### T

`T`

###### E

`E` = `never`

##### Parameters

###### fn

(...`args`) => `T`

##### Returns

(...`args`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

#### Call Signature

> **lift**\<`A`, `T`, `E`>(`fn`, `errorFn`): (...`args`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [primitives/lift.ts:40](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/primitives/lift.ts#L40)

##### Type Parameters

###### A

`A` *extends* `unknown`\[]

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(...`args`) => `T`

###### errorFn

(`error`) => `E`

##### Returns

(...`args`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

***

### partitionOption()

> **partitionOption**\<`T`>(`opts`): [`Partitioned`](/0.20260811/api/primitives/#partitioned)\<`T`>

Defined in: [primitives/partitionOption.ts:33](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/primitives/partitionOption.ts#L33)

Single pass over `opts`, accumulating `Some` values and the indices of `None`s.

#### Type Parameters

##### T

`T`

#### Parameters

##### opts

readonly [`IOption`](/0.20260811/api/types/#ioption)\<`T`>\[]

#### Returns

[`Partitioned`](/0.20260811/api/primitives/#partitioned)\<`T`>

***

### reduce()

> **reduce**\<`T`, `E`, `Acc`>(`reducer`, `initial`, `items`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`Acc`, `E`>

Defined in: [primitives/reduce.ts:29](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/primitives/reduce.ts#L29)

Folds `items` left-to-right. If any item is `Err`, the reducer is skipped and the
failure is returned. If the reducer itself returns `Err`, processing stops.

#### Type Parameters

##### T

`T`

##### E

`E`

##### Acc

`Acc`

#### Parameters

##### reducer

(`acc`, `value`, `index`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`Acc`, `E`>

##### initial

`Acc`

##### items

readonly [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>\[]

#### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`Acc`, `E`>

***

### sequence()

> **sequence**\<`T`, `E`>(`results`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<readonly `T`\[], `E`>

Defined in: [primitives/sequence.ts:27](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/primitives/sequence.ts#L27)

Alias of `combine`: convert `[IResultOfT<T, E>]` into `IResultOfT<readonly T[], E>`,
short-circuiting on the first failure. The `readonly` modifier matches
`combine`'s tuple-overload output for runtime-sized `readonly` arrays.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### results

readonly [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>\[]

#### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<readonly `T`\[], `E`>

***

### sequenceAsyncResult()

> **sequenceAsyncResult**\<`T`, `E`>(`results`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`\[], `E`>

Defined in: [primitives/sequenceAsyncResult.ts:26](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/primitives/sequenceAsyncResult.ts#L26)

Lazy sequence for AsyncResults — equivalent to `promiseResultCombine` but exposed
under a name familiar to ROP practitioners.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### results

readonly [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>\[]

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`\[], `E`>
