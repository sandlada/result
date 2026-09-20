---
editUrl: false
next: false
prev: false
title: types
slug: 0.20260811/api/types
---

## Interfaces

### AsyncOption

Defined in: [types/AsyncOption.ts:19](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/AsyncOption.ts#L19)

AsyncOption — a lazy thunk wrapping `() => Promise<IOption<T>>`.

Call `run()` to execute the computation.

#### Type Parameters

##### T

`T`

#### Properties

##### run

> `readonly` **run**: () => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

Defined in: [types/AsyncOption.ts:20](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/AsyncOption.ts#L20)

###### Returns

`Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

***

### AsyncResult

Defined in: [types/AsyncResult.ts:20](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/AsyncResult.ts#L20)

AsyncResult — a lazy thunk wrapping `() => Promise<IResultOfT<T, E>>`.

Call `run()` to execute the computation.

#### Type Parameters

##### T

`T`

##### E

`E` = `unknown`

#### Properties

##### run

> `readonly` **run**: () => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

Defined in: [types/AsyncResult.ts:21](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/AsyncResult.ts#L21)

###### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

***

### IOptionNone

Defined in: [types/Option.ts:34](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/Option.ts#L34)

IOptionNone — the None variant of [IOption](/0.20260811/api/types/#ioption).

#### Properties

##### isNone

> `readonly` **isNone**: `true`

Defined in: [types/Option.ts:36](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/Option.ts#L36)

##### isSome

> `readonly` **isSome**: `false`

Defined in: [types/Option.ts:35](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/Option.ts#L35)

***

### IOptionSome

Defined in: [types/Option.ts:25](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/Option.ts#L25)

IOptionSome — the Some variant of [IOption](/0.20260811/api/types/#ioption).

#### Type Parameters

##### T

`T`

#### Properties

##### isNone

> `readonly` **isNone**: `false`

Defined in: [types/Option.ts:27](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/Option.ts#L27)

##### isSome

> `readonly` **isSome**: `true`

Defined in: [types/Option.ts:26](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/Option.ts#L26)

##### value

> `readonly` **value**: `T`

Defined in: [types/Option.ts:28](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/Option.ts#L28)

***

### IResultFailure

Defined in: [types/IResult.ts:43](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResult.ts#L43)

IResultFailure — the failure variant of [IResult](/0.20260811/api/types/#iresult).

Carries the `error`. The `isSuccess: false` literal discriminates this
variant within the [IResult](/0.20260811/api/types/#iresult) union, enabling TypeScript narrowing.

#### Type Parameters

##### TError

`TError` = `unknown`

— The error type. Defaults to `unknown` because the library
never silently coerces an unknown thrown value to a specific shape — callers
must narrow or supply an `errorFn` to take responsibility for the type.

#### Properties

##### error

> `readonly` **error**: `TError`

Defined in: [types/IResult.ts:46](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResult.ts#L46)

##### isFailure

> `readonly` **isFailure**: `true`

Defined in: [types/IResult.ts:45](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResult.ts#L45)

##### isSuccess

> `readonly` **isSuccess**: `false`

Defined in: [types/IResult.ts:44](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResult.ts#L44)

***

### IResultOfTFailure

Defined in: [types/IResultOfT.ts:39](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResultOfT.ts#L39)

IResultOfTFailure — the failure variant of [IResultOfT](/0.20260811/api/types/#iresultoft).

#### Type Parameters

##### TError

`TError` = `unknown`

— The error type. Defaults to `unknown` because the library
never silently coerces an unknown thrown value to a specific shape.

#### Properties

##### error

> `readonly` **error**: `TError`

Defined in: [types/IResultOfT.ts:42](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResultOfT.ts#L42)

##### isFailure

> `readonly` **isFailure**: `true`

Defined in: [types/IResultOfT.ts:41](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResultOfT.ts#L41)

##### isSuccess

> `readonly` **isSuccess**: `false`

Defined in: [types/IResultOfT.ts:40](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResultOfT.ts#L40)

***

### IResultOfTSuccess

Defined in: [types/IResultOfT.ts:27](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResultOfT.ts#L27)

IResultOfTSuccess — the success variant of [IResultOfT](/0.20260811/api/types/#iresultoft).

#### Type Parameters

##### TValue

`TValue`

#### Properties

##### isFailure

> `readonly` **isFailure**: `false`

Defined in: [types/IResultOfT.ts:29](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResultOfT.ts#L29)

##### isSuccess

> `readonly` **isSuccess**: `true`

Defined in: [types/IResultOfT.ts:28](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResultOfT.ts#L28)

##### value

> `readonly` **value**: `TValue`

Defined in: [types/IResultOfT.ts:30](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResultOfT.ts#L30)

***

### IResultSuccess

Defined in: [types/IResult.ts:28](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResult.ts#L28)

IResultSuccess — the success variant of [IResult](/0.20260811/api/types/#iresult).

Carries no `error`. The `isSuccess: true` literal discriminates this
variant within the [IResult](/0.20260811/api/types/#iresult) union, enabling TypeScript narrowing.

#### Properties

##### isFailure

> `readonly` **isFailure**: `false`

Defined in: [types/IResult.ts:30](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResult.ts#L30)

##### isSuccess

> `readonly` **isSuccess**: `true`

Defined in: [types/IResult.ts:29](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResult.ts#L29)

## Type Aliases

### IOption

> **IOption**\<`T`> = [`IOptionSome`](/0.20260811/api/types/#ioptionsome)\<`T`> | [`IOptionNone`](/0.20260811/api/types/#ioptionnone)

Defined in: [types/Option.ts:46](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/Option.ts#L46)

IOption — optional value contract as a **discriminated union**.

#### Type Parameters

##### T

`T`

— The contained value type.

#### Note

Ready for Product

***

### IResult

> **IResult**\<`TError`> = [`IResultSuccess`](/0.20260811/api/types/#iresultsuccess) | [`IResultFailure`](/0.20260811/api/types/#iresultfailure)\<`TError`>

Defined in: [types/IResult.ts:56](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResult.ts#L56)

IResult — base result contract as a **discriminated union**.

#### Type Parameters

##### TError

`TError` = `unknown`

— The error type. Defaults to `unknown`.

#### Note

Ready for Product

***

### IResultOfT

> **IResultOfT**\<`TValue`, `TError`> = [`IResultOfTSuccess`](/0.20260811/api/types/#iresultoftsuccess)\<`TValue`> | [`IResultOfTFailure`](/0.20260811/api/types/#iresultoftfailure)\<`TError`>

Defined in: [types/IResultOfT.ts:53](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/IResultOfT.ts#L53)

IResultOfT — value-bearing result contract as a **discriminated union**.

#### Type Parameters

##### TValue

`TValue`

— The success value type.

##### TError

`TError` = `unknown`

— The error type. Defaults to `unknown`.

#### Note

Ready for Product

## Variables

### default

> **default**: `object`

Defined in: [types/index.ts:18](https://github.com/sandlada/result/blob/480b221e7512163ad45bddc1b23ef105e155b3b8/src/types/index.ts#L18)
