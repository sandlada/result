---
editUrl: false
next: false
prev: false
title: promise-result
slug: 0.20260811/api/promise-result
---

## Functions

### ap()

#### Call Signature

> **ap**\<`A`, `B`, `E`>(`fnResult`): (`result`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

Defined in: [promise-result/ap.ts:20](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/ap.ts#L20)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### fnResult

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<(`a`) => `B`, `E`>>

##### Returns

(`result`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

#### Call Signature

> **ap**\<`A`, `B`, `E`>(`fnResult`, `result`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

Defined in: [promise-result/ap.ts:23](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/ap.ts#L23)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### fnResult

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<(`a`) => `B`, `E`>>

###### result

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

***

### asyncBind()

#### Call Signature

> **asyncBind**\<`A`, `B`, `F`>(`f`): \<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

Defined in: [promise-result/asyncBind.ts:47](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/asyncBind.ts#L47)

##### Type Parameters

###### A

`A`

###### B

`B`

###### F

`F`

##### Parameters

###### f

(`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

##### Returns

\<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

#### Call Signature

> **asyncBind**\<`A`, `B`, `E`, `F`>(`f`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

Defined in: [promise-result/asyncBind.ts:50](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/asyncBind.ts#L50)

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

(`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

***

### asyncBindThrough()

#### Call Signature

> **asyncBindThrough**\<`A`, `B`, `F`>(`fn`): \<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F` | `E`>>

Defined in: [promise-result/asyncBindThrough.ts:27](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/asyncBindThrough.ts#L27)

##### Type Parameters

###### A

`A`

###### B

`B`

###### F

`F`

##### Parameters

###### fn

(`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

##### Returns

\<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F` | `E`>>

#### Call Signature

> **asyncBindThrough**\<`A`, `B`, `E`, `F`>(`fn`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E` | `F`>>

Defined in: [promise-result/asyncBindThrough.ts:30](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/asyncBindThrough.ts#L30)

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

###### fn

(`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E` | `F`>>

***

### asyncMap()

#### Call Signature

> **asyncMap**\<`A`, `B`>(`f`): \<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

Defined in: [promise-result/asyncMap.ts:28](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/asyncMap.ts#L28)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### f

(`a`) => `Promise`\<`B`>

##### Returns

\<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

#### Call Signature

> **asyncMap**\<`A`, `B`, `E`>(`f`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

Defined in: [promise-result/asyncMap.ts:31](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/asyncMap.ts#L31)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### f

(`a`) => `Promise`\<`B`>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

***

### asyncOrElse()

#### Call Signature

> **asyncOrElse**\<`T`, `E`, `F`>(`f`): (`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E` | `F`>>

Defined in: [promise-result/asyncOrElse.ts:19](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/asyncOrElse.ts#L19)

##### Type Parameters

###### T

`T`

###### E

`E`

###### F

`F`

##### Parameters

###### f

(`e`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `F`>>

##### Returns

(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E` | `F`>>

#### Call Signature

> **asyncOrElse**\<`T`, `E`, `F`>(`f`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E` | `F`>>

Defined in: [promise-result/asyncOrElse.ts:22](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/asyncOrElse.ts#L22)

##### Type Parameters

###### T

`T`

###### E

`E`

###### F

`F`

##### Parameters

###### f

(`e`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `F`>>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E` | `F`>>

***

### asyncTap()

#### Call Signature

> **asyncTap**\<`A`, `E`>(`fn`): (`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

Defined in: [promise-result/asyncTap.ts:19](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/asyncTap.ts#L19)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### fn

(`a`) => `Promise`\<`unknown`>

##### Returns

(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Fileoverview

Side-effect on success for a sync `IResultOfT` using an async callback.
Returns the original Result.
If the callback throws or returns a rejected Promise, the error is caught
and returned as an `Err` result.

##### Example

```ts
import { ok, asyncTap } from '@sandlada/result';
const log = asyncTap(async (x: number) => { console.log(x); });
await log(ok(42)); // Ok(42) — side-effect only
```

*

##### Note

Ready for Product

#### Call Signature

> **asyncTap**\<`A`, `E`>(`fn`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

Defined in: [promise-result/asyncTap.ts:22](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/asyncTap.ts#L22)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### fn

(`a`) => `Promise`\<`unknown`>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Fileoverview

Side-effect on success for a sync `IResultOfT` using an async callback.
Returns the original Result.
If the callback throws or returns a rejected Promise, the error is caught
and returned as an `Err` result.

##### Example

```ts
import { ok, asyncTap } from '@sandlada/result';
const log = asyncTap(async (x: number) => { console.log(x); });
await log(ok(42)); // Ok(42) — side-effect only
```

*

##### Note

Ready for Product

***

### asyncTapErr()

#### Call Signature

> **asyncTapErr**\<`A`, `E`>(`fn`): (`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

Defined in: [promise-result/asyncTapErr.ts:19](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/asyncTapErr.ts#L19)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### fn

(`e`) => `Promise`\<`unknown`>

##### Returns

(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Fileoverview

Side-effect on failure for a sync `IResultOfT` using an async callback.
Returns the original Result.
If the callback throws or returns a rejected Promise, the error is caught
and returned as an `Err` result.

##### Example

```ts
import { err, asyncTapErr } from '@sandlada/result';
const log = asyncTapErr(async (e: string) => { console.error(e); });
await log(err('oops')); // Err('oops') — side-effect only
```

*

##### Note

Ready for Product

#### Call Signature

> **asyncTapErr**\<`A`, `E`>(`fn`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

Defined in: [promise-result/asyncTapErr.ts:22](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/asyncTapErr.ts#L22)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### fn

(`e`) => `Promise`\<`unknown`>

###### r

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Fileoverview

Side-effect on failure for a sync `IResultOfT` using an async callback.
Returns the original Result.
If the callback throws or returns a rejected Promise, the error is caught
and returned as an `Err` result.

##### Example

```ts
import { err, asyncTapErr } from '@sandlada/result';
const log = asyncTapErr(async (e: string) => { console.error(e); });
await log(err('oops')); // Err('oops') — side-effect only
```

*

##### Note

Ready for Product

***

### bimapAsync()

#### Call Signature

> **bimapAsync**\<`A`, `E`, `B`, `F`>(`onOk`, `onErr`): (`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

Defined in: [promise-result/bimapAsync.ts:20](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/bimapAsync.ts#L20)

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

###### onOk

(`a`) => `B` | `Promise`\<`B`>

###### onErr

(`e`) => `F` | `Promise`\<`F`>

##### Returns

(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

##### Fileoverview

Maps both success and failure values of a `Promise<IResultOfT<A, E>>` simultaneously.

##### Example

```ts
import { bimapAsync, ok } from '@sandlada/result';
const r = await bimapAsync(
  (x: number) => x.toString(),
  (e: number) => e * 2,
  Promise.resolve(ok(5)),
); // Ok('5')
```

*

##### Note

Ready for Product

#### Call Signature

> **bimapAsync**\<`A`, `E`, `B`, `F`>(`onOk`, `onErr`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

Defined in: [promise-result/bimapAsync.ts:24](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/bimapAsync.ts#L24)

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

###### onOk

(`a`) => `B` | `Promise`\<`B`>

###### onErr

(`e`) => `F` | `Promise`\<`F`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

##### Fileoverview

Maps both success and failure values of a `Promise<IResultOfT<A, E>>` simultaneously.

##### Example

```ts
import { bimapAsync, ok } from '@sandlada/result';
const r = await bimapAsync(
  (x: number) => x.toString(),
  (e: number) => e * 2,
  Promise.resolve(ok(5)),
); // Ok('5')
```

*

##### Note

Ready for Product

***

### bindAsync()

#### Call Signature

> **bindAsync**\<`A`, `B`, `F`>(`f`): \<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F` | `E`>>

Defined in: [promise-result/bindAsync.ts:27](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/bindAsync.ts#L27)

##### Type Parameters

###### A

`A`

###### B

`B`

###### F

`F`

##### Parameters

###### f

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

##### Returns

\<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F` | `E`>>

#### Call Signature

> **bindAsync**\<`A`, `B`, `E`, `F`>(`f`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E` | `F`>>

Defined in: [promise-result/bindAsync.ts:30](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/bindAsync.ts#L30)

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

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E` | `F`>>

***

### bindThroughAsync()

#### Call Signature

> **bindThroughAsync**\<`A`, `B`, `F`>(`fn`): \<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F` | `E`>>

Defined in: [promise-result/bindThroughAsync.ts:22](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/bindThroughAsync.ts#L22)

##### Type Parameters

###### A

`A`

###### B

`B`

###### F

`F`

##### Parameters

###### fn

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

##### Returns

\<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F` | `E`>>

##### Fileoverview

Side-effect on success for a `Promise<IResultOfT>` that can propagate errors.

**Throw policy**: through-family catch policy — a synchronous throw and a
rejected Promise from `fn` both converge to `Err(thrown)`, matching
`asyncBindThrough` and the sync `andThrough`.

##### Example

```ts
import { bindThroughAsync, ok } from '@sandlada/result';
const validate = bindThroughAsync(async (x: number) =>
  x > 0 ? ok(x) : Promise.reject(new Error('non-positive')),
);
const r = await validate(Promise.resolve(ok(5))); // Ok(5)
```

*

##### Note

Ready for Product

#### Call Signature

> **bindThroughAsync**\<`A`, `B`, `E`, `F`>(`fn`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E` | `F`>>

Defined in: [promise-result/bindThroughAsync.ts:25](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/bindThroughAsync.ts#L25)

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

###### fn

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E` | `F`>>

##### Fileoverview

Side-effect on success for a `Promise<IResultOfT>` that can propagate errors.

**Throw policy**: through-family catch policy — a synchronous throw and a
rejected Promise from `fn` both converge to `Err(thrown)`, matching
`asyncBindThrough` and the sync `andThrough`.

##### Example

```ts
import { bindThroughAsync, ok } from '@sandlada/result';
const validate = bindThroughAsync(async (x: number) =>
  x > 0 ? ok(x) : Promise.reject(new Error('non-positive')),
);
const r = await validate(Promise.resolve(ok(5))); // Ok(5)
```

*

##### Note

Ready for Product

***

### catchErrAsync()

#### Call Signature

> **catchErrAsync**\<`A`, `E`>(`onErr`): (`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `never`>>

Defined in: [promise-result/catchErrAsync.ts:26](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/catchErrAsync.ts#L26)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `A` | `Promise`\<`A`>

##### Returns

(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `never`>>

#### Call Signature

> **catchErrAsync**\<`A`, `E`>(`onErr`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `never`>>

Defined in: [promise-result/catchErrAsync.ts:29](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/catchErrAsync.ts#L29)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `A` | `Promise`\<`A`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `never`>>

***

### combine()

> **combine**\<`A`, `E`>(`results`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`\[], `E`>>

Defined in: [promise-result/combine.ts:19](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/combine.ts#L19)

#### Type Parameters

##### A

`A`

##### E

`E`

#### Parameters

##### results

readonly `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>\[]

#### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`\[], `E`>>

***

### combineWithAllErrors()

> **combineWithAllErrors**\<`A`, `E`>(`results`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`\[], `E`\[]>>

Defined in: [promise-result/combineWithAllErrors.ts:19](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/combineWithAllErrors.ts#L19)

#### Type Parameters

##### A

`A`

##### E

`E`

#### Parameters

##### results

readonly `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>\[]

#### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`\[], `E`\[]>>

***

### containsAsync()

#### Call Signature

> **containsAsync**\<`A`>(`value`): \<`E`>(`r`) => `Promise`\<`boolean`>

Defined in: [promise-result/containsAsync.ts:14](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/containsAsync.ts#L14)

##### Type Parameters

###### A

`A`

##### Parameters

###### value

`A`

##### Returns

\<`E`>(`r`) => `Promise`\<`boolean`>

##### Fileoverview

Returns true if the `Promise<IResultOfT>` is success and contains the given value.

##### Example

```ts
import { containsAsync, ok } from '@sandlada/result';
const r = await containsAsync(42, Promise.resolve(ok(42))); // true
```

*

##### Note

Ready for Product

#### Call Signature

> **containsAsync**\<`A`, `E`>(`value`, `r`): `Promise`\<`boolean`>

Defined in: [promise-result/containsAsync.ts:17](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/containsAsync.ts#L17)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### value

`A`

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<`boolean`>

##### Fileoverview

Returns true if the `Promise<IResultOfT>` is success and contains the given value.

##### Example

```ts
import { containsAsync, ok } from '@sandlada/result';
const r = await containsAsync(42, Promise.resolve(ok(42))); // true
```

*

##### Note

Ready for Product

***

### existsAsync()

#### Call Signature

> **existsAsync**\<`A`>(`predicate`): \<`E`>(`r`) => `Promise`\<`boolean`>

Defined in: [promise-result/existsAsync.ts:21](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/existsAsync.ts#L21)

##### Type Parameters

###### A

`A`

##### Parameters

###### predicate

(`a`) => `boolean` | `Promise`\<`boolean`>

##### Returns

\<`E`>(`r`) => `Promise`\<`boolean`>

##### Fileoverview

Returns true if the `Promise<IResultOfT>` is success and the predicate holds.
Returns false on failure or when the predicate does not hold.

**Throw policy**: If the predicate throws synchronously or returns a rejected
Promise, the rejection propagates to the outer Promise (matches the canonical
AsyncResult throw policy — "sync throws and async rejections propagate").
Use `existsAsyncOption` if you want predicate errors to convert to `false`.

##### Example

```ts
import { existsAsync, ok } from '@sandlada/result';
const r = await existsAsync(async (x: number) => x > 10, Promise.resolve(ok(42)));
// true
```

*

##### Note

Ready for Product

#### Call Signature

> **existsAsync**\<`A`, `E`>(`predicate`, `r`): `Promise`\<`boolean`>

Defined in: [promise-result/existsAsync.ts:24](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/existsAsync.ts#L24)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### predicate

(`a`) => `boolean` | `Promise`\<`boolean`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<`boolean`>

##### Fileoverview

Returns true if the `Promise<IResultOfT>` is success and the predicate holds.
Returns false on failure or when the predicate does not hold.

**Throw policy**: If the predicate throws synchronously or returns a rejected
Promise, the rejection propagates to the outer Promise (matches the canonical
AsyncResult throw policy — "sync throws and async rejections propagate").
Use `existsAsyncOption` if you want predicate errors to convert to `false`.

##### Example

```ts
import { existsAsync, ok } from '@sandlada/result';
const r = await existsAsync(async (x: number) => x > 10, Promise.resolve(ok(42)));
// true
```

*

##### Note

Ready for Product

***

### filterOrElseAsync()

#### Call Signature

> **filterOrElseAsync**\<`A`, `E`>(`predicate`, `errorFn`): (`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

Defined in: [promise-result/filterOrElseAsync.ts:28](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/filterOrElseAsync.ts#L28)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### predicate

(`a`) => `boolean` | `Promise`\<`boolean`>

###### errorFn

(`a`) => `E` | `Promise`\<`E`>

##### Returns

(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Fileoverview

Filters the success value of a `Promise<IResultOfT<A, E>>` with a predicate.
If the predicate holds, the original success passes through. If it fails,
returns `err(errorFn(value))`. Failures pass through unchanged.

**Throw policy**: A synchronous throw or rejected Promise from `predicate`
or `errorFn` propagates to the outer Promise (matches the canonical
AsyncResult throw policy — "sync throws and async rejections propagate").
The `e as E` cast that previously lived here has been removed; callers that
need to capture thrown errors in the `Err` channel should wrap with
`tryCatch` or similar.

##### Example

```ts
import { filterOrElseAsync, ok } from '@sandlada/result';
const r = await filterOrElseAsync(
  (x: number) => x > 0,
  (x: number) => `${x} is not positive`,
  Promise.resolve(ok(5)),
); // Ok(5)
```

*

##### Note

Ready for Product

#### Call Signature

> **filterOrElseAsync**\<`A`, `E`>(`predicate`, `errorFn`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

Defined in: [promise-result/filterOrElseAsync.ts:32](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/filterOrElseAsync.ts#L32)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### predicate

(`a`) => `boolean` | `Promise`\<`boolean`>

###### errorFn

(`a`) => `E` | `Promise`\<`E`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Fileoverview

Filters the success value of a `Promise<IResultOfT<A, E>>` with a predicate.
If the predicate holds, the original success passes through. If it fails,
returns `err(errorFn(value))`. Failures pass through unchanged.

**Throw policy**: A synchronous throw or rejected Promise from `predicate`
or `errorFn` propagates to the outer Promise (matches the canonical
AsyncResult throw policy — "sync throws and async rejections propagate").
The `e as E` cast that previously lived here has been removed; callers that
need to capture thrown errors in the `Err` channel should wrap with
`tryCatch` or similar.

##### Example

```ts
import { filterOrElseAsync, ok } from '@sandlada/result';
const r = await filterOrElseAsync(
  (x: number) => x > 0,
  (x: number) => `${x} is not positive`,
  Promise.resolve(ok(5)),
); // Ok(5)
```

*

##### Note

Ready for Product

***

### flatten()

> **flatten**\<`A`, `E`>(`r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

Defined in: [promise-result/flatten.ts:16](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/flatten.ts#L16)

#### Type Parameters

##### A

`A`

##### E

`E`

#### Parameters

##### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>, `E`>>

#### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

***

### flattenAsync()

> **flattenAsync**\<`A`, `E`>(`r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

Defined in: [promise-result/flattenAsync.ts:18](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/flattenAsync.ts#L18)

#### Type Parameters

##### A

`A`

##### E

`E`

#### Parameters

##### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>, `E`>>

#### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

#### Fileoverview

Flattens a nested `Promise<IResultOfT<IResultOfT<A, E>, E>>`.

**Single-step only**: unwraps exactly one layer. Call `flattenAsync`
repeatedly to flatten deeper nests.

#### Example

```ts
import { flattenAsync, ok } from '@sandlada/result';
const r = await flattenAsync(Promise.resolve(ok(ok(42)))); // Ok(42)
const r2 = await flattenAsync(Promise.resolve(ok(ok(ok(7))))); // Ok(ok(7))
```

*

#### Note

Ready for Product

***

### map()

#### Call Signature

> **map**\<`A`, `B`>(`f`): \<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

Defined in: [promise-result/map.ts:21](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/map.ts#L21)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### f

(`a`) => `B`

##### Returns

\<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

##### Fileoverview

Strictly synchronous `map` over a `Promise<IResultOfT>`.
The mapper is required to be sync. Sync throws are caught and converted
to `err(caughtError)`. Async results from `fn` are not awaited.

For a callback that may be sync or async, prefer [mapAsync](/0.20260811/api/promise-result/#mapasync).

##### Example

```ts
import { map, asyncOk, asyncErr } from '@sandlada/result';
await map((x: number) => x * 2, asyncOk(21)); // Ok(42)
await map((x: number) => x * 2, asyncErr('boom')); // Err('boom')
```

##### Note

Ready for Product

#### Call Signature

> **map**\<`A`, `B`, `E`>(`f`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

Defined in: [promise-result/map.ts:24](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/map.ts#L24)

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

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

##### Fileoverview

Strictly synchronous `map` over a `Promise<IResultOfT>`.
The mapper is required to be sync. Sync throws are caught and converted
to `err(caughtError)`. Async results from `fn` are not awaited.

For a callback that may be sync or async, prefer [mapAsync](/0.20260811/api/promise-result/#mapasync).

##### Example

```ts
import { map, asyncOk, asyncErr } from '@sandlada/result';
await map((x: number) => x * 2, asyncOk(21)); // Ok(42)
await map((x: number) => x * 2, asyncErr('boom')); // Err('boom')
```

##### Note

Ready for Product

***

### mapAsync()

#### Call Signature

> **mapAsync**\<`A`, `B`>(`f`): \<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

Defined in: [promise-result/mapAsync.ts:17](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/mapAsync.ts#L17)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### f

(`a`) => `B` | `Promise`\<`B`>

##### Returns

\<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

#### Call Signature

> **mapAsync**\<`A`, `B`, `E`>(`f`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

Defined in: [promise-result/mapAsync.ts:20](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/mapAsync.ts#L20)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### f

(`a`) => `B` | `Promise`\<`B`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

***

### mapErr()

#### Call Signature

> **mapErr**\<`A`, `E`, `F`>(`f`): \<`T`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `F`>>

Defined in: [promise-result/mapErr.ts:21](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/mapErr.ts#L21)

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

##### Returns

\<`T`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `F`>>

##### Fileoverview

Strictly synchronous `mapErr` over a `Promise<IResultOfT>`.
The mapper is required to be sync. Sync throws are caught and converted
to `err(caughtError)`.

For a callback that may be sync or async, prefer [mapErrAsync](/0.20260811/api/promise-result/#maperrasync).

##### Example

```ts
import { mapErr, asyncOk, asyncErr } from '@sandlada/result';
await mapErr((e: string) => e.toUpperCase(), asyncErr('boom')); // Err('BOOM')
await mapErr((e: string) => e.toUpperCase(), asyncOk(42)); // Ok(42)
```

##### Note

Ready for Product

#### Call Signature

> **mapErr**\<`T`, `E`, `F`>(`f`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `F`>>

Defined in: [promise-result/mapErr.ts:24](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/mapErr.ts#L24)

##### Type Parameters

###### T

`T`

###### E

`E`

###### F

`F`

##### Parameters

###### f

(`e`) => `F`

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `F`>>

##### Fileoverview

Strictly synchronous `mapErr` over a `Promise<IResultOfT>`.
The mapper is required to be sync. Sync throws are caught and converted
to `err(caughtError)`.

For a callback that may be sync or async, prefer [mapErrAsync](/0.20260811/api/promise-result/#maperrasync).

##### Example

```ts
import { mapErr, asyncOk, asyncErr } from '@sandlada/result';
await mapErr((e: string) => e.toUpperCase(), asyncErr('boom')); // Err('BOOM')
await mapErr((e: string) => e.toUpperCase(), asyncOk(42)); // Ok(42)
```

##### Note

Ready for Product

***

### mapErrAsync()

#### Call Signature

> **mapErrAsync**\<`E`, `F`>(`f`): \<`A`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F`>>

Defined in: [promise-result/mapErrAsync.ts:16](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/mapErrAsync.ts#L16)

##### Type Parameters

###### E

`E`

###### F

`F`

##### Parameters

###### f

(`e`) => `F` | `Promise`\<`F`>

##### Returns

\<`A`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F`>>

#### Call Signature

> **mapErrAsync**\<`A`, `E`, `F`>(`f`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F`>>

Defined in: [promise-result/mapErrAsync.ts:19](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/mapErrAsync.ts#L19)

##### Type Parameters

###### A

`A`

###### E

`E`

###### F

`F`

##### Parameters

###### f

(`e`) => `F` | `Promise`\<`F`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `F`>>

***

### mapOrAsync()

#### Call Signature

> **mapOrAsync**\<`A`, `B`, `E`>(`defaultValue`, `fn`): \<`R`>(`r`) => `Promise`\<`B`>

Defined in: [promise-result/mapOrAsync.ts:30](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/mapOrAsync.ts#L30)

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

(`a`) => `B` | `Promise`\<`B`>

##### Returns

\<`R`>(`r`) => `Promise`\<`B`>

#### Call Signature

> **mapOrAsync**\<`A`, `B`, `E`>(`defaultValue`, `fn`, `onErr`): \<`R`>(`r`) => `Promise`\<`B`>

Defined in: [promise-result/mapOrAsync.ts:35](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/mapOrAsync.ts#L35)

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

(`a`) => `B` | `Promise`\<`B`>

###### onErr

(`e`) => `unknown`

##### Returns

\<`R`>(`r`) => `Promise`\<`B`>

#### Call Signature

> **mapOrAsync**\<`A`, `B`, `E`>(`defaultValue`, `fn`, `r`): `Promise`\<`B`>

Defined in: [promise-result/mapOrAsync.ts:40](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/mapOrAsync.ts#L40)

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

(`a`) => `B` | `Promise`\<`B`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<`B`>

#### Call Signature

> **mapOrAsync**\<`A`, `B`, `E`>(`defaultValue`, `fn`, `r`, `onErr`): `Promise`\<`B`>

Defined in: [promise-result/mapOrAsync.ts:45](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/mapOrAsync.ts#L45)

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

(`a`) => `B` | `Promise`\<`B`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

###### onErr

(`e`) => `unknown`

##### Returns

`Promise`\<`B`>

***

### mapOrElseAsync()

#### Call Signature

> **mapOrElseAsync**\<`A`, `B`, `E`>(`onErr`, `fn`): (`r`) => `Promise`\<`B`>

Defined in: [promise-result/mapOrElseAsync.ts:18](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/mapOrElseAsync.ts#L18)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `B` | `Promise`\<`B`>

###### fn

(`a`) => `B` | `Promise`\<`B`>

##### Returns

(`r`) => `Promise`\<`B`>

#### Call Signature

> **mapOrElseAsync**\<`A`, `B`, `E`>(`onErr`, `fn`, `r`): `Promise`\<`B`>

Defined in: [promise-result/mapOrElseAsync.ts:22](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/mapOrElseAsync.ts#L22)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `B` | `Promise`\<`B`>

###### fn

(`a`) => `B` | `Promise`\<`B`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<`B`>

***

### matchAsync()

#### Call Signature

> **matchAsync**\<`A`, `E`, `C`>(`onOk`, `onErr`): (`r`) => `Promise`\<`C`>

Defined in: [promise-result/matchAsync.ts:19](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/matchAsync.ts#L19)

##### Type Parameters

###### A

`A`

###### E

`E`

###### C

`C`

##### Parameters

###### onOk

(`a`) => `C` | `Promise`\<`C`>

###### onErr

(`e`) => `C` | `Promise`\<`C`>

##### Returns

(`r`) => `Promise`\<`C`>

#### Call Signature

> **matchAsync**\<`A`, `E`, `C`>(`onOk`, `onErr`, `r`): `Promise`\<`C`>

Defined in: [promise-result/matchAsync.ts:23](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/matchAsync.ts#L23)

##### Type Parameters

###### A

`A`

###### E

`E`

###### C

`C`

##### Parameters

###### onOk

(`a`) => `C` | `Promise`\<`C`>

###### onErr

(`e`) => `C` | `Promise`\<`C`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<`C`>

***

### orElseAsync()

#### Call Signature

> **orElseAsync**\<`E`, `B`, `F`>(`f`): \<`A`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B` | `A`, `F`>>

Defined in: [promise-result/orElseAsync.ts:22](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/orElseAsync.ts#L22)

##### Type Parameters

###### E

`E`

###### B

`B`

###### F

`F`

##### Parameters

###### f

(`e`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

##### Returns

\<`A`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B` | `A`, `F`>>

#### Call Signature

> **orElseAsync**\<`A`, `E`, `B`, `F`>(`f`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A` | `B`, `F`>>

Defined in: [promise-result/orElseAsync.ts:25](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/orElseAsync.ts#L25)

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

(`e`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `F`>>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A` | `B`, `F`>>

***

### swapAsync()

> **swapAsync**\<`A`, `E`>(`r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`E`, `A`>>

Defined in: [promise-result/swapAsync.ts:16](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/swapAsync.ts#L16)

#### Type Parameters

##### A

`A`

##### E

`E`

#### Parameters

##### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

#### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`E`, `A`>>

#### Fileoverview

Swaps the success and failure variants of a `Promise<IResultOfT<A, E>>`.

#### Example

```ts
import { swapAsync, ok } from '@sandlada/result';
const r = await swapAsync(Promise.resolve(ok(5))); // Err(5)
```

*

#### Note

Ready for Product

***

### tapAsync()

#### Call Signature

> **tapAsync**\<`A`>(`fn`): \<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

Defined in: [promise-result/tapAsync.ts:15](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/tapAsync.ts#L15)

##### Type Parameters

###### A

`A`

##### Parameters

###### fn

(`a`) => `void` | `Promise`\<`void`>

##### Returns

\<`E`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

#### Call Signature

> **tapAsync**\<`A`, `E`>(`fn`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

Defined in: [promise-result/tapAsync.ts:18](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/tapAsync.ts#L18)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### fn

(`a`) => `void` | `Promise`\<`void`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

***

### tapErrAsync()

#### Call Signature

> **tapErrAsync**\<`E`>(`fn`): \<`A`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

Defined in: [promise-result/tapErrAsync.ts:15](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/tapErrAsync.ts#L15)

##### Type Parameters

###### E

`E`

##### Parameters

###### fn

(`e`) => `void` | `Promise`\<`void`>

##### Returns

\<`A`>(`r`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

#### Call Signature

> **tapErrAsync**\<`A`, `E`>(`fn`, `r`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

Defined in: [promise-result/tapErrAsync.ts:18](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/tapErrAsync.ts#L18)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### fn

(`e`) => `void` | `Promise`\<`void`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

***

### unwrapOr()

#### Call Signature

> **unwrapOr**\<`A`>(`defaultValue`): \<`E`>(`r`) => `Promise`\<`A`>

Defined in: [promise-result/unwrapOr.ts:21](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/unwrapOr.ts#L21)

##### Type Parameters

###### A

`A`

##### Parameters

###### defaultValue

`A` | `Promise`\<`A`>

##### Returns

\<`E`>(`r`) => `Promise`\<`A`>

#### Call Signature

> **unwrapOr**\<`A`, `E`>(`defaultValue`, `r`): `Promise`\<`A`>

Defined in: [promise-result/unwrapOr.ts:24](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/unwrapOr.ts#L24)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### defaultValue

`A` | `Promise`\<`A`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<`A`>

***

### unwrapOrAsync()

#### Call Signature

> **unwrapOrAsync**\<`A`, `D`>(`defaultValue`): \<`E`>(`r`) => `Promise`\<`A` | `D`>

Defined in: [promise-result/unwrapOrAsync.ts:27](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/unwrapOrAsync.ts#L27)

##### Type Parameters

###### A

`A`

###### D

`D` = `A`

##### Parameters

###### defaultValue

`D` | `Promise`\<`D`>

##### Returns

\<`E`>(`r`) => `Promise`\<`A` | `D`>

#### Call Signature

> **unwrapOrAsync**\<`A`, `E`, `D`>(`defaultValue`, `r`): `Promise`\<`A` | `D`>

Defined in: [promise-result/unwrapOrAsync.ts:30](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/unwrapOrAsync.ts#L30)

##### Type Parameters

###### A

`A`

###### E

`E`

###### D

`D` = `A`

##### Parameters

###### defaultValue

`D` | `Promise`\<`D`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<`A` | `D`>

***

### unwrapOrElse()

#### Call Signature

> **unwrapOrElse**\<`A`, `E`>(`onErr`): (`r`) => `Promise`\<`A`>

Defined in: [promise-result/unwrapOrElse.ts:17](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/unwrapOrElse.ts#L17)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `A` | `Promise`\<`A`>

##### Returns

(`r`) => `Promise`\<`A`>

#### Call Signature

> **unwrapOrElse**\<`A`, `E`>(`onErr`, `r`): `Promise`\<`A`>

Defined in: [promise-result/unwrapOrElse.ts:20](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/unwrapOrElse.ts#L20)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `A` | `Promise`\<`A`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<`A`>

***

### unwrapOrElseAsync()

#### Call Signature

> **unwrapOrElseAsync**\<`A`, `E`, `D`>(`onErr`): (`r`) => `Promise`\<`A` | `D`>

Defined in: [promise-result/unwrapOrElseAsync.ts:23](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/unwrapOrElseAsync.ts#L23)

##### Type Parameters

###### A

`A`

###### E

`E`

###### D

`D` = `A`

##### Parameters

###### onErr

(`e`) => `D` | `Promise`\<`D`>

##### Returns

(`r`) => `Promise`\<`A` | `D`>

#### Call Signature

> **unwrapOrElseAsync**\<`A`, `E`, `D`>(`onErr`, `r`): `Promise`\<`A` | `D`>

Defined in: [promise-result/unwrapOrElseAsync.ts:26](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/promise-result/unwrapOrElseAsync.ts#L26)

##### Type Parameters

###### A

`A`

###### E

`E`

###### D

`D`

##### Parameters

###### onErr

(`e`) => `D` | `Promise`\<`D`>

###### r

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`A`, `E`>>

##### Returns

`Promise`\<`A` | `D`>

## References

### asyncErr

Re-exports [asyncErr](/0.20260811/api/factories/#asyncerr)

***

### asyncOk

Re-exports [asyncOk](/0.20260811/api/factories/#asyncok)
