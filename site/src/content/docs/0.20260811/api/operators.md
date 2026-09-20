---
editUrl: false
next: false
prev: false
title: operators
slug: 0.20260811/api/operators
---

## Functions

### and()

Sync operators — barrel export.

Re-exports all synchronous operators for working with Result values.

#### Call Signature

> **and**\<`B`, `F`>(`other`): \<`A`, `E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F` | `E`>

Defined in: [operators/and.ts:18](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/and.ts#L18)

##### Type Parameters

###### B

`B`

###### F

`F`

##### Parameters

###### other

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>

##### Returns

\<`A`, `E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F` | `E`>

#### Call Signature

> **and**\<`A`, `E`, `B`, `F`>(`other`, `r`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E` | `F`>

Defined in: [operators/and.ts:19](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/and.ts#L19)

##### Type Parameters

###### A

`A`

###### E

`E`

###### B

`B`

###### F

`F`

##### Parameters

###### other

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E` | `F`>

***

### andTee()

#### Call Signature

> **andTee**\<`A`, `B`, `F`>(`fn`, `errorFn?`): \<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [operators/andTee.ts:45](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/andTee.ts#L45)

Curried form.

##### Type Parameters

###### A

`A`

— Input value type (carried through).

###### B

`B`

— **Phantom**: callback's success type, ignored at runtime.

###### F

`F`

— **Phantom**: callback's error type, ignored at runtime.

##### Parameters

###### fn

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>

###### errorFn?

(`thrown`) => `unknown`

##### Returns

\<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

#### Call Signature

> **andTee**\<`A`, `E`, `B`, `F`>(`fn`, `r`, `errorFn?`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [operators/andTee.ts:58](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/andTee.ts#L58)

Direct form.

##### Type Parameters

###### A

`A`

— Input value type (carried through).

###### E

`E`

— Input error type (carried through).

###### B

`B`

— **Phantom**: callback's success type, ignored at runtime.

###### F

`F`

— **Phantom**: callback's error type, ignored at runtime.

##### Parameters

###### fn

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

###### errorFn?

(`thrown`) => `E`

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

***

### andThrough()

#### Call Signature

> **andThrough**\<`A`, `B`, `F`>(`fn`, `errorFn?`): \<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F` | `E`>

Defined in: [operators/andThrough.ts:38](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/andThrough.ts#L38)

##### Type Parameters

###### A

`A`

###### B

`B`

###### F

`F`

##### Parameters

###### fn

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>

###### errorFn?

(`thrown`) => `unknown`

##### Returns

\<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F` | `E`>

#### Call Signature

> **andThrough**\<`A`, `E`, `B`, `F`>(`fn`, `r`, `errorFn?`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E` | `F`>

Defined in: [operators/andThrough.ts:42](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/andThrough.ts#L42)

##### Type Parameters

###### A

`A`

###### E

`E`

###### B

`B`

###### F

`F`

##### Parameters

###### fn

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

###### errorFn?

(`thrown`) => `E` | `F`

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E` | `F`>

***

### ap()

#### Call Signature

> **ap**\<`A`, `B`, `E`, `F`>(`fnResult`): (`result`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E` | `F`>

Defined in: [operators/ap.ts:31](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/ap.ts#L31)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

###### F

`F`

##### Parameters

###### fnResult

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<(`a`) => `B`, `E`>

##### Returns

(`result`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E` | `F`>

#### Call Signature

> **ap**\<`A`, `B`, `E`, `F`>(`fnResult`, `result`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E` | `F`>

Defined in: [operators/ap.ts:34](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/ap.ts#L34)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

###### F

`F`

##### Parameters

###### fnResult

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<(`a`) => `B`, `E`>

###### result

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F`>

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E` | `F`>

***

### bimap()

#### Call Signature

> **bimap**\<`A`, `E`, `C`, `F`>(`onOk`, `onErr`, `errorFn?`): \<`A2`, `E2`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `F`>

Defined in: [operators/bimap.ts:27](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/bimap.ts#L27)

##### Type Parameters

###### A

`A`

###### E

`E`

###### C

`C`

###### F

`F`

##### Parameters

###### onOk

(`a`) => `C`

###### onErr

(`e`) => `F`

###### errorFn?

(`thrown`) => `unknown`

##### Returns

\<`A2`, `E2`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `F`>

#### Call Signature

> **bimap**\<`A`, `E`, `C`, `F`>(`onOk`, `onErr`, `r`, `errorFn?`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `F`>

Defined in: [operators/bimap.ts:34](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/bimap.ts#L34)

##### Type Parameters

###### A

`A`

###### E

`E`

###### C

`C`

###### F

`F`

##### Parameters

###### onOk

(`a`) => `C`

###### onErr

(`e`) => `F`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

###### errorFn?

(`thrown`) => `F`

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `F`>

***

### bind()

#### Call Signature

> **bind**\<`A`, `B`, `F`>(`f`): \<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F` | `E`>

Defined in: [operators/bind.ts:22](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/bind.ts#L22)

##### Type Parameters

###### A

`A`

###### B

`B`

###### F

`F`

##### Parameters

###### f

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>

##### Returns

\<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F` | `E`>

#### Call Signature

> **bind**\<`A`, `B`, `E`, `F`>(`f`, `r`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E` | `F`>

Defined in: [operators/bind.ts:25](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/bind.ts#L25)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

###### F

`F`

##### Parameters

###### f

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E` | `F`>

***

### catchErr()

#### Call Signature

> **catchErr**\<`B`, `E`>(`onErr`): \<`A`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B` | `A`, `never`>

Defined in: [operators/catchErr.ts:56](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/catchErr.ts#L56)

Curried form. The inner `<A>` is **deferred** so the input's value type is
re-inferred at every application site — `catchErr(handler)(IResultOfT<A, E>)` widens
`A | B` per call instead of locking `A` at the currying boundary.

##### Type Parameters

###### B

`B`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `B`

##### Returns

\<`A`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B` | `A`, `never`>

#### Call Signature

> **catchErr**\<`A`, `B`, `E`>(`onErr`, `r`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A` | `B`, `never`>

Defined in: [operators/catchErr.ts:64](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/catchErr.ts#L64)

Direct form. `A` is inferred from the supplied result; the recovery widens to
`A | B`. The error track collapses to `never` because the recovery always succeeds.

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `B`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A` | `B`, `never`>

***

### choose()

#### Call Signature

> **choose**\<`A`, `B`, `E`>(`fn`): (`items`) => `B`\[]

Defined in: [operators/choose.ts:22](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/choose.ts#L22)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### fn

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

##### Returns

(`items`) => `B`\[]

#### Call Signature

> **choose**\<`A`, `B`, `E`>(`fn`, `items`): `B`\[]

Defined in: [operators/choose.ts:25](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/choose.ts#L25)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### fn

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

###### items

readonly `A`\[]

##### Returns

`B`\[]

***

### contains()

#### Call Signature

> **contains**\<`A`>(`target`): \<`E`>(`r`) => `boolean`

Defined in: [operators/contains.ts:17](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/contains.ts#L17)

##### Type Parameters

###### A

`A`

##### Parameters

###### target

`A`

##### Returns

\<`E`>(`r`) => `boolean`

#### Call Signature

> **contains**\<`A`, `E`>(`target`, `r`): `boolean`

Defined in: [operators/contains.ts:18](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/contains.ts#L18)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### target

`A`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`boolean`

***

### exists()

#### Call Signature

> **exists**\<`A`>(`predicate`): \<`E`>(`r`) => `boolean`

Defined in: [operators/exists.ts:17](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/exists.ts#L17)

##### Type Parameters

###### A

`A`

##### Parameters

###### predicate

(`a`) => `boolean`

##### Returns

\<`E`>(`r`) => `boolean`

#### Call Signature

> **exists**\<`A`, `E`>(`predicate`, `r`): `boolean`

Defined in: [operators/exists.ts:18](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/exists.ts#L18)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### predicate

(`a`) => `boolean`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`boolean`

***

### expect()

#### Call Signature

> **expect**\<`A`, `E`>(`msg`): (`r`) => `A`

Defined in: [operators/expect.ts:21](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/expect.ts#L21)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### msg

`string`

##### Returns

(`r`) => `A`

#### Call Signature

> **expect**\<`A`, `E`>(`msg`, `r`): `A`

Defined in: [operators/expect.ts:22](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/expect.ts#L22)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### msg

`string`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`A`

#### Call Signature

> **expect**\<`A`, `E`>(`msg`, `r`, `throwingFn`): `A`

Defined in: [operators/expect.ts:23](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/expect.ts#L23)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### msg

`string`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

###### throwingFn

(`info`) => `Error`

##### Returns

`A`

***

### expectErr()

#### Call Signature

> **expectErr**\<`A`, `E`>(`msg`): (`r`) => `E`

Defined in: [operators/expectErr.ts:21](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/expectErr.ts#L21)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### msg

`string`

##### Returns

(`r`) => `E`

#### Call Signature

> **expectErr**\<`A`, `E`>(`msg`, `r`): `E`

Defined in: [operators/expectErr.ts:22](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/expectErr.ts#L22)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### msg

`string`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`E`

#### Call Signature

> **expectErr**\<`A`, `E`>(`msg`, `r`, `throwingFn`): `E`

Defined in: [operators/expectErr.ts:23](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/expectErr.ts#L23)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### msg

`string`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

###### throwingFn

(`info`) => `Error`

##### Returns

`E`

***

### filterOrElse()

#### Call Signature

> **filterOrElse**\<`A`, `E`>(`predicate`, `errorFn`, `throwErrorFn?`): (`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [operators/filterOrElse.ts:25](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/filterOrElse.ts#L25)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### predicate

(`a`) => `boolean`

###### errorFn

(`a`) => `E`

###### throwErrorFn?

(`thrown`) => `unknown`

##### Returns

(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

#### Call Signature

> **filterOrElse**\<`A`, `E`>(`predicate`, `errorFn`, `r`, `throwErrorFn?`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [operators/filterOrElse.ts:30](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/filterOrElse.ts#L30)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### predicate

(`a`) => `boolean`

###### errorFn

(`a`) => `E`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

###### throwErrorFn?

(`thrown`) => `E`

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

***

### flatten()

> **flatten**\<`A`, `E`>(`r`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [operators/flatten.ts:22](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/flatten.ts#L22)

#### Type Parameters

##### A

`A`

##### E

`E`

#### Parameters

##### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>, `E`>

#### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

***

### map()

#### Call Signature

> **map**\<`A`, `B`>(`f`, `errorFn?`): \<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

Defined in: [operators/map.ts:24](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/map.ts#L24)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### f

(`a`) => `B`

###### errorFn?

(`thrown`) => `unknown`

##### Returns

\<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

#### Call Signature

> **map**\<`A`, `B`, `E`>(`f`, `r`, `errorFn?`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

Defined in: [operators/map.ts:28](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/map.ts#L28)

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

###### errorFn?

(`thrown`) => `E`

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

***

### mapErr()

#### Call Signature

> **mapErr**\<`E`, `F`>(`f`): \<`A`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F`>

Defined in: [operators/mapErr.ts:23](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/mapErr.ts#L23)

##### Type Parameters

###### E

`E`

###### F

`F`

##### Parameters

###### f

(`e`) => `F`

##### Returns

\<`A`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F`>

#### Call Signature

> **mapErr**\<`A`, `E`, `F`>(`f`, `r`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F`>

Defined in: [operators/mapErr.ts:24](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/mapErr.ts#L24)

##### Type Parameters

###### A

`A`

###### E

`E`

###### F

`F`

##### Parameters

###### f

(`e`) => `F`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F`>

***

### mapOr()

#### Call Signature

> **mapOr**\<`A`, `B`, `E`>(`defaultValue`, `fn`): (`r`) => `B`

Defined in: [operators/mapOr.ts:16](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/mapOr.ts#L16)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### defaultValue

`B`

###### fn

(`a`) => `B`

##### Returns

(`r`) => `B`

#### Call Signature

> **mapOr**\<`A`, `B`, `E`>(`defaultValue`, `fn`, `r`): `B`

Defined in: [operators/mapOr.ts:20](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/mapOr.ts#L20)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### defaultValue

`B`

###### fn

(`a`) => `B`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`B`

***

### mapOrElse()

#### Call Signature

> **mapOrElse**\<`A`, `B`, `E`>(`onErr`, `fn`): (`r`) => `B`

Defined in: [operators/mapOrElse.ts:15](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/mapOrElse.ts#L15)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `B`

###### fn

(`a`) => `B`

##### Returns

(`r`) => `B`

#### Call Signature

> **mapOrElse**\<`A`, `B`, `E`>(`onErr`, `fn`, `r`): `B`

Defined in: [operators/mapOrElse.ts:19](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/mapOrElse.ts#L19)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `B`

###### fn

(`a`) => `B`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`B`

***

### match()

#### Call Signature

> **match**\<`A`, `E`, `C`>(`onOk`, `onErr`): (`r`) => `C`

Defined in: [operators/match.ts:33](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/match.ts#L33)

##### Type Parameters

###### A

`A`

###### E

`E`

###### C

`C`

##### Parameters

###### onOk

(`a`) => `C`

###### onErr

(`e`) => `C`

##### Returns

(`r`) => `C`

#### Call Signature

> **match**\<`A`, `E`, `C`>(`onOk`, `onErr`, `r`): `C`

Defined in: [operators/match.ts:37](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/match.ts#L37)

##### Type Parameters

###### A

`A`

###### E

`E`

###### C

`C`

##### Parameters

###### onOk

(`a`) => `C`

###### onErr

(`e`) => `C`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`C`

#### Call Signature

> **match**\<`A`, `E`, `C`>(`handlers`): (`r`) => `C`

Defined in: [operators/match.ts:43](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/match.ts#L43)

##### Type Parameters

###### A

`A`

###### E

`E`

###### C

`C`

##### Parameters

###### handlers

`MatchHandlers`\<`A`, `E`, `C`>

##### Returns

(`r`) => `C`

#### Call Signature

> **match**\<`A`, `E`, `C`>(`handlers`, `r`): `C`

Defined in: [operators/match.ts:46](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/match.ts#L46)

##### Type Parameters

###### A

`A`

###### E

`E`

###### C

`C`

##### Parameters

###### handlers

`MatchHandlers`\<`A`, `E`, `C`>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`C`

***

### or()

#### Call Signature

> **or**\<`A`, `F`>(`other`): \<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F` | `E`>

Defined in: [operators/or.ts:29](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/or.ts#L29)

##### Type Parameters

###### A

`A`

###### F

`F`

##### Parameters

###### other

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F`>

##### Returns

\<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F` | `E`>

#### Call Signature

> **or**\<`A`, `E`, `F`>(`other`, `r`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E` | `F`>

Defined in: [operators/or.ts:32](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/or.ts#L32)

##### Type Parameters

###### A

`A`

###### E

`E`

###### F

`F`

##### Parameters

###### other

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F`>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E` | `F`>

***

### orElse()

#### Call Signature

> **orElse**\<`E`, `B`, `F`>(`f`, `errorFn?`): \<`A`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B` | `A`, `F`>

Defined in: [operators/orElse.ts:20](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/orElse.ts#L20)

##### Type Parameters

###### E

`E`

###### B

`B`

###### F

`F`

##### Parameters

###### f

(`e`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>

###### errorFn?

(`thrown`) => `unknown`

##### Returns

\<`A`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B` | `A`, `F`>

#### Call Signature

> **orElse**\<`A`, `E`, `B`, `F`>(`f`, `r`, `errorFn?`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A` | `B`, `F`>

Defined in: [operators/orElse.ts:24](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/orElse.ts#L24)

##### Type Parameters

###### A

`A`

###### E

`E`

###### B

`B`

###### F

`F`

##### Parameters

###### f

(`e`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

###### errorFn?

(`thrown`) => `F`

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A` | `B`, `F`>

***

### orTee()

#### Call Signature

> **orTee**\<`E`, `B`, `F`>(`fn`, `errorFn?`): \<`A`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [operators/orTee.ts:31](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/orTee.ts#L31)

##### Type Parameters

###### E

`E`

###### B

`B`

###### F

`F`

##### Parameters

###### fn

(`e`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>

###### errorFn?

(`thrown`) => `unknown`

##### Returns

\<`A`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

#### Call Signature

> **orTee**\<`A`, `E`, `B`, `F`>(`fn`, `r`, `errorFn?`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [operators/orTee.ts:35](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/orTee.ts#L35)

##### Type Parameters

###### A

`A`

###### E

`E`

###### B

`B`

###### F

`F`

##### Parameters

###### fn

(`e`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

###### errorFn?

(`thrown`) => `E`

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

***

### orThrow()

> **orThrow**\<`T`, `E`>(`r`): `T`

Defined in: [operators/orThrow.ts:31](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/orThrow.ts#L31)

Unwraps the success value, throwing the error directly on failure.
Requires `E extends Error` so the error can be thrown.

#### Type Parameters

##### T

`T`

##### E

`E` *extends* `Error`

#### Parameters

##### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

The result to unwrap.

#### Returns

`T`

The success value.

#### Throws

The error value if the result is a failure.

***

### orThrowWith()

#### Call Signature

> **orThrowWith**\<`T`, `E`>(`errorFn`): (`r`) => `T`

Defined in: [operators/orThrow.ts:47](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/orThrow.ts#L47)

Unwraps the success value, throwing a custom error on failure.
Transforms the error via `errorFn` before throwing.

Data-last curried — supports both direct and partial application.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### errorFn

(`error`) => `Error`

Transforms the error into an `Error` to throw.

##### Returns

The success value (or a curried function).

(`r`) => `T`

##### Throws

The transformed error if the result is a failure.

#### Call Signature

> **orThrowWith**\<`T`, `E`>(`errorFn`, `r`): `T`

Defined in: [operators/orThrow.ts:50](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/orThrow.ts#L50)

Unwraps the success value, throwing a custom error on failure.
Transforms the error via `errorFn` before throwing.

Data-last curried — supports both direct and partial application.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### errorFn

(`error`) => `Error`

Transforms the error into an `Error` to throw.

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

The result to unwrap (omitted for curried form).

##### Returns

`T`

The success value (or a curried function).

##### Throws

The transformed error if the result is a failure.

***

### separate()

> **separate**\<`T`, `E`>(`results`): `object`

Defined in: [operators/separate.ts:18](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/separate.ts#L18)

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### results

readonly [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>\[]

#### Returns

`object`

##### err

> **err**: `E`\[]

##### ok

> **ok**: `T`\[]

***

### swap()

> **swap**\<`A`, `E`>(`r`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`E`, `A`>

Defined in: [operators/swap.ts:19](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/swap.ts#L19)

#### Type Parameters

##### A

`A`

##### E

`E`

#### Parameters

##### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

#### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`E`, `A`>

***

### tap()

#### Call Signature

> **tap**\<`A`>(`fn`, `errorFn?`): \<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [operators/tap.ts:26](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/tap.ts#L26)

##### Type Parameters

###### A

`A`

##### Parameters

###### fn

(`a`) => `void`

###### errorFn?

(`thrown`) => `unknown`

##### Returns

\<`E`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

#### Call Signature

> **tap**\<`A`, `E`>(`fn`, `r`, `errorFn?`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [operators/tap.ts:30](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/tap.ts#L30)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### fn

(`a`) => `void`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

###### errorFn?

(`thrown`) => `E`

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

***

### tapErr()

#### Call Signature

> **tapErr**\<`E`>(`fn`, `errorFn?`): \<`A`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [operators/tapErr.ts:21](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/tapErr.ts#L21)

##### Type Parameters

###### E

`E`

##### Parameters

###### fn

(`e`) => `void`

###### errorFn?

(`thrown`) => `unknown`

##### Returns

\<`A`>(`r`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

#### Call Signature

> **tapErr**\<`A`, `E`>(`fn`, `r`, `errorFn?`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

Defined in: [operators/tapErr.ts:25](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/tapErr.ts#L25)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### fn

(`e`) => `void`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

###### errorFn?

(`thrown`) => `E`

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

***

### traverseArray()

#### Call Signature

> **traverseArray**\<`A`, `B`, `E`>(`fn`): (`items`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`\[], `E`>

Defined in: [operators/traverseArray.ts:25](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/traverseArray.ts#L25)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### fn

(`item`, `index`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

##### Returns

(`items`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`\[], `E`>

#### Call Signature

> **traverseArray**\<`A`, `B`, `E`>(`fn`, `items`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`\[], `E`>

Defined in: [operators/traverseArray.ts:28](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/traverseArray.ts#L28)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### fn

(`item`, `index`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

###### items

readonly `A`\[]

##### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`\[], `E`>

***

### unsafeUnwrap()

> **unsafeUnwrap**\<`A`, `E`>(`r`): `A`

Defined in: [operators/unsafeUnwrap.ts:21](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/unsafeUnwrap.ts#L21)

#### Type Parameters

##### A

`A`

##### E

`E`

#### Parameters

##### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

#### Returns

`A`

***

### unsafeUnwrapErr()

> **unsafeUnwrapErr**\<`A`, `E`>(`r`): `E`

Defined in: [operators/unsafeUnwrapErr.ts:21](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/unsafeUnwrapErr.ts#L21)

#### Type Parameters

##### A

`A`

##### E

`E`

#### Parameters

##### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

#### Returns

`E`

***

### unwrap()

> **unwrap**\<`T`, `E`>(`r`, `throwingFn?`): `T`

Defined in: [operators/unwrap.ts:20](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/unwrap.ts#L20)

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

##### throwingFn?

(`info`) => `Error`

#### Returns

`T`

***

### unwrapErr()

> **unwrapErr**\<`A`, `E`>(`r`, `throwingFn?`): `E`

Defined in: [operators/unwrapErr.ts:21](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/unwrapErr.ts#L21)

#### Type Parameters

##### A

`A`

##### E

`E`

#### Parameters

##### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### throwingFn?

(`info`) => `Error`

#### Returns

`E`

***

### unwrapOr()

#### Call Signature

> **unwrapOr**\<`A`>(`defaultValue`): \<`E`>(`r`) => `Widen`\<`A`>

Defined in: [operators/unwrapOr.ts:27](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/unwrapOr.ts#L27)

##### Type Parameters

###### A

`A`

##### Parameters

###### defaultValue

`A`

##### Returns

\<`E`>(`r`) => `Widen`\<`A`>

#### Call Signature

> **unwrapOr**\<`A`, `E`>(`defaultValue`, `r`): `Widen`\<`A`>

Defined in: [operators/unwrapOr.ts:28](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/unwrapOr.ts#L28)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### defaultValue

`A`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`Widen`\<`A`>, `E`>

##### Returns

`Widen`\<`A`>

***

### unwrapOrElse()

#### Call Signature

> **unwrapOrElse**\<`A`, `E`>(`onErr`): (`r`) => `A`

Defined in: [operators/unwrapOrElse.ts:22](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/unwrapOrElse.ts#L22)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `A`

##### Returns

(`r`) => `A`

#### Call Signature

> **unwrapOrElse**\<`A`, `E`>(`onErr`, `r`): `A`

Defined in: [operators/unwrapOrElse.ts:23](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/unwrapOrElse.ts#L23)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `A`

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`A`

***

### unzip()

> **unzip**\<`A`, `B`, `E`>(`r`): \[[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>, [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>]

Defined in: [operators/unzip.ts:19](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/operators/unzip.ts#L19)

#### Type Parameters

##### A

`A`

##### B

`B`

##### E

`E`

#### Parameters

##### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<readonly \[`A`, `B`], `E`>

#### Returns

\[[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>, [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>]
