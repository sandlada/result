---
title: "Type contracts: IResult, IOption"
description: "Core contracts of @sandlada/result: IResult, IResultOfT, IOption,
  AsyncResult and AsyncOption — plain discriminated unions, no classes or
  methods."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/types
---

Result type definitions — barrel export.

Re-exports all discriminated union type interfaces. Its only runtime export
is an empty default object, which keeps this entry and its sourcemap
materialized.

## Interfaces

### AsyncOption

Defined in: [types/AsyncOption.ts:14](https://github.com/sandlada/result/blob/main/src/types/AsyncOption.ts#L14)

AsyncOption — a lazy asynchronous option.

Represents a computation that will produce a `IOption<T>` when `.run()` is called.
This enables deferred/lazy composition of optional operations without executing them eagerly.

`AsyncOption` is a lazy thunk wrapping `() => Promise<IOption<T>>`.
Call `run()` to execute the computation.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | — The value type. |

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-run" /> `run` | `readonly` | () => `Promise`\<[`IOption`](/0.20261102/api/types/#ioption)\<`T`>> |

***

### AsyncResult

Defined in: [types/AsyncResult.ts:15](https://github.com/sandlada/result/blob/main/src/types/AsyncResult.ts#L15)

AsyncResult — a lazy asynchronous result.

Represents a computation that will produce a `IResultOfT<T, E>` when `.run()` is called.
This enables deferred/lazy composition of async operations without executing them eagerly.

`AsyncResult` is a lazy thunk wrapping `() => Promise<IResultOfT<T, E>>`.
Call `run()` to execute the computation.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | - | — The success value type. |
| `E` | `unknown` | — The error type. Defaults to `unknown` (matches `IResultOfT`). |

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-run-1" /> `run` | `readonly` | () => `Promise`\<[`IResultOfT`](/0.20261102/api/types/#iresultoft)\<`T`, `E`>> |

***

### IOptionNone

Defined in: [types/Option.ts:13](https://github.com/sandlada/result/blob/main/src/types/Option.ts#L13)

IOptionNone — the None variant of [IOption](/0.20261102/api/types/#ioption).

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-isnone" /> `isNone` | `readonly` | `true` |
| <a id="property-issome" /> `isSome` | `readonly` | `false` |

***

### IOptionSome

Defined in: [types/Option.ts:4](https://github.com/sandlada/result/blob/main/src/types/Option.ts#L4)

IOptionSome — the Some variant of [IOption](/0.20261102/api/types/#ioption).

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-isnone-1" /> `isNone` | `readonly` | `false` |
| <a id="property-issome-1" /> `isSome` | `readonly` | `true` |
| <a id="property-value" /> `value` | `readonly` | `T` |

***

### IResultFailure

Defined in: [types/IResult.ts:22](https://github.com/sandlada/result/blob/main/src/types/IResult.ts#L22)

IResultFailure — the failure variant of [IResult](/0.20261102/api/types/#iresult).

Carries the `error`. The `isSuccess: false` literal discriminates this
variant within the [IResult](/0.20261102/api/types/#iresult) union, enabling TypeScript narrowing.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `TError` | `unknown` | — The error type. Defaults to `unknown` because the library never silently coerces an unknown thrown value to a specific shape — callers must narrow or supply an `errorFn` to take responsibility for the type. |

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-error" /> `error` | `readonly` | `TError` |
| <a id="property-isfailure" /> `isFailure` | `readonly` | `true` |
| <a id="property-issuccess" /> `isSuccess` | `readonly` | `false` |

***

### IResultOfTFailure

Defined in: [types/IResultOfT.ts:16](https://github.com/sandlada/result/blob/main/src/types/IResultOfT.ts#L16)

IResultOfTFailure — the failure variant of [IResultOfT](/0.20261102/api/types/#iresultoft).

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `TError` | `unknown` | — The error type. Defaults to `unknown` because the library never silently coerces an unknown thrown value to a specific shape. |

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-error-1" /> `error` | `readonly` | `TError` |
| <a id="property-isfailure-1" /> `isFailure` | `readonly` | `true` |
| <a id="property-issuccess-1" /> `isSuccess` | `readonly` | `false` |

***

### IResultOfTSuccess

Defined in: [types/IResultOfT.ts:4](https://github.com/sandlada/result/blob/main/src/types/IResultOfT.ts#L4)

IResultOfTSuccess — the success variant of [IResultOfT](/0.20261102/api/types/#iresultoft).

#### Type Parameters

| Type Parameter |
| ------ |
| `TValue` |

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-isfailure-2" /> `isFailure` | `readonly` | `false` |
| <a id="property-issuccess-2" /> `isSuccess` | `readonly` | `true` |
| <a id="property-value-1" /> `value` | `readonly` | `TValue` |

***

### IResultSuccess

Defined in: [types/IResult.ts:7](https://github.com/sandlada/result/blob/main/src/types/IResult.ts#L7)

IResultSuccess — the success variant of [IResult](/0.20261102/api/types/#iresult).

Carries no `error`. The `isSuccess: true` literal discriminates this
variant within the [IResult](/0.20261102/api/types/#iresult) union, enabling TypeScript narrowing.

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-isfailure-3" /> `isFailure` | `readonly` | `false` |
| <a id="property-issuccess-3" /> `isSuccess` | `readonly` | `true` |

## Type Aliases

### IOption

> **IOption**\<`T`> = [`IOptionSome`](/0.20261102/api/types/#ioptionsome)\<`T`> | [`IOptionNone`](/0.20261102/api/types/#ioptionnone)

Defined in: [types/Option.ts:36](https://github.com/sandlada/result/blob/main/src/types/Option.ts#L36)

IOption — the optional value discriminated union.

An optional value is **either** a Some ([IOptionSome](/0.20261102/api/types/#ioptionsome), carrying
`value`) **or** a None ([IOptionNone](/0.20261102/api/types/#ioptionnone), no value).

Check `isSome` to narrow before accessing `value`:

```ts
if (option.isSome) {
  console.log(option.value); // safe — narrowed to Some
} else {
  // option.value — type error: not on None variant
}
```

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | — The contained value type. |

***

### IResult

> **IResult**\<`TError`> = [`IResultSuccess`](/0.20261102/api/types/#iresultsuccess) | [`IResultFailure`](/0.20261102/api/types/#iresultfailure)\<`TError`>

Defined in: [types/IResult.ts:46](https://github.com/sandlada/result/blob/main/src/types/IResult.ts#L46)

IResult — the void result discriminated union.

A result is **either** a success ([IResultSuccess](/0.20261102/api/types/#iresultsuccess), no error)
**or** a failure ([IResultFailure](/0.20261102/api/types/#iresultfailure), carrying the error).

Check `isSuccess` to narrow before accessing `error`:

```ts
if (result.isSuccess) {
  // result.error — type error: not on the success variant
} else {
  console.log(result.error); // safe — narrowed to failure
}
```

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `TError` | `unknown` | — The error type. Defaults to `unknown`. |

***

### IResultOfT

> **IResultOfT**\<`TValue`, `TError`> = [`IResultOfTSuccess`](/0.20261102/api/types/#iresultoftsuccess)\<`TValue`> | [`IResultOfTFailure`](/0.20261102/api/types/#iresultoftfailure)\<`TError`>

Defined in: [types/IResultOfT.ts:42](https://github.com/sandlada/result/blob/main/src/types/IResultOfT.ts#L42)

IResultOfT — the value-bearing result discriminated union.

A value-bearing result is **either** a success ([IResultOfTSuccess](/0.20261102/api/types/#iresultoftsuccess),
carrying `value`) **or** a failure ([IResultOfTFailure](/0.20261102/api/types/#iresultoftfailure), carrying
`error`).

Check `isSuccess` to narrow before accessing `value` or `error`:

```ts
if (result.isSuccess) {
  console.log(result.value); // safe — narrowed to success
} else {
  console.log(result.error); // safe — narrowed to failure
}
```

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `TValue` | - | — The success value type. |
| `TError` | `unknown` | — The error type. Defaults to `unknown`. |

## Variables

### default

> **default**: `object`

Defined in: [types/index.ts:21](https://github.com/sandlada/result/blob/main/src/types/index.ts#L21)
