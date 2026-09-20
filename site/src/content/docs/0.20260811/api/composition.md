---
editUrl: false
next: false
prev: false
title: composition
slug: 0.20260811/api/composition
---

## Functions

### composeK()

Composition utilities — barrel export.

Re-exports Kleisli composition and pipe utilities for Result pipelines.

#### Call Signature

> **composeK**\<`A`, `B`, `C`, `E`>(`f1`, `f2`): (`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>

Defined in: [composition/composeK.ts:46](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/composeK.ts#L46)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### E

`E`

##### Parameters

###### f1

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

###### f2

(`b`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>

##### Returns

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>

#### Call Signature

> **composeK**\<`A`, `B`, `C`, `D`, `E`>(`f1`, `f2`, `f3`): (`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`>

Defined in: [composition/composeK.ts:52](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/composeK.ts#L52)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

##### Parameters

###### f1

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

###### f2

(`b`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>

###### f3

(`c`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`>

##### Returns

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`>

#### Call Signature

> **composeK**\<`A`, `B`, `C`, `D`, `F`, `E`>(`f1`, `f2`, `f3`, `f4`): (`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`>

Defined in: [composition/composeK.ts:59](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/composeK.ts#L59)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### F

`F`

###### E

`E`

##### Parameters

###### f1

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

###### f2

(`b`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>

###### f3

(`c`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`>

###### f4

(`d`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`>

##### Returns

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`>

#### Call Signature

> **composeK**\<`A`, `B`, `C`, `D`, `F`, `G`, `E`>(`f1`, `f2`, `f3`, `f4`, `f5`): (`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`G`, `E`>

Defined in: [composition/composeK.ts:67](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/composeK.ts#L67)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### F

`F`

###### G

`G`

###### E

`E`

##### Parameters

###### f1

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

###### f2

(`b`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>

###### f3

(`c`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`>

###### f4

(`d`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`>

###### f5

(`f`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`G`, `E`>

##### Returns

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`G`, `E`>

#### Call Signature

> **composeK**\<`A`, `B`, `C`, `D`, `F`, `G`, `H`, `E`>(`f1`, `f2`, `f3`, `f4`, `f5`, `f6`): (`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`H`, `E`>

Defined in: [composition/composeK.ts:76](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/composeK.ts#L76)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### F

`F`

###### G

`G`

###### H

`H`

###### E

`E`

##### Parameters

###### f1

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>

###### f2

(`b`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>

###### f3

(`c`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`>

###### f4

(`d`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`>

###### f5

(`f`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`G`, `E`>

###### f6

(`g`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`H`, `E`>

##### Returns

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`H`, `E`>

***

### composeKAsync()

#### Call Signature

> **composeKAsync**\<`A`, `B`, `E`>(`f1`): (`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

Defined in: [composition/composeKAsync.ts:38](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/composeKAsync.ts#L38)

##### Type Parameters

###### A

`A`

###### B

`B`

###### E

`E`

##### Parameters

###### f1

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

##### Returns

(`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

#### Call Signature

> **composeKAsync**\<`A`, `B`, `C`, `E`>(`f1`, `f2`): (`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>>

Defined in: [composition/composeKAsync.ts:43](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/composeKAsync.ts#L43)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### E

`E`

##### Parameters

###### f1

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

###### f2

(`b`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>>

##### Returns

(`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>>

#### Call Signature

> **composeKAsync**\<`A`, `B`, `C`, `D`, `E`>(`f1`, `f2`, `f3`): (`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`>>

Defined in: [composition/composeKAsync.ts:49](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/composeKAsync.ts#L49)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

##### Parameters

###### f1

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

###### f2

(`b`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>>

###### f3

(`c`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`>>

##### Returns

(`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`>>

#### Call Signature

> **composeKAsync**\<`A`, `B`, `C`, `D`, `F`, `E`>(`f1`, `f2`, `f3`, `f4`): (`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`>>

Defined in: [composition/composeKAsync.ts:56](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/composeKAsync.ts#L56)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### F

`F`

###### E

`E`

##### Parameters

###### f1

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

###### f2

(`b`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>>

###### f3

(`c`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`>>

###### f4

(`d`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`>>

##### Returns

(`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`>>

#### Call Signature

> **composeKAsync**\<`A`, `B`, `C`, `D`, `F`, `G`, `E`>(`f1`, `f2`, `f3`, `f4`, `f5`): (`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`G`, `E`>>

Defined in: [composition/composeKAsync.ts:64](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/composeKAsync.ts#L64)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### F

`F`

###### G

`G`

###### E

`E`

##### Parameters

###### f1

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

###### f2

(`b`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>>

###### f3

(`c`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`>>

###### f4

(`d`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`>>

###### f5

(`f`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`G`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`G`, `E`>>

##### Returns

(`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`G`, `E`>>

#### Call Signature

> **composeKAsync**\<`A`, `B`, `C`, `D`, `F`, `G`, `H`, `E`>(`f1`, `f2`, `f3`, `f4`, `f5`, `f6`): (`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`H`, `E`>>

Defined in: [composition/composeKAsync.ts:73](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/composeKAsync.ts#L73)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### F

`F`

###### G

`G`

###### H

`H`

###### E

`E`

##### Parameters

###### f1

(`a`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`B`, `E`>>

###### f2

(`b`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`C`, `E`>>

###### f3

(`c`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`D`, `E`>>

###### f4

(`d`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`F`, `E`>>

###### f5

(`f`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`G`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`G`, `E`>>

###### f6

(`g`) => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`H`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`H`, `E`>>

##### Returns

(`a`) => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`H`, `E`>>

***

### fromSafeTry()

> **fromSafeTry**\<`T`, `E`>(`gen`): [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

Defined in: [composition/safeTry.ts:70](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/safeTry.ts#L70)

Evaluates a generator function that uses `yield* safeTry(...)` and
collects the final `IResultOfT`.

* If the generator **returns** a value: the value is wrapped in `ok()`.
* If the generator **yields** a value: that yield is treated as a propagated
  failure and returned as-is.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### gen

() => `Generator`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`never`, `E`>, `T` | `undefined`, `unknown`>

#### Returns

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

#### Example

```ts
const result = fromSafeTry(function* () {
  const data = yield* safeTry(fetchData());
  return data.items.length;
});
```

***

### fromSafeTryAsync()

> **fromSafeTryAsync**\<`T`, `E`>(`gen`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [composition/safeTryAsync.ts:68](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/safeTryAsync.ts#L68)

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### gen

() => `AsyncGenerator`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`never`, `E`>, `T` | `undefined`, `unknown`>

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

***

### pipe()

#### Call Signature

> **pipe**\<`A`>(`value`): `A`

Defined in: [composition/pipe.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipe.ts#L20)

##### Type Parameters

###### A

`A`

##### Parameters

###### value

`A`

##### Returns

`A`

##### Fileoverview

Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.

F# equivalent: `value |> fn1 |> fn2 |> fn3`

##### Example

```ts
import { pipe, map, bind, match, ok, err } from '@sandlada/result';
pipe(
  ok(42),
  map(x => x * 2),
  bind(x => x > 50 ? ok(x) : err('too small')),
  match(v => `OK: ${v}`, e => `Error: ${e}`),
); // "OK: 84"
```

*

##### Note

Ready for Product

#### Call Signature

> **pipe**\<`A`, `B`>(`value`, `fn1`): `B`

Defined in: [composition/pipe.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipe.ts#L21)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

##### Returns

`B`

##### Fileoverview

Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.

F# equivalent: `value |> fn1 |> fn2 |> fn3`

##### Example

```ts
import { pipe, map, bind, match, ok, err } from '@sandlada/result';
pipe(
  ok(42),
  map(x => x * 2),
  bind(x => x > 50 ? ok(x) : err('too small')),
  match(v => `OK: ${v}`, e => `Error: ${e}`),
); // "OK: 84"
```

*

##### Note

Ready for Product

#### Call Signature

> **pipe**\<`A`, `B`, `C`>(`value`, `fn1`, `fn2`): `C`

Defined in: [composition/pipe.ts:22](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipe.ts#L22)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

##### Returns

`C`

##### Fileoverview

Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.

F# equivalent: `value |> fn1 |> fn2 |> fn3`

##### Example

```ts
import { pipe, map, bind, match, ok, err } from '@sandlada/result';
pipe(
  ok(42),
  map(x => x * 2),
  bind(x => x > 50 ? ok(x) : err('too small')),
  match(v => `OK: ${v}`, e => `Error: ${e}`),
); // "OK: 84"
```

*

##### Note

Ready for Product

#### Call Signature

> **pipe**\<`A`, `B`, `C`, `D`>(`value`, `fn1`, `fn2`, `fn3`): `D`

Defined in: [composition/pipe.ts:23](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipe.ts#L23)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

##### Returns

`D`

##### Fileoverview

Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.

F# equivalent: `value |> fn1 |> fn2 |> fn3`

##### Example

```ts
import { pipe, map, bind, match, ok, err } from '@sandlada/result';
pipe(
  ok(42),
  map(x => x * 2),
  bind(x => x > 50 ? ok(x) : err('too small')),
  match(v => `OK: ${v}`, e => `Error: ${e}`),
); // "OK: 84"
```

*

##### Note

Ready for Product

#### Call Signature

> **pipe**\<`A`, `B`, `C`, `D`, `E`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`): `E`

Defined in: [composition/pipe.ts:24](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipe.ts#L24)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

##### Returns

`E`

##### Fileoverview

Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.

F# equivalent: `value |> fn1 |> fn2 |> fn3`

##### Example

```ts
import { pipe, map, bind, match, ok, err } from '@sandlada/result';
pipe(
  ok(42),
  map(x => x * 2),
  bind(x => x > 50 ? ok(x) : err('too small')),
  match(v => `OK: ${v}`, e => `Error: ${e}`),
); // "OK: 84"
```

*

##### Note

Ready for Product

#### Call Signature

> **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`): `F`

Defined in: [composition/pipe.ts:27](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipe.ts#L27)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

###### F

`F`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

###### fn5

(`e`) => `F`

##### Returns

`F`

##### Fileoverview

Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.

F# equivalent: `value |> fn1 |> fn2 |> fn3`

##### Example

```ts
import { pipe, map, bind, match, ok, err } from '@sandlada/result';
pipe(
  ok(42),
  map(x => x * 2),
  bind(x => x > 50 ? ok(x) : err('too small')),
  match(v => `OK: ${v}`, e => `Error: ${e}`),
); // "OK: 84"
```

*

##### Note

Ready for Product

#### Call Signature

> **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`): `G`

Defined in: [composition/pipe.ts:30](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipe.ts#L30)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

###### F

`F`

###### G

`G`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

###### fn5

(`e`) => `F`

###### fn6

(`f`) => `G`

##### Returns

`G`

##### Fileoverview

Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.

F# equivalent: `value |> fn1 |> fn2 |> fn3`

##### Example

```ts
import { pipe, map, bind, match, ok, err } from '@sandlada/result';
pipe(
  ok(42),
  map(x => x * 2),
  bind(x => x > 50 ? ok(x) : err('too small')),
  match(v => `OK: ${v}`, e => `Error: ${e}`),
); // "OK: 84"
```

*

##### Note

Ready for Product

#### Call Signature

> **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`, `fn7`): `H`

Defined in: [composition/pipe.ts:34](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipe.ts#L34)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

###### F

`F`

###### G

`G`

###### H

`H`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

###### fn5

(`e`) => `F`

###### fn6

(`f`) => `G`

###### fn7

(`g`) => `H`

##### Returns

`H`

##### Fileoverview

Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.

F# equivalent: `value |> fn1 |> fn2 |> fn3`

##### Example

```ts
import { pipe, map, bind, match, ok, err } from '@sandlada/result';
pipe(
  ok(42),
  map(x => x * 2),
  bind(x => x > 50 ? ok(x) : err('too small')),
  match(v => `OK: ${v}`, e => `Error: ${e}`),
); // "OK: 84"
```

*

##### Note

Ready for Product

#### Call Signature

> **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`, `fn7`, `fn8`): `I`

Defined in: [composition/pipe.ts:38](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipe.ts#L38)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

###### F

`F`

###### G

`G`

###### H

`H`

###### I

`I`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

###### fn5

(`e`) => `F`

###### fn6

(`f`) => `G`

###### fn7

(`g`) => `H`

###### fn8

(`h`) => `I`

##### Returns

`I`

##### Fileoverview

Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.

F# equivalent: `value |> fn1 |> fn2 |> fn3`

##### Example

```ts
import { pipe, map, bind, match, ok, err } from '@sandlada/result';
pipe(
  ok(42),
  map(x => x * 2),
  bind(x => x > 50 ? ok(x) : err('too small')),
  match(v => `OK: ${v}`, e => `Error: ${e}`),
); // "OK: 84"
```

*

##### Note

Ready for Product

#### Call Signature

> **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`, `fn7`, `fn8`, `fn9`): `J`

Defined in: [composition/pipe.ts:42](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipe.ts#L42)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

###### F

`F`

###### G

`G`

###### H

`H`

###### I

`I`

###### J

`J`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

###### fn5

(`e`) => `F`

###### fn6

(`f`) => `G`

###### fn7

(`g`) => `H`

###### fn8

(`h`) => `I`

###### fn9

(`i`) => `J`

##### Returns

`J`

##### Fileoverview

Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.

F# equivalent: `value |> fn1 |> fn2 |> fn3`

##### Example

```ts
import { pipe, map, bind, match, ok, err } from '@sandlada/result';
pipe(
  ok(42),
  map(x => x * 2),
  bind(x => x > 50 ? ok(x) : err('too small')),
  match(v => `OK: ${v}`, e => `Error: ${e}`),
); // "OK: 84"
```

*

##### Note

Ready for Product

#### Call Signature

> **pipe**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`, `fn7`, `fn8`, `fn9`, `fn10`): `K`

Defined in: [composition/pipe.ts:47](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipe.ts#L47)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

###### F

`F`

###### G

`G`

###### H

`H`

###### I

`I`

###### J

`J`

###### K

`K`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

###### fn5

(`e`) => `F`

###### fn6

(`f`) => `G`

###### fn7

(`g`) => `H`

###### fn8

(`h`) => `I`

###### fn9

(`i`) => `J`

###### fn10

(`j`) => `K`

##### Returns

`K`

##### Fileoverview

Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.

F# equivalent: `value |> fn1 |> fn2 |> fn3`

##### Example

```ts
import { pipe, map, bind, match, ok, err } from '@sandlada/result';
pipe(
  ok(42),
  map(x => x * 2),
  bind(x => x > 50 ? ok(x) : err('too small')),
  match(v => `OK: ${v}`, e => `Error: ${e}`),
); // "OK: 84"
```

*

##### Note

Ready for Product

***

### pipeAsync()

#### Call Signature

> **pipeAsync**\<`A`>(`value`): `Promise`\<`A`>

Defined in: [composition/pipeAsync.ts:18](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipeAsync.ts#L18)

##### Type Parameters

###### A

`A`

##### Parameters

###### value

`A`

##### Returns

`Promise`\<`A`>

##### Fileoverview

Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.

##### Example

```ts
import { pipeAsync, asyncOk, mapAsync, bindAsync, matchAsync, asyncErr } from '@sandlada/result';
await pipeAsync(
  asyncOk(42),
  mapAsync(x => x * 2),
  bindAsync(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
  matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

*

##### Note

Ready for Product

#### Call Signature

> **pipeAsync**\<`A`, `B`>(`value`, `fn1`): `Promise`\<`B`>

Defined in: [composition/pipeAsync.ts:19](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipeAsync.ts#L19)

##### Type Parameters

###### A

`A`

###### B

`B`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

##### Returns

`Promise`\<`B`>

##### Fileoverview

Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.

##### Example

```ts
import { pipeAsync, asyncOk, mapAsync, bindAsync, matchAsync, asyncErr } from '@sandlada/result';
await pipeAsync(
  asyncOk(42),
  mapAsync(x => x * 2),
  bindAsync(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
  matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

*

##### Note

Ready for Product

#### Call Signature

> **pipeAsync**\<`A`, `B`, `C`>(`value`, `fn1`, `fn2`): `Promise`\<`C`>

Defined in: [composition/pipeAsync.ts:20](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipeAsync.ts#L20)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

##### Returns

`Promise`\<`C`>

##### Fileoverview

Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.

##### Example

```ts
import { pipeAsync, asyncOk, mapAsync, bindAsync, matchAsync, asyncErr } from '@sandlada/result';
await pipeAsync(
  asyncOk(42),
  mapAsync(x => x * 2),
  bindAsync(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
  matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

*

##### Note

Ready for Product

#### Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`>(`value`, `fn1`, `fn2`, `fn3`): `Promise`\<`D`>

Defined in: [composition/pipeAsync.ts:21](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipeAsync.ts#L21)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

##### Returns

`Promise`\<`D`>

##### Fileoverview

Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.

##### Example

```ts
import { pipeAsync, asyncOk, mapAsync, bindAsync, matchAsync, asyncErr } from '@sandlada/result';
await pipeAsync(
  asyncOk(42),
  mapAsync(x => x * 2),
  bindAsync(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
  matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

*

##### Note

Ready for Product

#### Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`): `Promise`\<`E`>

Defined in: [composition/pipeAsync.ts:22](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipeAsync.ts#L22)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

##### Returns

`Promise`\<`E`>

##### Fileoverview

Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.

##### Example

```ts
import { pipeAsync, asyncOk, mapAsync, bindAsync, matchAsync, asyncErr } from '@sandlada/result';
await pipeAsync(
  asyncOk(42),
  mapAsync(x => x * 2),
  bindAsync(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
  matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

*

##### Note

Ready for Product

#### Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`, `F`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`): `Promise`\<`F`>

Defined in: [composition/pipeAsync.ts:25](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipeAsync.ts#L25)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

###### F

`F`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

###### fn5

(`e`) => `F`

##### Returns

`Promise`\<`F`>

##### Fileoverview

Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.

##### Example

```ts
import { pipeAsync, asyncOk, mapAsync, bindAsync, matchAsync, asyncErr } from '@sandlada/result';
await pipeAsync(
  asyncOk(42),
  mapAsync(x => x * 2),
  bindAsync(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
  matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

*

##### Note

Ready for Product

#### Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`): `Promise`\<`G`>

Defined in: [composition/pipeAsync.ts:28](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipeAsync.ts#L28)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

###### F

`F`

###### G

`G`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

###### fn5

(`e`) => `F`

###### fn6

(`f`) => `G`

##### Returns

`Promise`\<`G`>

##### Fileoverview

Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.

##### Example

```ts
import { pipeAsync, asyncOk, mapAsync, bindAsync, matchAsync, asyncErr } from '@sandlada/result';
await pipeAsync(
  asyncOk(42),
  mapAsync(x => x * 2),
  bindAsync(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
  matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

*

##### Note

Ready for Product

#### Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`, `fn7`): `Promise`\<`H`>

Defined in: [composition/pipeAsync.ts:32](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipeAsync.ts#L32)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

###### F

`F`

###### G

`G`

###### H

`H`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

###### fn5

(`e`) => `F`

###### fn6

(`f`) => `G`

###### fn7

(`g`) => `H`

##### Returns

`Promise`\<`H`>

##### Fileoverview

Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.

##### Example

```ts
import { pipeAsync, asyncOk, mapAsync, bindAsync, matchAsync, asyncErr } from '@sandlada/result';
await pipeAsync(
  asyncOk(42),
  mapAsync(x => x * 2),
  bindAsync(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
  matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

*

##### Note

Ready for Product

#### Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`, `fn7`, `fn8`): `Promise`\<`I`>

Defined in: [composition/pipeAsync.ts:36](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipeAsync.ts#L36)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

###### F

`F`

###### G

`G`

###### H

`H`

###### I

`I`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

###### fn5

(`e`) => `F`

###### fn6

(`f`) => `G`

###### fn7

(`g`) => `H`

###### fn8

(`h`) => `I`

##### Returns

`Promise`\<`I`>

##### Fileoverview

Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.

##### Example

```ts
import { pipeAsync, asyncOk, mapAsync, bindAsync, matchAsync, asyncErr } from '@sandlada/result';
await pipeAsync(
  asyncOk(42),
  mapAsync(x => x * 2),
  bindAsync(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
  matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

*

##### Note

Ready for Product

#### Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`, `fn7`, `fn8`, `fn9`): `Promise`\<`J`>

Defined in: [composition/pipeAsync.ts:40](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipeAsync.ts#L40)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

###### F

`F`

###### G

`G`

###### H

`H`

###### I

`I`

###### J

`J`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

###### fn5

(`e`) => `F`

###### fn6

(`f`) => `G`

###### fn7

(`g`) => `H`

###### fn8

(`h`) => `I`

###### fn9

(`i`) => `J`

##### Returns

`Promise`\<`J`>

##### Fileoverview

Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.

##### Example

```ts
import { pipeAsync, asyncOk, mapAsync, bindAsync, matchAsync, asyncErr } from '@sandlada/result';
await pipeAsync(
  asyncOk(42),
  mapAsync(x => x * 2),
  bindAsync(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
  matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

*

##### Note

Ready for Product

#### Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`, `fn7`, `fn8`, `fn9`, `fn10`): `Promise`\<`K`>

Defined in: [composition/pipeAsync.ts:45](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/pipeAsync.ts#L45)

##### Type Parameters

###### A

`A`

###### B

`B`

###### C

`C`

###### D

`D`

###### E

`E`

###### F

`F`

###### G

`G`

###### H

`H`

###### I

`I`

###### J

`J`

###### K

`K`

##### Parameters

###### value

`A`

###### fn1

(`a`) => `B`

###### fn2

(`b`) => `C`

###### fn3

(`c`) => `D`

###### fn4

(`d`) => `E`

###### fn5

(`e`) => `F`

###### fn6

(`f`) => `G`

###### fn7

(`g`) => `H`

###### fn8

(`h`) => `I`

###### fn9

(`i`) => `J`

###### fn10

(`j`) => `K`

##### Returns

`Promise`\<`K`>

##### Fileoverview

Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.

##### Example

```ts
import { pipeAsync, asyncOk, mapAsync, bindAsync, matchAsync, asyncErr } from '@sandlada/result';
await pipeAsync(
  asyncOk(42),
  mapAsync(x => x * 2),
  bindAsync(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
  matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

*

##### Note

Ready for Product

***

### safeTry()

> **safeTry**\<`T`, `E`>(`result`): `Generator`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`never`, `E`>, `T` | `undefined`, `unknown`>

Defined in: [composition/safeTry.ts:46](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/safeTry.ts#L46)

Returns `T` when the inner result is `Ok`, otherwise yields the failure to
be collected by `fromSafeTry`. The Generator's return type is `T |
undefined`: the success path returns `T`, and the failure path's
unreachable tail explicitly returns `undefined` (matches JS semantics when
a generator exhausts after a yield without a top-level `return`). The
previous version used `return undefined as unknown as T` which silently
cast `undefined` to `T` — a type lie that misled consumers iterating the
generator directly past the yield.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### result

[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>

#### Returns

`Generator`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`never`, `E`>, `T` | `undefined`, `unknown`>

***

### safeTryAsync()

> **safeTryAsync**\<`T`, `E`>(`result`): `AsyncGenerator`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`never`, `E`>, `T` | `undefined`, `unknown`>

Defined in: [composition/safeTryAsync.ts:38](https://github.com/sandlada/result/blob/1844ca0b1956c64c296b04928d2d25a941fde475/src/composition/safeTryAsync.ts#L38)

Returns `T` when the inner result is `Ok`, otherwise yields the failure to
be collected by `fromSafeTryAsync`. The AsyncGenerator's return type is
`T | undefined`: the success path returns `T`, and the failure path's
unreachable tail returns `undefined` (matches JS semantics when a
generator exhausts after a yield without a top-level `return`). The
previous version used `return undefined as never` which silently cast
`undefined` to `T` — a type lie identical to the F-class bug fixed in
`safeTry.ts` (commit 4e24904) that the async counterpart had missed.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### result

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

#### Returns

`AsyncGenerator`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`never`, `E`>, `T` | `undefined`, `unknown`>
