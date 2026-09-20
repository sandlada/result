---
editUrl: false
next: false
prev: false
title: async-result
slug: 0.20260811/api/async-result
---

## Functions

### and()

> **and**\<`T`, `U`, `E`>(`res1`, `res2`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E`>

Defined in: [async-result/and.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/and.ts#L20)

Returns `res2` if `res1` is `Ok`, otherwise returns the original `Err`.
Short-circuiting — `res2` is not evaluated when `res1` is `Err`.

#### Type Parameters

##### T

`T`

##### U

`U`

##### E

`E`

#### Parameters

##### res1

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### res2

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E`>

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E`>

#### Example

```ts
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';
import { and } from './and.js';

const r1 = await and(fromResult(ok(1)), fromResult(ok(2))).run(); // Ok(2)
const r2 = await and(fromResult(err<string>('a')), fromResult(ok(2))).run(); // Err('a')
```

#### Note

Ready for Product

***

### andTee()

#### Call Signature

> **andTee**\<`T`, `E`>(`fn`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/andTee.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/andTee.ts#L23)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`value`) => `unknown`

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Fileoverview

Side-effect on success (sync or async), ignoring the callback's result.
Calls `fn` with the value on success and passes the original result through unchanged.
Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: If the side-effect callback throws (or rejects), the result
converts to `err(caughtError)` (canonical tap/tee policy — see AGENTS.md).

##### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, andTee } from '@sandlada/result/async-result';

const ar = andTee((v: number) => { console.log(v); }, fromResult(ok(42)));
const result = await ar.run(); // Ok(42)
```

*

##### Note

Ready for Product

#### Call Signature

> **andTee**\<`T`, `E`>(`fn`, `ar`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/andTee.ts:26](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/andTee.ts#L26)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`value`) => `unknown`

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Fileoverview

Side-effect on success (sync or async), ignoring the callback's result.
Calls `fn` with the value on success and passes the original result through unchanged.
Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: If the side-effect callback throws (or rejects), the result
converts to `err(caughtError)` (canonical tap/tee policy — see AGENTS.md).

##### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, andTee } from '@sandlada/result/async-result';

const ar = andTee((v: number) => { console.log(v); }, fromResult(ok(42)));
const result = await ar.run(); // Ok(42)
```

*

##### Note

Ready for Product

***

### andThrough()

#### Call Signature

> **andThrough**\<`T`, `E`, `F`>(`fn`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `F`>

Defined in: [async-result/andThrough.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/andThrough.ts#L23)

##### Type Parameters

###### T

`T`

###### E

`E`

###### F

`F`

##### Parameters

###### fn

(`value`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`unknown`, `F`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`unknown`, `F`>>

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `F`>

##### Fileoverview

Side-effect on success that can propagate errors. Calls `fn` with the value on success; if `fn` fails the failure widens into the original error type.

##### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, andThrough } from '@sandlada/result/async-result';

const validate = andThrough(
  (v: number) => v > 0 ? fromResult(ok(undefined)) : Promise.reject(new Error('non-positive')),
  fromResult(ok(42)),
);
const result = await validate.run(); // Ok(42)
```

*

##### Note

Ready for Product

#### Call Signature

> **andThrough**\<`T`, `E`, `F`>(`fn`, `ar`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `F`>

Defined in: [async-result/andThrough.ts:26](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/andThrough.ts#L26)

##### Type Parameters

###### T

`T`

###### E

`E`

###### F

`F`

##### Parameters

###### fn

(`value`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`unknown`, `F`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`unknown`, `F`>>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `F`>

##### Fileoverview

Side-effect on success that can propagate errors. Calls `fn` with the value on success; if `fn` fails the failure widens into the original error type.

##### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, andThrough } from '@sandlada/result/async-result';

const validate = andThrough(
  (v: number) => v > 0 ? fromResult(ok(undefined)) : Promise.reject(new Error('non-positive')),
  fromResult(ok(42)),
);
const result = await validate.run(); // Ok(42)
```

*

##### Note

Ready for Product

***

### ap()

#### Call Signature

> **ap**\<`A`, `B`, `E`, `F`>(`fnResult`): (`result`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`B`, `E` | `F`>

Defined in: [async-result/ap.ts:29](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/ap.ts#L29)

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

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<(`a`) => `B`, `E`>

##### Returns

(`result`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`B`, `E` | `F`>

#### Call Signature

> **ap**\<`A`, `B`, `E`, `F`>(`fnResult`, `result`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`B`, `E` | `F`>

Defined in: [async-result/ap.ts:32](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/ap.ts#L32)

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

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<(`a`) => `B`, `E`>

###### result

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`A`, `F`>

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`B`, `E` | `F`>

***

### bimap()

#### Call Signature

> **bimap**\<`T`, `E`, `U`, `F`>(`onOk`, `onErr`, `errorFn?`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `F`>

Defined in: [async-result/bimap.ts:28](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/bimap.ts#L28)

##### Type Parameters

###### T

`T`

###### E

`E`

###### U

`U`

###### F

`F`

##### Parameters

###### onOk

(`value`) => `U` | `Promise`\<`U`>

###### onErr

(`error`) => `F` | `Promise`\<`F`>

###### errorFn?

(`thrown`) => `unknown`

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `F`>

#### Call Signature

> **bimap**\<`T`, `E`, `U`, `F`>(`onOk`, `onErr`, `ar`, `errorFn?`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `F`>

Defined in: [async-result/bimap.ts:33](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/bimap.ts#L33)

##### Type Parameters

###### T

`T`

###### E

`E`

###### U

`U`

###### F

`F`

##### Parameters

###### onOk

(`value`) => `U` | `Promise`\<`U`>

###### onErr

(`error`) => `F` | `Promise`\<`F`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### errorFn?

(`thrown`) => `F`

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `F`>

***

### bind()

#### Call Signature

> **bind**\<`T`, `U`, `E`, `F`>(`fn`, `errorFn?`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E` | `F`>

Defined in: [async-result/bind.ts:36](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/bind.ts#L36)

##### Type Parameters

###### T

`T`

###### U

`U`

###### E

`E`

###### F

`F`

##### Parameters

###### fn

(`value`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `F`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`U`, `F`>>

###### errorFn?

(`thrown`) => `unknown`

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E` | `F`>

#### Call Signature

> **bind**\<`T`, `U`, `E`, `F`>(`fn`, `ar`, `errorFn?`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E` | `F`>

Defined in: [async-result/bind.ts:40](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/bind.ts#L40)

##### Type Parameters

###### T

`T`

###### U

`U`

###### E

`E`

###### F

`F`

##### Parameters

###### fn

(`value`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `F`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`U`, `F`>>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### errorFn?

(`thrown`) => `E` | `F`

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E` | `F`>

***

### catchErr()

#### Call Signature

> **catchErr**\<`A`, `E`>(`onErr`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`A`, `never`>

Defined in: [async-result/catchErr.ts:26](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/catchErr.ts#L26)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `A` | `Promise`\<`A`>

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`A`, `never`>

#### Call Signature

> **catchErr**\<`A`, `E`>(`onErr`, `ar`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`A`, `never`>

Defined in: [async-result/catchErr.ts:29](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/catchErr.ts#L29)

##### Type Parameters

###### A

`A`

###### E

`E`

##### Parameters

###### onErr

(`e`) => `A` | `Promise`\<`A`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`A`, `E`>

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`A`, `never`>

***

### combine()

> **combine**\<`T`, `E`>(`results`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`\[], `E`>

Defined in: [async-result/combine.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/combine.ts#L21)

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

***

### combineWithAllErrors()

> **combineWithAllErrors**\<`T`, `E`>(`results`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`\[], `E`\[]>

Defined in: [async-result/combineWithAllErrors.ts:25](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/combineWithAllErrors.ts#L25)

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### results

readonly [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>\[]

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`\[], `E`\[]>

***

### contains()

#### Call Signature

> **contains**\<`T`>(`value`): \<`E`>(`ar`) => `Promise`\<`boolean`>

Defined in: [async-result/contains.ts:16](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/contains.ts#L16)

##### Type Parameters

###### T

`T`

##### Parameters

###### value

`T`

##### Returns

\<`E`>(`ar`) => `Promise`\<`boolean`>

##### Fileoverview

Returns a Promise\<boolean> indicating if the AsyncResult is success and contains the given value.

##### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, contains } from '@sandlada/result/async-result';

const r = await contains(42, fromResult(ok(42))); // true
```

*

##### Note

Ready for Product

#### Call Signature

> **contains**\<`T`, `E`>(`value`, `ar`): `Promise`\<`boolean`>

Defined in: [async-result/contains.ts:19](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/contains.ts#L19)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### value

`T`

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

`Promise`\<`boolean`>

##### Fileoverview

Returns a Promise\<boolean> indicating if the AsyncResult is success and contains the given value.

##### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, contains } from '@sandlada/result/async-result';

const r = await contains(42, fromResult(ok(42))); // true
```

*

##### Note

Ready for Product

***

### containsErr()

#### Call Signature

> **containsErr**\<`T`, `E`>(`error`): (`ar`) => `Promise`\<`boolean`>

Defined in: [async-result/containsErr.ts:18](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/containsErr.ts#L18)

Returns `true` if the `AsyncResult` resolves to `Err` and contains the
given value. Strict equality (`===`).

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### error

`E`

##### Returns

(`ar`) => `Promise`\<`boolean`>

##### Example

```ts
import { fromResult } from './fromResult.js';
import { err } from '../factories/index.js';

await containsErr('boom', fromResult(err('boom'))); // true
await containsErr('nope', fromResult(err('boom')));  // false
```

##### Note

Ready for Product

#### Call Signature

> **containsErr**\<`T`, `E`>(`error`, `ar`): `Promise`\<`boolean`>

Defined in: [async-result/containsErr.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/containsErr.ts#L21)

Returns `true` if the `AsyncResult` resolves to `Err` and contains the
given value. Strict equality (`===`).

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### error

`E`

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

`Promise`\<`boolean`>

##### Example

```ts
import { fromResult } from './fromResult.js';
import { err } from '../factories/index.js';

await containsErr('boom', fromResult(err('boom'))); // true
await containsErr('nope', fromResult(err('boom')));  // false
```

##### Note

Ready for Product

***

### exists()

#### Call Signature

> **exists**\<`T`>(`predicate`): \<`E`>(`ar`) => `Promise`\<`boolean`>

Defined in: [async-result/exists.ts:16](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/exists.ts#L16)

##### Type Parameters

###### T

`T`

##### Parameters

###### predicate

(`value`) => `boolean` | `Promise`\<`boolean`>

##### Returns

\<`E`>(`ar`) => `Promise`\<`boolean`>

##### Fileoverview

Returns a Promise\<boolean> indicating if the AsyncResult is success and the predicate holds.

##### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, exists } from '@sandlada/result/async-result';

const r = await exists((v: number) => v > 0, fromResult(ok(42))); // true
```

*

##### Note

Ready for Product

#### Call Signature

> **exists**\<`T`, `E`>(`predicate`, `ar`): `Promise`\<`boolean`>

Defined in: [async-result/exists.ts:19](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/exists.ts#L19)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### predicate

(`value`) => `boolean` | `Promise`\<`boolean`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

`Promise`\<`boolean`>

##### Fileoverview

Returns a Promise\<boolean> indicating if the AsyncResult is success and the predicate holds.

##### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, exists } from '@sandlada/result/async-result';

const r = await exists((v: number) => v > 0, fromResult(ok(42))); // true
```

*

##### Note

Ready for Product

***

### expect()

#### Call Signature

> **expect**\<`T`, `E`>(`message`, `ar`, `formatErr?`): `Promise`\<`T`>

Defined in: [async-result/expect.ts:28](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/expect.ts#L28)

Like [unwrap](/0.20260811/api/async-result/#unwrap) but throws an `Error` carrying the supplied message.
Useful for marking program-contract violations with a domain-specific
message.

The original error value is preserved as `Error.cause` (and via the
optional `formatErr` hook for custom string shaping), so structured
`E` shapes don't get clobbered to `[object Object]`.

Pass `formatErr` to customise how the original error value is rendered
in the message; pass `throwingFn` to fully replace the thrown `Error`
class — e.g. `expect(msg, ar, info => new MyError(info.message, info.value))`.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### message

`string`

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### formatErr?

(`error`) => `string`

##### Returns

`Promise`\<`T`>

##### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { err } from '@sandlada/result';
import { expect } from '@sandlada/result/async-result';

await expect(fromResult(err('boom')), 'config must be valid'); // throws Error
// The thrown Error carries `cause: 'boom'` so the original payload is preserved.
```

##### Note

Ready for Product

#### Call Signature

> **expect**\<`T`, `E`>(`message`, `ar`, `formatErr`, `throwingFn`): `Promise`\<`T`>

Defined in: [async-result/expect.ts:33](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/expect.ts#L33)

Like [unwrap](/0.20260811/api/async-result/#unwrap) but throws an `Error` carrying the supplied message.
Useful for marking program-contract violations with a domain-specific
message.

The original error value is preserved as `Error.cause` (and via the
optional `formatErr` hook for custom string shaping), so structured
`E` shapes don't get clobbered to `[object Object]`.

Pass `formatErr` to customise how the original error value is rendered
in the message; pass `throwingFn` to fully replace the thrown `Error`
class — e.g. `expect(msg, ar, info => new MyError(info.message, info.value))`.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### message

`string`

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### formatErr

((`error`) => `string`) | `undefined`

###### throwingFn

(`info`) => `Error`

##### Returns

`Promise`\<`T`>

##### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { err } from '@sandlada/result';
import { expect } from '@sandlada/result/async-result';

await expect(fromResult(err('boom')), 'config must be valid'); // throws Error
// The thrown Error carries `cause: 'boom'` so the original payload is preserved.
```

##### Note

Ready for Product

***

### expectErr()

> **expectErr**\<`T`, `E`>(`message`, `ar`, `throwingFn?`): `Promise`\<`E`>

Defined in: [async-result/expectErr.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/expectErr.ts#L23)

Like [unwrapErr](/0.20260811/api/async-result/#unwraperr) but throws an `Error` carrying the supplied message.
Useful when reaching a success path is itself a contract violation.

The original success value is preserved as `Error.cause` (and via the
optional `throwingFn` hook for full customisation), so structured `T`
shapes don't get lost.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### message

`string`

##### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### throwingFn?

(`info`) => `Error`

#### Returns

`Promise`\<`E`>

#### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result';
import { expectErr } from '@sandlada/result/async-result';

await expectErr(fromResult(ok(42)), 'should have failed'); // throws Error
// The thrown Error carries `cause: 42` so the original success value is preserved.
```

#### Note

Ready for Product

***

### filterOrElse()

#### Call Signature

> **filterOrElse**\<`T`, `E`>(`predicate`, `errorFn`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/filterOrElse.ts:25](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/filterOrElse.ts#L25)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### predicate

(`value`) => `boolean` | `Promise`\<`boolean`>

###### errorFn

(`value`) => `E` | `Promise`\<`E`>

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Fileoverview

Filters the success value of an AsyncResult with a predicate.
If the predicate holds, the original success passes through. If it fails,
returns `err(errorFn(value))`. Failures pass through unchanged.
Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: If the predicate or `errorFn` throws synchronously or
returns a rejected Promise, the error is caught and the result converts to
`err(caughtError)` (canonical catch+convert policy — see AGENTS.md).

##### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, filterOrElse } from '@sandlada/result/async-result';
const ar = filterOrElse((x: number) => x > 0, (x: number) => `neg: ${x}`, fromResult(ok(42)));
const result = await ar.run(); // Ok(42)
```

*

##### Note

Ready for Product

#### Call Signature

> **filterOrElse**\<`T`, `E`>(`predicate`, `errorFn`, `ar`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/filterOrElse.ts:29](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/filterOrElse.ts#L29)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### predicate

(`value`) => `boolean` | `Promise`\<`boolean`>

###### errorFn

(`value`) => `E` | `Promise`\<`E`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Fileoverview

Filters the success value of an AsyncResult with a predicate.
If the predicate holds, the original success passes through. If it fails,
returns `err(errorFn(value))`. Failures pass through unchanged.
Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: If the predicate or `errorFn` throws synchronously or
returns a rejected Promise, the error is caught and the result converts to
`err(caughtError)` (canonical catch+convert policy — see AGENTS.md).

##### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, filterOrElse } from '@sandlada/result/async-result';
const ar = filterOrElse((x: number) => x > 0, (x: number) => `neg: ${x}`, fromResult(ok(42)));
const result = await ar.run(); // Ok(42)
```

*

##### Note

Ready for Product

***

### flatten()

> **flatten**\<`T`, `E`>(`ar`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/flatten.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/flatten.ts#L21)

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>, `E`>

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

#### Fileoverview

Flattens a nested AsyncResult.

**Single-step only**: unwraps exactly one layer. Call `flatten` repeatedly
to flatten deeper nests.

#### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, flatten } from '@sandlada/result/async-result';

const ar = flatten(fromResult(fromResult(ok(42))));
const result = await ar.run(); // Ok(42)
```

*

#### Note

Ready for Product

***

### from()

> **from**\<`T`, `E`>(`thunk`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/from.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/from.ts#L20)

AsyncResult — barrel export.

Re-exports all AsyncResult factories and operators.

#### Type Parameters

##### T

`T`

##### E

`E` = `unknown`

#### Parameters

##### thunk

() => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

***

### fromPromise()

> **fromPromise**\<`T`, `E`>(`thunk`, `errorFn?`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/fromPromise.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/fromPromise.ts#L20)

#### Type Parameters

##### T

`T`

##### E

`E` = `unknown`

#### Parameters

##### thunk

() => `Promise`\<`T`>

##### errorFn?

(`error`) => `E`

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

***

### fromResult()

> **fromResult**\<`T`, `E`>(`result`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/fromResult.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/fromResult.ts#L21)

#### Type Parameters

##### T

`T`

##### E

`E` = `unknown`

#### Parameters

##### result

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

***

### isErr()

> **isErr**\<`T`, `E`>(`ar`): `Promise`\<`boolean`>

Defined in: [async-result/isErr.ts:18](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/isErr.ts#L18)

Returns `true` if the `AsyncResult` resolves to `Err`. Mirrors the
`IResultOfT.isFailure` discriminator as a standalone function.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

#### Returns

`Promise`\<`boolean`>

#### Example

```ts
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';

await isErr(fromResult(ok(42)));  // false
await isErr(fromResult(err('x'))); // true
```

#### Note

Ready for Product

***

### isOk()

> **isOk**\<`T`, `E`>(`ar`): `Promise`\<`boolean`>

Defined in: [async-result/isOk.ts:18](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/isOk.ts#L18)

Returns `true` if the `AsyncResult` resolves to `Ok`. Mirrors the
`IResultOfT.isSuccess` discriminator as a standalone function.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

#### Returns

`Promise`\<`boolean`>

#### Example

```ts
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';

await isOk(fromResult(ok(42)));  // true
await isOk(fromResult(err('x'))); // false
```

#### Note

Ready for Product

***

### map()

#### Call Signature

> **map**\<`T`, `U`, `E`>(`fn`, `errorFn?`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E`>

Defined in: [async-result/map.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/map.ts#L23)

##### Type Parameters

###### T

`T`

###### U

`U`

###### E

`E`

##### Parameters

###### fn

(`value`) => `U`

###### errorFn?

(`thrown`) => `unknown`

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E`>

#### Call Signature

> **map**\<`T`, `U`, `E`>(`fn`, `ar`, `errorFn?`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E`>

Defined in: [async-result/map.ts:27](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/map.ts#L27)

##### Type Parameters

###### T

`T`

###### U

`U`

###### E

`E`

##### Parameters

###### fn

(`value`) => `U`

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### errorFn?

(`thrown`) => `E`

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E`>

***

### mapAsync()

#### Call Signature

> **mapAsync**\<`T`, `U`, `E`>(`fn`, `errorFn?`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E`>

Defined in: [async-result/mapAsync.ts:32](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/mapAsync.ts#L32)

##### Type Parameters

###### T

`T`

###### U

`U`

###### E

`E`

##### Parameters

###### fn

(`value`) => `U` | `Promise`\<`U`>

###### errorFn?

(`thrown`) => `unknown`

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E`>

#### Call Signature

> **mapAsync**\<`T`, `U`, `E`>(`fn`, `ar`, `errorFn?`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E`>

Defined in: [async-result/mapAsync.ts:36](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/mapAsync.ts#L36)

##### Type Parameters

###### T

`T`

###### U

`U`

###### E

`E`

##### Parameters

###### fn

(`value`) => `U` | `Promise`\<`U`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### errorFn?

(`thrown`) => `E`

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`U`, `E`>

***

### mapErr()

#### Call Signature

> **mapErr**\<`T`, `E`, `F`>(`fn`, `errorFn?`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `F`>

Defined in: [async-result/mapErr.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/mapErr.ts#L23)

##### Type Parameters

###### T

`T`

###### E

`E`

###### F

`F`

##### Parameters

###### fn

(`error`) => `F`

###### errorFn?

(`thrown`) => `unknown`

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `F`>

#### Call Signature

> **mapErr**\<`T`, `E`, `F`>(`fn`, `ar`, `errorFn?`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `F`>

Defined in: [async-result/mapErr.ts:27](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/mapErr.ts#L27)

##### Type Parameters

###### T

`T`

###### E

`E`

###### F

`F`

##### Parameters

###### fn

(`error`) => `F`

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### errorFn?

(`thrown`) => `F`

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `F`>

***

### mapErrAsync()

#### Call Signature

> **mapErrAsync**\<`T`, `E`, `F`>(`fn`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `F`>

Defined in: [async-result/mapErrAsync.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/mapErrAsync.ts#L20)

##### Type Parameters

###### T

`T`

###### E

`E`

###### F

`F`

##### Parameters

###### fn

(`error`) => `F` | `Promise`\<`F`>

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `F`>

##### Fileoverview

Maps the error of an AsyncResult using an async function.
Lazy — returns a new AsyncResult without executing the inner computation.

##### Example

```ts
import { err } from '@sandlada/result';
import { fromResult, mapErrAsync } from '@sandlada/result/async-result';

const ar = mapErrAsync(async (e: string) => e.toUpperCase(), fromResult(err('oops')));
const result = await ar.run(); // Err('OOPS')
```

*

##### Note

Ready for Product

#### Call Signature

> **mapErrAsync**\<`T`, `E`, `F`>(`fn`, `ar`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `F`>

Defined in: [async-result/mapErrAsync.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/mapErrAsync.ts#L23)

##### Type Parameters

###### T

`T`

###### E

`E`

###### F

`F`

##### Parameters

###### fn

(`error`) => `F` | `Promise`\<`F`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `F`>

##### Fileoverview

Maps the error of an AsyncResult using an async function.
Lazy — returns a new AsyncResult without executing the inner computation.

##### Example

```ts
import { err } from '@sandlada/result';
import { fromResult, mapErrAsync } from '@sandlada/result/async-result';

const ar = mapErrAsync(async (e: string) => e.toUpperCase(), fromResult(err('oops')));
const result = await ar.run(); // Err('OOPS')
```

*

##### Note

Ready for Product

***

### mapOr()

#### Call Signature

> **mapOr**\<`T`, `U`, `E`>(`defaultValue`, `fn`): (`ar`) => `Promise`\<`U`>

Defined in: [async-result/mapOr.ts:19](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/mapOr.ts#L19)

Maps the success value of an `AsyncResult`, or returns a default on failure.
The mapper may be sync or async. Sync throws from the mapper are caught
and converted to the default (canonical AsyncResult catch+convert policy).

##### Type Parameters

###### T

`T`

###### U

`U`

###### E

`E`

##### Parameters

###### defaultValue

`U`

###### fn

(`value`) => `U` | `Promise`\<`U`>

##### Returns

(`ar`) => `Promise`\<`U`>

##### Example

```ts
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';

const v1 = await mapOr(-1, (x: number) => x * 2, fromResult(ok(21))); // 42
const v2 = await mapOr(-1, (x: number) => x * 2, fromResult(err('x'))); // -1
```

##### Note

Ready for Product

#### Call Signature

> **mapOr**\<`T`, `U`, `E`>(`defaultValue`, `fn`, `ar`): `Promise`\<`U`>

Defined in: [async-result/mapOr.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/mapOr.ts#L23)

Maps the success value of an `AsyncResult`, or returns a default on failure.
The mapper may be sync or async. Sync throws from the mapper are caught
and converted to the default (canonical AsyncResult catch+convert policy).

##### Type Parameters

###### T

`T`

###### U

`U`

###### E

`E`

##### Parameters

###### defaultValue

`U`

###### fn

(`value`) => `U` | `Promise`\<`U`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

`Promise`\<`U`>

##### Example

```ts
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';

const v1 = await mapOr(-1, (x: number) => x * 2, fromResult(ok(21))); // 42
const v2 = await mapOr(-1, (x: number) => x * 2, fromResult(err('x'))); // -1
```

##### Note

Ready for Product

***

### mapOrElse()

#### Call Signature

> **mapOrElse**\<`T`, `U`, `E`>(`onErr`, `fn`): (`ar`) => `Promise`\<`U`>

Defined in: [async-result/mapOrElse.ts:19](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/mapOrElse.ts#L19)

Maps the success value of an `AsyncResult`, or computes a default from the
error on failure. Both callbacks may be sync or async. Lazy — `onErr` is
only called on failure.

##### Type Parameters

###### T

`T`

###### U

`U`

###### E

`E`

##### Parameters

###### onErr

(`error`) => `U` | `Promise`\<`U`>

###### fn

(`value`) => `U` | `Promise`\<`U`>

##### Returns

(`ar`) => `Promise`\<`U`>

##### Example

```ts
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';

const v1 = await mapOrElse((e: string) => -1, (x: number) => x * 2, fromResult(ok(21))); // 42
const v2 = await mapOrElse((e: string) => -1, (x: number) => x * 2, fromResult(err('x'))); // -1
```

##### Note

Ready for Product

#### Call Signature

> **mapOrElse**\<`T`, `U`, `E`>(`onErr`, `fn`, `ar`): `Promise`\<`U`>

Defined in: [async-result/mapOrElse.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/mapOrElse.ts#L23)

Maps the success value of an `AsyncResult`, or computes a default from the
error on failure. Both callbacks may be sync or async. Lazy — `onErr` is
only called on failure.

##### Type Parameters

###### T

`T`

###### U

`U`

###### E

`E`

##### Parameters

###### onErr

(`error`) => `U` | `Promise`\<`U`>

###### fn

(`value`) => `U` | `Promise`\<`U`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

`Promise`\<`U`>

##### Example

```ts
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';

const v1 = await mapOrElse((e: string) => -1, (x: number) => x * 2, fromResult(ok(21))); // 42
const v2 = await mapOrElse((e: string) => -1, (x: number) => x * 2, fromResult(err('x'))); // -1
```

##### Note

Ready for Product

***

### match()

#### Call Signature

> **match**\<`T`, `E`, `U`>(`handlers`): (`ar`) => `Promise`\<`U`>

Defined in: [async-result/match.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/match.ts#L21)

##### Type Parameters

###### T

`T`

###### E

`E`

###### U

`U`

##### Parameters

###### handlers

###### err

(`error`) => `U` | `Promise`\<`U`>

###### ok

(`value`) => `U` | `Promise`\<`U`>

##### Returns

(`ar`) => `Promise`\<`U`>

#### Call Signature

> **match**\<`T`, `E`, `U`>(`handlers`, `ar`): `Promise`\<`U`>

Defined in: [async-result/match.ts:24](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/match.ts#L24)

##### Type Parameters

###### T

`T`

###### E

`E`

###### U

`U`

##### Parameters

###### handlers

###### err

(`error`) => `U` | `Promise`\<`U`>

###### ok

(`value`) => `U` | `Promise`\<`U`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

`Promise`\<`U`>

***

### or()

> **or**\<`T`, `E`, `F`>(`res1`, `res2`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `F`>

Defined in: [async-result/or.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/or.ts#L20)

Returns `res1` if it is `Ok`, otherwise returns `res2`. Short-circuiting —
`res2` is not evaluated when `res1` is `Ok`.

#### Type Parameters

##### T

`T`

##### E

`E`

##### F

`F`

#### Parameters

##### res1

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### res2

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `F`>

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `F`>

#### Example

```ts
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';
import { or } from './or.js';

const r1 = await or(fromResult(ok(1)), fromResult(ok(2))).run(); // Ok(1)
const r2 = await or(fromResult(err<string>('a')), fromResult(ok(2))).run(); // Ok(2)
```

#### Note

Ready for Product

***

### orElse()

#### Call Signature

> **orElse**\<`T`, `E`, `F`>(`fn`, `errorFn?`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `F`>

Defined in: [async-result/orElse.ts:25](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/orElse.ts#L25)

##### Type Parameters

###### T

`T`

###### E

`E`

###### F

`F`

##### Parameters

###### fn

(`error`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `F`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `F`>>

###### errorFn?

(`thrown`) => `unknown`

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `F`>

#### Call Signature

> **orElse**\<`T`, `E`, `F`>(`fn`, `ar`, `errorFn?`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `F`>

Defined in: [async-result/orElse.ts:29](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/orElse.ts#L29)

##### Type Parameters

###### T

`T`

###### E

`E`

###### F

`F`

##### Parameters

###### fn

(`error`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `F`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `F`>>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### errorFn?

(`thrown`) => `E` | `F`

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `F`>

***

### orTee()

#### Call Signature

> **orTee**\<`T`, `E`>(`fn`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/orTee.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/orTee.ts#L23)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`error`) => `unknown`

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Fileoverview

Side-effect on failure (sync or async), ignoring the callback's result.
Calls `fn` with the error on failure and passes the original result through unchanged.
Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: If the side-effect callback throws (or rejects), the result
converts to `err(caughtError)` (canonical tap/tee policy — see AGENTS.md).

##### Example

```ts
import { err } from '@sandlada/result';
import { fromResult, orTee } from '@sandlada/result/async-result';

const ar = orTee((e: string) => { console.error(e); }, fromResult(err('oops')));
const result = await ar.run(); // Err('oops')
```

*

##### Note

Ready for Product

#### Call Signature

> **orTee**\<`T`, `E`>(`fn`, `ar`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/orTee.ts:26](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/orTee.ts#L26)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`error`) => `unknown`

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Fileoverview

Side-effect on failure (sync or async), ignoring the callback's result.
Calls `fn` with the error on failure and passes the original result through unchanged.
Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: If the side-effect callback throws (or rejects), the result
converts to `err(caughtError)` (canonical tap/tee policy — see AGENTS.md).

##### Example

```ts
import { err } from '@sandlada/result';
import { fromResult, orTee } from '@sandlada/result/async-result';

const ar = orTee((e: string) => { console.error(e); }, fromResult(err('oops')));
const result = await ar.run(); // Err('oops')
```

*

##### Note

Ready for Product

***

### swapAsync()

> **swapAsync**\<`T`, `E`>(`ar`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`E`, `T`>

Defined in: [async-result/swapAsync.ts:22](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/swapAsync.ts#L22)

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`E`, `T`>

#### Fileoverview

AsyncResult analogue of swap. Swaps the Ok and Err
variants of an AsyncResult. Renamed from `swap` to align with `mapAsync` and
other async-result operators.

#### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, swapAsync } from '@sandlada/result/async-result';

const ar = swapAsync(fromResult(ok(5)));
const result = await ar.run(); // Err(5)
```

#### Note

Ready for Product

***

### tap()

#### Call Signature

> **tap**\<`T`, `E`>(`fn`, `errorFn?`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/tap.ts:31](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/tap.ts#L31)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`value`) => `void` | `Promise`\<`void`>

###### errorFn?

(`thrown`) => `unknown`

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

#### Call Signature

> **tap**\<`T`, `E`>(`fn`, `ar`, `errorFn?`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/tap.ts:35](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/tap.ts#L35)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`value`) => `void` | `Promise`\<`void`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### errorFn?

(`thrown`) => `E`

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

***

### tapAsync()

#### Call Signature

> **tapAsync**\<`T`, `E`>(`fn`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/tapAsync.ts:18](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/tapAsync.ts#L18)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`value`) => `void` | `Promise`\<`void`>

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Fileoverview

Side-effect on the success track using an async function.
Lazy — returns a new AsyncResult without executing the inner computation.

##### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, tapAsync } from '@sandlada/result/async-result';

const ar = tapAsync(async (v: number) => { await save(v); }, fromResult(ok(42)));
```

*

##### Note

Ready for Product

#### Call Signature

> **tapAsync**\<`T`, `E`>(`fn`, `ar`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/tapAsync.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/tapAsync.ts#L21)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`value`) => `void` | `Promise`\<`void`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Fileoverview

Side-effect on the success track using an async function.
Lazy — returns a new AsyncResult without executing the inner computation.

##### Example

```ts
import { ok } from '@sandlada/result';
import { fromResult, tapAsync } from '@sandlada/result/async-result';

const ar = tapAsync(async (v: number) => { await save(v); }, fromResult(ok(42)));
```

*

##### Note

Ready for Product

***

### tapErr()

#### Call Signature

> **tapErr**\<`T`, `E`>(`fn`, `errorFn?`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/tapErr.ts:31](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/tapErr.ts#L31)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`error`) => `void` | `Promise`\<`void`>

###### errorFn?

(`thrown`) => `unknown`

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

#### Call Signature

> **tapErr**\<`T`, `E`>(`fn`, `ar`, `errorFn?`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/tapErr.ts:35](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/tapErr.ts#L35)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`error`) => `void` | `Promise`\<`void`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### errorFn?

(`thrown`) => `E`

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

***

### tapErrAsync()

#### Call Signature

> **tapErrAsync**\<`T`, `E`>(`fn`): (`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/tapErrAsync.ts:18](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/tapErrAsync.ts#L18)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`error`) => `void` | `Promise`\<`void`>

##### Returns

(`ar`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Fileoverview

Side-effect on the error track using an async function.
Lazy — returns a new AsyncResult without executing the inner computation.

##### Example

```ts
import { err } from '@sandlada/result';
import { fromResult, tapErrAsync } from '@sandlada/result/async-result';

const ar = tapErrAsync(async (e: string) => { await log(e); }, fromResult(err('oops')));
```

*

##### Note

Ready for Product

#### Call Signature

> **tapErrAsync**\<`T`, `E`>(`fn`, `ar`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-result/tapErrAsync.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/tapErrAsync.ts#L21)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### fn

(`error`) => `void` | `Promise`\<`void`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Fileoverview

Side-effect on the error track using an async function.
Lazy — returns a new AsyncResult without executing the inner computation.

##### Example

```ts
import { err } from '@sandlada/result';
import { fromResult, tapErrAsync } from '@sandlada/result/async-result';

const ar = tapErrAsync(async (e: string) => { await log(e); }, fromResult(err('oops')));
```

*

##### Note

Ready for Product

***

### unwrap()

#### Call Signature

> **unwrap**\<`T`, `E`>(`ar`): `Promise`\<`T`>

Defined in: [async-result/unwrap.ts:24](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/unwrap.ts#L24)

Extracts the success value from an `AsyncResult`, or throws on failure.
Use sparingly — prefer `unwrapOr`, `unwrapOrElse`, or `match` in most code.

The original error value is preserved as `Error.cause` (or via the
optional `formatErr` hook), so structured `E` shapes don't get
clobbered to `[object Object]`. Pass `throwingFn` to fully replace the
thrown `Error` class.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

`Promise`\<`T`>

##### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result';
import { unwrap } from '@sandlada/result/async-result';

await unwrap(fromResult(ok(42)));    // 42
await unwrap(fromResult(err('boom'))); // throws Error with `cause: 'boom'`
```

##### Note

Ready for Product

#### Call Signature

> **unwrap**\<`T`, `E`>(`ar`, `formatErr?`): `Promise`\<`T`>

Defined in: [async-result/unwrap.ts:25](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/unwrap.ts#L25)

Extracts the success value from an `AsyncResult`, or throws on failure.
Use sparingly — prefer `unwrapOr`, `unwrapOrElse`, or `match` in most code.

The original error value is preserved as `Error.cause` (or via the
optional `formatErr` hook), so structured `E` shapes don't get
clobbered to `[object Object]`. Pass `throwingFn` to fully replace the
thrown `Error` class.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### formatErr?

(`error`) => `string`

##### Returns

`Promise`\<`T`>

##### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result';
import { unwrap } from '@sandlada/result/async-result';

await unwrap(fromResult(ok(42)));    // 42
await unwrap(fromResult(err('boom'))); // throws Error with `cause: 'boom'`
```

##### Note

Ready for Product

#### Call Signature

> **unwrap**\<`T`, `E`>(`ar`, `formatErr`, `throwingFn`): `Promise`\<`T`>

Defined in: [async-result/unwrap.ts:29](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/unwrap.ts#L29)

Extracts the success value from an `AsyncResult`, or throws on failure.
Use sparingly — prefer `unwrapOr`, `unwrapOrElse`, or `match` in most code.

The original error value is preserved as `Error.cause` (or via the
optional `formatErr` hook), so structured `E` shapes don't get
clobbered to `[object Object]`. Pass `throwingFn` to fully replace the
thrown `Error` class.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### formatErr

((`error`) => `string`) | `undefined`

###### throwingFn

(`info`) => `Error`

##### Returns

`Promise`\<`T`>

##### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result';
import { unwrap } from '@sandlada/result/async-result';

await unwrap(fromResult(ok(42)));    // 42
await unwrap(fromResult(err('boom'))); // throws Error with `cause: 'boom'`
```

##### Note

Ready for Product

***

### unwrapErr()

#### Call Signature

> **unwrapErr**\<`T`, `E`>(`ar`): `Promise`\<`E`>

Defined in: [async-result/unwrapErr.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/unwrapErr.ts#L23)

Extracts the error from a failed `AsyncResult`, or throws on success.
The dual of [unwrap](/0.20260811/api/async-result/#unwrap).

The original success value is preserved as `Error.cause`, so structured
`T` shapes don't get lost. Pass `throwingFn` to fully replace the
thrown `Error` class.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

`Promise`\<`E`>

##### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result';
import { unwrapErr } from '@sandlada/result/async-result';

await unwrapErr(fromResult(err('boom')));  // 'boom'
await unwrapErr(fromResult(ok(42)));       // throws Error with `cause: 42`
```

##### Note

Ready for Product

#### Call Signature

> **unwrapErr**\<`T`, `E`>(`ar`, `throwingFn?`): `Promise`\<`E`>

Defined in: [async-result/unwrapErr.ts:24](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/unwrapErr.ts#L24)

Extracts the error from a failed `AsyncResult`, or throws on success.
The dual of [unwrap](/0.20260811/api/async-result/#unwrap).

The original success value is preserved as `Error.cause`, so structured
`T` shapes don't get lost. Pass `throwingFn` to fully replace the
thrown `Error` class.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

###### throwingFn?

(`info`) => `Error`

##### Returns

`Promise`\<`E`>

##### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result';
import { unwrapErr } from '@sandlada/result/async-result';

await unwrapErr(fromResult(err('boom')));  // 'boom'
await unwrapErr(fromResult(ok(42)));       // throws Error with `cause: 42`
```

##### Note

Ready for Product

***

### unwrapOr()

#### Call Signature

> **unwrapOr**\<`T`, `E`>(`defaultValue`): (`ar`) => `Promise`\<`T`>

Defined in: [async-result/unwrapOr.ts:19](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/unwrapOr.ts#L19)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### defaultValue

`T` | `Promise`\<`T`>

##### Returns

(`ar`) => `Promise`\<`T`>

#### Call Signature

> **unwrapOr**\<`T`, `E`>(`defaultValue`, `ar`): `Promise`\<`T`>

Defined in: [async-result/unwrapOr.ts:22](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/unwrapOr.ts#L22)

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### defaultValue

`T` | `Promise`\<`T`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

`Promise`\<`T`>

***

### unwrapOrElse()

#### Call Signature

> **unwrapOrElse**\<`T`, `E`, `U`>(`onErr`): (`ar`) => `Promise`\<`T` | `U`>

Defined in: [async-result/unwrapOrElse.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/unwrapOrElse.ts#L20)

Extracts the success value from an `AsyncResult`, or computes a default from
the error on failure. The handler may be sync or async. Lazy — the handler
is only called on failure.

##### Type Parameters

###### T

`T`

###### E

`E`

###### U

`U`

##### Parameters

###### onErr

(`error`) => `U` | `Promise`\<`U`>

##### Returns

(`ar`) => `Promise`\<`T` | `U`>

##### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result';
import { unwrapOrElse } from '@sandlada/result/async-result';

const v1 = await unwrapOrElse(() => 0, fromResult(ok(42))); // 42
const v2 = await unwrapOrElse((e: string) => -1, fromResult(err('boom'))); // -1
```

##### Note

Ready for Product

#### Call Signature

> **unwrapOrElse**\<`T`, `E`, `U`>(`onErr`, `ar`): `Promise`\<`T` | `U`>

Defined in: [async-result/unwrapOrElse.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/async-result/unwrapOrElse.ts#L23)

Extracts the success value from an `AsyncResult`, or computes a default from
the error on failure. The handler may be sync or async. Lazy — the handler
is only called on failure.

##### Type Parameters

###### T

`T`

###### E

`E`

###### U

`U`

##### Parameters

###### onErr

(`error`) => `U` | `Promise`\<`U`>

###### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Returns

`Promise`\<`T` | `U`>

##### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result';
import { unwrapOrElse } from '@sandlada/result/async-result';

const v1 = await unwrapOrElse(() => 0, fromResult(ok(42))); // 42
const v2 = await unwrapOrElse((e: string) => -1, fromResult(err('boom'))); // -1
```

##### Note

Ready for Product
