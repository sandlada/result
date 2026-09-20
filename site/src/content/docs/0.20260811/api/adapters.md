---
editUrl: false
next: false
prev: false
title: adapters
slug: 0.20260811/api/adapters
---

## Functions

### fromOption()

#### Call Signature

> **fromOption**\<`E`>(`errorOnNone`): \<`A`>(`opt`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [adapters/fromOption.ts:20](https://github.com/sandlada/result/blob/main/src/adapters/fromOption.ts#L20)

##### Type Parameters

###### E

`E`

##### Parameters

###### errorOnNone

`E`

##### Returns

\<`A`>(`opt`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

#### Call Signature

> **fromOption**\<`A`, `E`>(`errorOnNone`, `opt`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [adapters/fromOption.ts:21](https://github.com/sandlada/result/blob/main/src/adapters/fromOption.ts#L21)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### errorOnNone

`E`

###### opt

[`IOption`](/0.20260811/api/types/#ioption)\<`A`>

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

***

### liftMap()

#### Call Signature

> **liftMap**\<`A`, `B`>(`f`): \<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

Defined in: [adapters/liftMap.ts:16](https://github.com/sandlada/result/blob/main/src/adapters/liftMap.ts#L16)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### f

(`a`) => `B`

##### Returns

\<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

#### Call Signature

> **liftMap**\<`A`, `B`, `E`>(`f`, `r`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

Defined in: [adapters/liftMap.ts:17](https://github.com/sandlada/result/blob/main/src/adapters/liftMap.ts#L17)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### f

(`a`) => `B`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

***

### switchFn()

> **switchFn**\<`A`, `B`, `E`>(`f`, `errorFn?`): (`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

Defined in: [adapters/switchFn.ts:23](https://github.com/sandlada/result/blob/main/src/adapters/switchFn.ts#L23)

Adapters — barrel export.

Re-exports adapter/interop functions for bridging between Result and other patterns.

#### Type Parameters

##### A

`A`

##### B

`B`

##### E

`E` = `unknown`

#### Parameters

##### f

(`a`) => `B`

##### errorFn?

(`error`) => `E`

#### Returns

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

***

### switchFnAsync()

> **switchFnAsync**\<`A`, `B`, `E`>(`f`, `errorFn?`): (`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

Defined in: [adapters/switchFnAsync.ts:21](https://github.com/sandlada/result/blob/main/src/adapters/switchFnAsync.ts#L21)

#### Type Parameters

##### A

`A`

##### B

`B`

##### E

`E` = `unknown`

#### Parameters

##### f

(`a`) => `B` | `Promise`\<`B`>

##### errorFn?

(`error`) => `E`

#### Returns

(`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

***

### tee()

> **tee**\<`A`>(`f`): (`a`) => `A`

Defined in: [adapters/tee.ts:21](https://github.com/sandlada/result/blob/main/src/adapters/tee.ts#L21)

#### Type Parameters

##### A

`A`

#### Parameters

##### f

(`a`) => `void`

#### Returns

(`a`) => `A`

#### Fileoverview

Side-effect on the one-track — calls `f` and returns the value unchanged.
Unlike `tap` (which operates on the success track of a Result), `tee` operates on a
plain value outside the railway.

**Throw policy**: Unlike railway `tap`, `tee` operates on a plain value with no failure
state, so a throwing `f` **propagates**. Ensure `f` does not throw.

Wlaschin equivalent: `tee` (dead-end function)

#### Example

```ts
import { tee } from '@sandlada/result';
const logged = tee((x: number) => console.log('got:', x));
logged(42); // logs "got: 42", returns 42
```

*

#### Note

Ready for Product

***

### teeAsync()

> **teeAsync**\<`A`>(`f`): (`a`) => `Promise`\<`A`>

Defined in: [adapters/teeAsync.ts:17](https://github.com/sandlada/result/blob/main/src/adapters/teeAsync.ts#L17)

#### Type Parameters

##### A

`A`

#### Parameters

##### f

(`a`) => `void` | `Promise`\<`void`>

#### Returns

(`a`) => `Promise`\<`A`>

#### Fileoverview

Async side-effect on the one-track — calls `f` and returns the value unchanged.

**Throw policy**: Unlike railway `tap`, `teeAsync` operates on a plain value with no
failure state, so a throwing (or rejecting) `f` **propagates**. Ensure `f` does not throw.

#### Example

```ts
import { teeAsync } from '@sandlada/result';
const logged = teeAsync(async (x: number) => { await save(x); });
await logged(42); // returns 42 after saving
```

*

#### Note

Ready for Product

***

### toOption()

> **toOption**\<`A`, `E`>(`r`): [`IOption`](/0.20260811/api/types/#ioption)\<`A`>

Defined in: [adapters/toOption.ts:19](https://github.com/sandlada/result/blob/main/src/adapters/toOption.ts#L19)

#### Type Parameters

##### A

`A`

##### E

`E`

#### Parameters

##### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

#### Returns

[`IOption`](/0.20260811/api/types/#ioption)\<`A`>
