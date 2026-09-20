---
editUrl: false
next: false
prev: false
title: factories
slug: 0.20260811/api/factories
---

## Functions

### asyncErr()

> **asyncErr**\<`E`>(`error`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`never`, `E`>>

Defined in: [factories/asyncErr.ts:16](https://github.com/sandlada/result/blob/main/src/factories/asyncErr.ts#L16)

Core constructors — barrel export.

Re-exports all factory/constructor functions for creating Result and Option values.

#### Type Parameters

##### E

`E`

#### Parameters

##### error

`E`

#### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`never`, `E`>>

***

### asyncOk()

> **asyncOk**\<`T`>(`value`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `never`>>

Defined in: [factories/asyncOk.ts:16](https://github.com/sandlada/result/blob/main/src/factories/asyncOk.ts#L16)

#### Type Parameters

##### T

`T`

#### Parameters

##### value

`T`

#### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `never`>>

***

### err()

> **err**\<`E`, `T`>(`error`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [factories/err.ts:24](https://github.com/sandlada/result/blob/main/src/factories/err.ts#L24)

#### Type Parameters

##### E

`E`

##### T

`T` = `never`

#### Parameters

##### error

`E`

#### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

***

### fromPredicate()

#### Call Signature

> **fromPredicate**\<`T`, `E`>(`predicate`, `errorOnFalse`): (`value`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [factories/fromPredicate.ts:27](https://github.com/sandlada/result/blob/main/src/factories/fromPredicate.ts#L27)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### predicate

(`v`) => `boolean`

###### errorOnFalse

`E`

##### Returns

(`value`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

#### Call Signature

> **fromPredicate**\<`T`, `E`>(`predicate`, `errorOnFalse`, `value`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [factories/fromPredicate.ts:31](https://github.com/sandlada/result/blob/main/src/factories/fromPredicate.ts#L31)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### predicate

(`v`) => `boolean`

###### errorOnFalse

`E`

###### value

`T`

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

***

### fromPromise()

> **fromPromise**\<`T`, `E`>(`promise`, `errorFn?`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

Defined in: [factories/fromPromise.ts:17](https://github.com/sandlada/result/blob/main/src/factories/fromPromise.ts#L17)

#### Type Parameters

##### T

`T`

##### E

`E` = `unknown`

#### Parameters

##### promise

`Promise`\<`T`>

##### errorFn?

(`error`) => `E`

#### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

***

### fromSafePromise()

> **fromSafePromise**\<`T`, `E`>(`promise`, `errorFn?`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

Defined in: [factories/fromSafePromise.ts:25](https://github.com/sandlada/result/blob/main/src/factories/fromSafePromise.ts#L25)

#### Type Parameters

##### T

`T`

##### E

`E` = `Error`

#### Parameters

##### promise

`Promise`\<`T`>

##### errorFn?

(`error`) => `E`

#### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

***

### fromThrowable()

> **fromThrowable**\<`A`, `T`, `E`>(`fn`, `errorFn?`): (...`args`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [factories/fromThrowable.ts:21](https://github.com/sandlada/result/blob/main/src/factories/fromThrowable.ts#L21)

#### Type Parameters

##### A

`A` *extends* `unknown`\[]

##### T

`T`

##### E

`E` = `unknown`

#### Parameters

##### fn

(...`args`) => `T`

##### errorFn?

(`error`) => `E`

#### Returns

(...`args`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

***

### ok()

#### Call Signature

> **ok**(): [`IResult`](/0.20260811/api/types/#iresult)\<`never`>

Defined in: [factories/ok.ts:29](https://github.com/sandlada/result/blob/main/src/factories/ok.ts#L29)

##### Returns

[`IResult`](/0.20260811/api/types/#iresult)\<`never`>

#### Call Signature

> **ok**\<`T`, `E`>(`value`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `never`>

Defined in: [factories/ok.ts:30](https://github.com/sandlada/result/blob/main/src/factories/ok.ts#L30)

##### Type Parameters

###### T

`T`

###### E

`E` = `never`

##### Parameters

###### value

`T`

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `never`>

#### Call Signature

> **ok**\<`T`, `E`>(`value`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [factories/ok.ts:31](https://github.com/sandlada/result/blob/main/src/factories/ok.ts#L31)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### value

`T`

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

***

### tryCatch()

> **tryCatch**\<`T`, `E`>(`fn`, `errorFn?`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [factories/tryCatch.ts:18](https://github.com/sandlada/result/blob/main/src/factories/tryCatch.ts#L18)

#### Type Parameters

##### T

`T`

##### E

`E` = `unknown`

#### Parameters

##### fn

() => `T`

##### errorFn?

(`error`) => `E`

#### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

***

### tryCatchAsync()

> **tryCatchAsync**\<`T`, `E`>(`fn`, `errorFn?`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

Defined in: [factories/tryCatchAsync.ts:17](https://github.com/sandlada/result/blob/main/src/factories/tryCatchAsync.ts#L17)

#### Type Parameters

##### T

`T`

##### E

`E` = `unknown`

#### Parameters

##### fn

() => `Promise`\<`T`>

##### errorFn?

(`error`) => `E`

#### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>
