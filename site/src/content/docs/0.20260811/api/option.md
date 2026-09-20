---
editUrl: false
next: false
prev: false
title: option
slug: 0.20260811/api/option
---

## Functions

### all()

Option FP (batteries included) — barrel export.

Re-exports everything from the sub-modules: core constructors (`ofSome`/`ofNone`)
and operators for use in point-free pipelines.

#### Call Signature

> **all**\<`T`>(`options`): [`IOption`](/0.20260811/api/types/#ioption)\<\{ \[K in string | number | symbol]: T\[K] extends IOption\<V> ? V : never }>

Defined in: [option/all.ts:39](https://github.com/sandlada/result/blob/main/src/option/all.ts#L39)

##### Type Parameters

###### T

`T` *extends* readonly \[[`IOption`](/0.20260811/api/types/#ioption)\<`unknown`>, [`IOption`](/0.20260811/api/types/#ioption)\<`unknown`>]

##### Parameters

###### options

`T`

##### Returns

[`IOption`](/0.20260811/api/types/#ioption)\<\{ \[K in string | number | symbol]: T\[K] extends IOption\<V> ? V : never }>

#### Call Signature

> **all**\<`T`>(`options`): [`IOption`](/0.20260811/api/types/#ioption)\<`T`\[]>

Defined in: [option/all.ts:46](https://github.com/sandlada/result/blob/main/src/option/all.ts#L46)

##### Type Parameters

###### T

`T`

##### Parameters

###### options

readonly [`IOption`](/0.20260811/api/types/#ioption)\<`T`>\[]

##### Returns

[`IOption`](/0.20260811/api/types/#ioption)\<`T`\[]>

***

### bind()

> **bind**\<`T`, `U`>(`fn`): (`opt`) => [`IOption`](/0.20260811/api/types/#ioption)\<`U`>

Defined in: [option/bind.ts:17](https://github.com/sandlada/result/blob/main/src/option/bind.ts#L17)

#### Type Parameters

##### T

`T`

##### U

`U`

#### Parameters

##### fn

(`value`) => [`IOption`](/0.20260811/api/types/#ioption)\<`U`>

#### Returns

(`opt`) => [`IOption`](/0.20260811/api/types/#ioption)\<`U`>

***

### contains()

> **contains**\<`T`>(`target`): (`opt`) => `boolean`

Defined in: [option/contains.ts:17](https://github.com/sandlada/result/blob/main/src/option/contains.ts#L17)

#### Type Parameters

##### T

`T`

#### Parameters

##### target

`T`

#### Returns

(`opt`) => `boolean`

***

### filter()

> **filter**\<`T`>(`predicate`): (`opt`) => [`IOption`](/0.20260811/api/types/#ioption)\<`T`>

Defined in: [option/filter.ts:18](https://github.com/sandlada/result/blob/main/src/option/filter.ts#L18)

#### Type Parameters

##### T

`T`

#### Parameters

##### predicate

(`value`) => `boolean`

#### Returns

(`opt`) => [`IOption`](/0.20260811/api/types/#ioption)\<`T`>

***

### flatten()

> **flatten**\<`T`>(`opt`): [`IOption`](/0.20260811/api/types/#ioption)\<`T`>

Defined in: [option/flatten.ts:16](https://github.com/sandlada/result/blob/main/src/option/flatten.ts#L16)

#### Type Parameters

##### T

`T`

#### Parameters

##### opt

[`IOption`](/0.20260811/api/types/#ioption)\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

#### Returns

[`IOption`](/0.20260811/api/types/#ioption)\<`T`>

***

### map()

> **map**\<`T`, `U`>(`fn`): (`opt`) => [`IOption`](/0.20260811/api/types/#ioption)\<`U`>

Defined in: [option/map.ts:18](https://github.com/sandlada/result/blob/main/src/option/map.ts#L18)

#### Type Parameters

##### T

`T`

##### U

`U`

#### Parameters

##### fn

(`value`) => `U`

#### Returns

(`opt`) => [`IOption`](/0.20260811/api/types/#ioption)\<`U`>

***

### match()

#### Call Signature

> **match**\<`T`, `U`>(`onSome`, `onNone`): (`opt`) => `U`

Defined in: [option/match.ts:30](https://github.com/sandlada/result/blob/main/src/option/match.ts#L30)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### onSome

(`value`) => `U`

###### onNone

() => `U`

##### Returns

(`opt`) => `U`

#### Call Signature

> **match**\<`T`, `U`>(`onSome`, `onNone`, `opt`): `U`

Defined in: [option/match.ts:34](https://github.com/sandlada/result/blob/main/src/option/match.ts#L34)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### onSome

(`value`) => `U`

###### onNone

() => `U`

###### opt

[`IOption`](/0.20260811/api/types/#ioption)\<`T`>

##### Returns

`U`

#### Call Signature

> **match**\<`T`, `U`>(`handlers`): (`opt`) => `U`

Defined in: [option/match.ts:39](https://github.com/sandlada/result/blob/main/src/option/match.ts#L39)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### handlers

`MatchOptionHandlers`\<`T`, `U`>

##### Returns

(`opt`) => `U`

#### Call Signature

> **match**\<`T`, `U`>(`handlers`, `opt`): `U`

Defined in: [option/match.ts:42](https://github.com/sandlada/result/blob/main/src/option/match.ts#L42)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### handlers

`MatchOptionHandlers`\<`T`, `U`>

###### opt

[`IOption`](/0.20260811/api/types/#ioption)\<`T`>

##### Returns

`U`

***

### ofNone()

> **ofNone**\<`T`>(): [`IOption`](/0.20260811/api/types/#ioption)\<`T`>

Defined in: [option/ofNone.ts:56](https://github.com/sandlada/result/blob/main/src/option/ofNone.ts#L56)

Creates a `None` variant of [IOption](/0.20260811/api/types/#ioption).

Returns the **same frozen singleton** for every invocation regardless of
the type parameter `T`. The `T` parameter is purely a type-level slot
marker; the runtime payload carries no value.

#### Type Parameters

##### T

`T` = `unknown`

— The "would-be" value type. Defaults to `unknown` so that
contextual typing (e.g. `const x: IOption<number> = ofNone()`) can flow
without an explicit generic argument.

#### Returns

[`IOption`](/0.20260811/api/types/#ioption)\<`T`>

#### Note

Ready for Product

***

### ofSome()

> **ofSome**\<`T`>(`value`): [`IOption`](/0.20260811/api/types/#ioption)\<`T`>

Defined in: [option/ofSome.ts:15](https://github.com/sandlada/result/blob/main/src/option/ofSome.ts#L15)

#### Type Parameters

##### T

`T`

#### Parameters

##### value

`T`

#### Returns

[`IOption`](/0.20260811/api/types/#ioption)\<`T`>

***

### okOr()

> **okOr**\<`E`>(`error`): \<`T`>(`opt`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [option/okOr.ts:22](https://github.com/sandlada/result/blob/main/src/option/okOr.ts#L22)

#### Type Parameters

##### E

`E`

#### Parameters

##### error

`E`

#### Returns

\<`T`>(`opt`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

***

### okOrElse()

> **okOrElse**\<`E`>(`errorFn`): \<`T`>(`opt`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E` | `Error`>

Defined in: [option/okOrElse.ts:40](https://github.com/sandlada/result/blob/main/src/option/okOrElse.ts#L40)

#### Type Parameters

##### E

`E`

#### Parameters

##### errorFn

() => `E`

#### Returns

\<`T`>(`opt`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E` | `Error`>

***

### orElse()

#### Call Signature

> **orElse**\<`U`>(`fn`): \<`T`>(`opt`) => [`IOption`](/0.20260811/api/types/#ioption)\<`U` | `T`>

Defined in: [option/orElse.ts:43](https://github.com/sandlada/result/blob/main/src/option/orElse.ts#L43)

Curried form. The inner `<T>` is **deferred** so the option's value type is
re-inferred at every application site — `orElse(fn)(IOption<User>)` and
`orElse(fn)(IOption<number>)` both typecheck.

##### Type Parameters

###### U

`U`

##### Parameters

###### fn

() => [`IOption`](/0.20260811/api/types/#ioption)\<`U`>

##### Returns

\<`T`>(`opt`) => [`IOption`](/0.20260811/api/types/#ioption)\<`U` | `T`>

#### Call Signature

> **orElse**\<`T`, `U`>(`fn`, `opt`): [`IOption`](/0.20260811/api/types/#ioption)\<`T` | `U`>

Defined in: [option/orElse.ts:48](https://github.com/sandlada/result/blob/main/src/option/orElse.ts#L48)

Direct form. `T` is inferred from the supplied option; the result widens to `T | U`.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### fn

() => [`IOption`](/0.20260811/api/types/#ioption)\<`U`>

###### opt

[`IOption`](/0.20260811/api/types/#ioption)\<`T`>

##### Returns

[`IOption`](/0.20260811/api/types/#ioption)\<`T` | `U`>

***

### tap()

> **tap**\<`T`>(`fn`): (`opt`) => [`IOption`](/0.20260811/api/types/#ioption)\<`T`>

Defined in: [option/tap.ts:21](https://github.com/sandlada/result/blob/main/src/option/tap.ts#L21)

#### Type Parameters

##### T

`T`

#### Parameters

##### fn

(`value`) => `void`

#### Returns

(`opt`) => [`IOption`](/0.20260811/api/types/#ioption)\<`T`>

***

### transpose()

> **transpose**\<`T`, `E`>(`opt`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>, `E`>

Defined in: [option/transpose.ts:28](https://github.com/sandlada/result/blob/main/src/option/transpose.ts#L28)

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### opt

[`IOption`](/0.20260811/api/types/#ioption)\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

#### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>, `E`>

***

### traverse()

#### Call Signature

> **traverse**\<`A`, `B`>(`fn`): (`items`) => [`IOption`](/0.20260811/api/types/#ioption)\<`B`\[]>

Defined in: [option/traverseArray.ts:66](https://github.com/sandlada/result/blob/main/src/option/traverseArray.ts#L66)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### fn

(`a`) => [`IOption`](/0.20260811/api/types/#ioption)\<`B`>

##### Returns

(`items`) => [`IOption`](/0.20260811/api/types/#ioption)\<`B`\[]>

#### Call Signature

> **traverse**\<`A`, `B`>(`fn`, `items`): [`IOption`](/0.20260811/api/types/#ioption)\<`B`\[]>

Defined in: [option/traverseArray.ts:69](https://github.com/sandlada/result/blob/main/src/option/traverseArray.ts#L69)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### fn

(`a`) => [`IOption`](/0.20260811/api/types/#ioption)\<`B`>

###### items

`Iterable`\<`A`>

##### Returns

[`IOption`](/0.20260811/api/types/#ioption)\<`B`\[]>

***

### traverseArray()

#### Call Signature

> **traverseArray**\<`A`, `B`>(`fn`): (`items`) => [`IOption`](/0.20260811/api/types/#ioption)\<`B`\[]>

Defined in: [option/traverseArray.ts:35](https://github.com/sandlada/result/blob/main/src/option/traverseArray.ts#L35)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### fn

(`a`, `i`) => [`IOption`](/0.20260811/api/types/#ioption)\<`B`>

##### Returns

(`items`) => [`IOption`](/0.20260811/api/types/#ioption)\<`B`\[]>

#### Call Signature

> **traverseArray**\<`A`, `B`>(`fn`, `items`): [`IOption`](/0.20260811/api/types/#ioption)\<`B`\[]>

Defined in: [option/traverseArray.ts:38](https://github.com/sandlada/result/blob/main/src/option/traverseArray.ts#L38)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### fn

(`a`, `i`) => [`IOption`](/0.20260811/api/types/#ioption)\<`B`>

###### items

readonly `A`\[]

##### Returns

[`IOption`](/0.20260811/api/types/#ioption)\<`B`\[]>

***

### unwrapOr()

#### Call Signature

> **unwrapOr**\<`D`>(`defaultValue`): \<`T`>(`opt`) => `D` | `T`

Defined in: [option/unwrapOr.ts:44](https://github.com/sandlada/result/blob/main/src/option/unwrapOr.ts#L44)

Curried form. The inner `<T>` is **deferred** so the option's value type is
re-inferred at every application site — `unwrapOr(default)(IOption<User>)` and
`unwrapOr(default)(IOption<string>)` both typecheck, and both produce
`T | D` for their respective `T`.

##### Type Parameters

###### D

`D`

##### Parameters

###### defaultValue

`D`

##### Returns

\<`T`>(`opt`) => `D` | `T`

#### Call Signature

> **unwrapOr**\<`T`, `D`>(`defaultValue`, `opt`): `T` | `D`

Defined in: [option/unwrapOr.ts:49](https://github.com/sandlada/result/blob/main/src/option/unwrapOr.ts#L49)

Direct form. `T` is inferred from the supplied option.

##### Type Parameters

###### T

`T`

###### D

`D`

##### Parameters

###### defaultValue

`D`

###### opt

[`IOption`](/0.20260811/api/types/#ioption)\<`T`>

##### Returns

`T` | `D`

***

### zipWith()

#### Call Signature

> **zipWith**\<`T`, `R`>(`fn`): (...`options`) => [`IOption`](/0.20260811/api/types/#ioption)\<`R`>

Defined in: [option/zipWith.ts:55](https://github.com/sandlada/result/blob/main/src/option/zipWith.ts#L55)

##### Type Parameters

###### T

`T` *extends* readonly \[`unknown`, `unknown`, `unknown`]

###### R

`R`

##### Parameters

###### fn

(...`args`) => `R`

##### Returns

(...`options`) => [`IOption`](/0.20260811/api/types/#ioption)\<`R`>

#### Call Signature

> **zipWith**\<`T`, `R`>(`fn`, ...`options`): [`IOption`](/0.20260811/api/types/#ioption)\<`R`>

Defined in: [option/zipWith.ts:58](https://github.com/sandlada/result/blob/main/src/option/zipWith.ts#L58)

##### Type Parameters

###### T

`T` *extends* readonly \[`unknown`, `unknown`, `unknown`]

###### R

`R`

##### Parameters

###### fn

(...`args`) => `R`

###### options

...\{ \[K in string | number | symbol]: IOption\<T\[K]> }

##### Returns

[`IOption`](/0.20260811/api/types/#ioption)\<`R`>
