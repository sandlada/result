---
editUrl: false
next: false
prev: false
title: combine
slug: 0.20260811/api/combine
---

## Functions

### all()

> **all**\<`T`>(`results`): `AllResult`\<`T`>

Defined in: [combine/all.ts:68](https://github.com/sandlada/result/blob/main/src/combine/all.ts#L68)

#### Type Parameters

##### T

`T` *extends* readonly [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`unknown`, `unknown`>\[]

#### Parameters

##### results

`T`

#### Returns

`AllResult`\<`T`>

***

### combine()

Combine utilities — barrel export.

Re-exports result aggregation utilities for combining multiple Result values.

#### Call Signature

> **combine**\<`T`>(`results`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<\{ \[K in string | number | symbol]: T\[K] extends IResultOfT\<V, unknown> ? V : never }, `T`\[`number`] *extends* [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`unknown`, `E`> ? `E` : `never`>

Defined in: [combine/combine.ts:39](https://github.com/sandlada/result/blob/main/src/combine/combine.ts#L39)

##### Type Parameters

###### T

`T` *extends* readonly [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`unknown`, `unknown`>\[]

##### Parameters

###### results

readonly \[`T`]

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<\{ \[K in string | number | symbol]: T\[K] extends IResultOfT\<V, unknown> ? V : never }, `T`\[`number`] *extends* [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`unknown`, `E`> ? `E` : `never`>

#### Call Signature

> **combine**\<`A`, `E`>(`results`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`\[], `E`>

Defined in: [combine/combine.ts:47](https://github.com/sandlada/result/blob/main/src/combine/combine.ts#L47)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### results

readonly [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>\[]

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`\[], `E`>

***

### combineWithAllErrors()

> **combineWithAllErrors**\<`A`, `E`>(`results`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`\[], `E`\[]>

Defined in: [combine/combineWithAllErrors.ts:20](https://github.com/sandlada/result/blob/main/src/combine/combineWithAllErrors.ts#L20)

#### Type Parameters

##### A

`A`

##### E

`E`

#### Parameters

##### results

readonly [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>\[]

#### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`\[], `E`\[]>
