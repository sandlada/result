---
editUrl: false
next: false
prev: false
title: async-option
slug: 0.20260811/api/async-option
---

## Functions

### all()

#### Call Signature

> **all**\<`T`>(`aos`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<\{ \[K in string | number | symbol]: T\[K] extends AsyncOption\<V> ? V : never }>

Defined in: [async-option/all.ts:37](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/all.ts#L37)

Combines a tuple/array of `AsyncOption`s, preserving heterogeneous types.
Returns `AsyncOption<None>` if any element is `None`; otherwise
`AsyncOption<Some<[v0, v1, ...]>>`. Like `Promise.all` but with `None`
short-circuiting.

Two overloads:

* Tuple overload: preserves per-position heterogeneous types — yields
  `AsyncOption<Some<[number, string]>>`.
* Array overload: runtime-sized homogeneous arrays — yields
  `AsyncOption<Some<T[]>>`.

##### Type Parameters

###### T

`T` *extends* readonly \[[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`unknown`>, [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`unknown`>]

##### Parameters

###### aos

`T`

##### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<\{ \[K in string | number | symbol]: T\[K] extends AsyncOption\<V> ? V : never }>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';
import { all } from '@sandlada/result/async-option';

// Heterogeneous tuple — per-position types preserved.
const a = await all([ofSome(1), ofSome('hi')]).run(); // Some([1, 'hi'])

// Homogeneous array — runtime-sized.
const arr: AsyncOption<number>[] = [ofSome(1), ofSome(2)];
const b = await all(arr).run(); // Some([1, 2])

const c = await all([ofSome(1), ofNone<number>()]).run(); // None
```

##### Note

Ready for Product

#### Call Signature

> **all**\<`T`>(`aos`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`\[]>

Defined in: [async-option/all.ts:44](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/all.ts#L44)

Combines a tuple/array of `AsyncOption`s, preserving heterogeneous types.
Returns `AsyncOption<None>` if any element is `None`; otherwise
`AsyncOption<Some<[v0, v1, ...]>>`. Like `Promise.all` but with `None`
short-circuiting.

Two overloads:

* Tuple overload: preserves per-position heterogeneous types — yields
  `AsyncOption<Some<[number, string]>>`.
* Array overload: runtime-sized homogeneous arrays — yields
  `AsyncOption<Some<T[]>>`.

##### Type Parameters

###### T

`T`

##### Parameters

###### aos

readonly [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>\[]

##### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`\[]>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';
import { all } from '@sandlada/result/async-option';

// Heterogeneous tuple — per-position types preserved.
const a = await all([ofSome(1), ofSome('hi')]).run(); // Some([1, 'hi'])

// Homogeneous array — runtime-sized.
const arr: AsyncOption<number>[] = [ofSome(1), ofSome(2)];
const b = await all(arr).run(); // Some([1, 2])

const c = await all([ofSome(1), ofNone<number>()]).run(); // None
```

##### Note

Ready for Product

***

### bind()

#### Call Signature

> **bind**\<`T`, `U`>(`fn`): (`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`>

Defined in: [async-option/bind.ts:22](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/bind.ts#L22)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### fn

(`value`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`> | `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

##### Returns

(`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`>

##### Fileoverview

Chains an AsyncOption-returning function on success (monadic bind / flatMap).
Supports interoperability by also accepting a function that returns `Promise<IOption<U>>`.
Lazy — returns a new AsyncOption without executing the inner computation.

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, bind } from '@sandlada/result/async-option';

const ao = bind((x: number) => fromOption(ofSome(x * 2)), fromOption(ofSome(21)));
const result = await ao.run(); // Some(42)
```

*

##### Note

Ready for Product

#### Call Signature

> **bind**\<`T`, `U`>(`fn`, `ao`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`>

Defined in: [async-option/bind.ts:25](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/bind.ts#L25)

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### fn

(`value`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`> | `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`>

##### Fileoverview

Chains an AsyncOption-returning function on success (monadic bind / flatMap).
Supports interoperability by also accepting a function that returns `Promise<IOption<U>>`.
Lazy — returns a new AsyncOption without executing the inner computation.

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, bind } from '@sandlada/result/async-option';

const ao = bind((x: number) => fromOption(ofSome(x * 2)), fromOption(ofSome(21)));
const result = await ao.run(); // Some(42)
```

*

##### Note

Ready for Product

***

### contains()

#### Call Signature

> **contains**\<`T`>(`value`): (`ao`) => `Promise`\<`boolean`>

Defined in: [async-option/contains.ts:8](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/contains.ts#L8)

Returns a Promise\<boolean> indicating if the AsyncOption is Some and contains the given value.
\*

##### Type Parameters

###### T

`T`

##### Parameters

###### value

`T`

##### Returns

(`ao`) => `Promise`\<`boolean`>

##### Note

Ready for Product

#### Call Signature

> **contains**\<`T`>(`value`, `ao`): `Promise`\<`boolean`>

Defined in: [async-option/contains.ts:11](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/contains.ts#L11)

Returns a Promise\<boolean> indicating if the AsyncOption is Some and contains the given value.
\*

##### Type Parameters

###### T

`T`

##### Parameters

###### value

`T`

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

`Promise`\<`boolean`>

##### Note

Ready for Product

***

### exists()

#### Call Signature

> **exists**\<`T`>(`predicate`): (`ao`) => `Promise`\<`boolean`>

Defined in: [async-option/exists.ts:8](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/exists.ts#L8)

Returns a Promise\<boolean> indicating if the AsyncOption is Some and the predicate holds.
\*

##### Type Parameters

###### T

`T`

##### Parameters

###### predicate

(`value`) => `boolean` | `Promise`\<`boolean`>

##### Returns

(`ao`) => `Promise`\<`boolean`>

##### Note

Ready for Product

#### Call Signature

> **exists**\<`T`>(`predicate`, `ao`): `Promise`\<`boolean`>

Defined in: [async-option/exists.ts:11](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/exists.ts#L11)

Returns a Promise\<boolean> indicating if the AsyncOption is Some and the predicate holds.
\*

##### Type Parameters

###### T

`T`

##### Parameters

###### predicate

(`value`) => `boolean` | `Promise`\<`boolean`>

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

`Promise`\<`boolean`>

##### Note

Ready for Product

***

### filter()

#### Call Signature

> **filter**\<`T`>(`predicate`): (`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

Defined in: [async-option/filter.ts:24](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/filter.ts#L24)

##### Type Parameters

###### T

`T`

##### Parameters

###### predicate

(`value`) => `boolean` | `Promise`\<`boolean`>

##### Returns

(`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Fileoverview

Filters the value of an AsyncOption with a predicate.
Keeps the Some if the predicate holds; converts to None otherwise. None passes through.
Lazy — returns a new AsyncOption without executing the inner computation.

**Throw policy**: If the predicate throws synchronously or returns a rejected
Promise, the error is caught and the result converts to `None`
(canonical catch+convert policy — see AGENTS.md).

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, filter } from '@sandlada/result/async-option';
const ao = filter((x: number) => x > 10, fromOption(ofSome(21)));
const result = await ao.run(); // Some(21)
```

*

##### Note

Ready for Product

#### Call Signature

> **filter**\<`T`>(`predicate`, `ao`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

Defined in: [async-option/filter.ts:27](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/filter.ts#L27)

##### Type Parameters

###### T

`T`

##### Parameters

###### predicate

(`value`) => `boolean` | `Promise`\<`boolean`>

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Fileoverview

Filters the value of an AsyncOption with a predicate.
Keeps the Some if the predicate holds; converts to None otherwise. None passes through.
Lazy — returns a new AsyncOption without executing the inner computation.

**Throw policy**: If the predicate throws synchronously or returns a rejected
Promise, the error is caught and the result converts to `None`
(canonical catch+convert policy — see AGENTS.md).

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, filter } from '@sandlada/result/async-option';
const ao = filter((x: number) => x > 10, fromOption(ofSome(21)));
const result = await ao.run(); // Some(21)
```

*

##### Note

Ready for Product

***

### flatten()

> **flatten**\<`T`>(`ao`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

Defined in: [async-option/flatten.ts:12](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/flatten.ts#L12)

Flattens a nested AsyncOption.

**Single-step only**: unwraps exactly one layer. Call `flatten` repeatedly
to flatten deeper nests.

#### Type Parameters

##### T

`T`

#### Parameters

##### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>>

#### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

#### Note

Ready for Product

***

### from()

> **from**\<`T`>(`thunk`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

Defined in: [async-option/from.ts:20](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/from.ts#L20)

Creates an AsyncOption from a thunk that returns a Promise\<IOption>.
The thunk is lazy — it won't execute until `.run()` is called.

#### Type Parameters

##### T

`T`

#### Parameters

##### thunk

() => `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`T`>>

#### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

#### Example

```ts
import { from } from '@sandlada/result/async-option';
import { ofSome } from '@sandlada/result/option';

const ao = from(() => Promise.resolve(ofSome(42)));
const result = await ao.run(); // Some(42)
```

*

#### Note

Ready for Product

***

### fromOption()

> **fromOption**\<`T`>(`option`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

Defined in: [async-option/fromOption.ts:19](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/fromOption.ts#L19)

Wraps a sync `IOption` into an AsyncOption (lifts a sync Option into the async world).

#### Type Parameters

##### T

`T`

#### Parameters

##### option

[`IOption`](/0.20260811/api/types/#ioption)\<`T`>

#### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

#### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption } from '@sandlada/result/async-option';

const ao = fromOption(ofSome(42));
const result = await ao.run(); // Some(42)
```

*

#### Note

Ready for Product

***

### fromPromise()

> **fromPromise**\<`T`>(`thunk`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

Defined in: [async-option/fromPromise.ts:23](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/fromPromise.ts#L23)

Wraps a `Promise<T>` into an AsyncOption, catching rejections.
If the promise resolves, it returns `Some(value)`.
If it rejects, it returns `None`.

The inner Promise is not yet created at construction time; the factory thunk is invoked
lazily when `.run()` is called.

#### Type Parameters

##### T

`T`

#### Parameters

##### thunk

() => `Promise`\<`T`>

#### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

#### Example

```ts
import { fromPromise } from '@sandlada/result/async-option';
const ao = fromPromise(() => fetch('/api/data').then(r => r.json()));
const result = await ao.run();
```

*

#### Note

Ready for Product

***

### isNone()

> **isNone**\<`T`>(`ao`): `Promise`\<`boolean`>

Defined in: [async-option/isNone.ts:17](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/isNone.ts#L17)

Returns `true` if the `AsyncOption` resolves to `None`. Mirrors the
`IOption.isNone` discriminator as a standalone function.

#### Type Parameters

##### T

`T`

#### Parameters

##### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

#### Returns

`Promise`\<`boolean`>

#### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';

await isNone(ofSome(42)); // false
await isNone(ofNone<number>()); // true
```

#### Note

Ready for Product

***

### isSome()

> **isSome**\<`T`>(`ao`): `Promise`\<`boolean`>

Defined in: [async-option/isSome.ts:17](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/isSome.ts#L17)

Returns `true` if the `AsyncOption` resolves to `Some`. Mirrors the
`IOption.isSome` discriminator as a standalone function.

#### Type Parameters

##### T

`T`

#### Parameters

##### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

#### Returns

`Promise`\<`boolean`>

#### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';

await isSome(ofSome(42)); // true
await isSome(ofNone<number>()); // false
```

#### Note

Ready for Product

***

### map()

#### Call Signature

> **map**\<`T`, `U`>(`fn`): (`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`>

Defined in: [async-option/map.ts:20](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/map.ts#L20)

Maps the value of an AsyncOption using a synchronous function.
Lazy — returns a new AsyncOption without executing the inner computation.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### fn

(`value`) => `U`

##### Returns

(`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`>

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, map } from '@sandlada/result/async-option';

const ao = map((x: number) => x * 2, fromOption(ofSome(21)));
const result = await ao.run(); // Some(42)
```

*

##### Note

Ready for Product

#### Call Signature

> **map**\<`T`, `U`>(`fn`, `ao`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`>

Defined in: [async-option/map.ts:23](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/map.ts#L23)

Maps the value of an AsyncOption using a synchronous function.
Lazy — returns a new AsyncOption without executing the inner computation.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### fn

(`value`) => `U`

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`>

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, map } from '@sandlada/result/async-option';

const ao = map((x: number) => x * 2, fromOption(ofSome(21)));
const result = await ao.run(); // Some(42)
```

*

##### Note

Ready for Product

***

### mapAsync()

#### Call Signature

> **mapAsync**\<`T`, `U`>(`fn`): (`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`>

Defined in: [async-option/mapAsync.ts:20](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/mapAsync.ts#L20)

Maps the value of an AsyncOption using an async function.
Lazy — returns a new AsyncOption without executing the inner computation.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### fn

(`value`) => `Promise`\<`U`>

##### Returns

(`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`>

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, mapAsync } from '@sandlada/result/async-option';

const ao = mapAsync(async (x: number) => x * 2, fromOption(ofSome(21)));
const result = await ao.run(); // Some(42)
```

*

##### Note

Ready for Product

#### Call Signature

> **mapAsync**\<`T`, `U`>(`fn`, `ao`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`>

Defined in: [async-option/mapAsync.ts:23](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/mapAsync.ts#L23)

Maps the value of an AsyncOption using an async function.
Lazy — returns a new AsyncOption without executing the inner computation.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### fn

(`value`) => `Promise`\<`U`>

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`>

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, mapAsync } from '@sandlada/result/async-option';

const ao = mapAsync(async (x: number) => x * 2, fromOption(ofSome(21)));
const result = await ao.run(); // Some(42)
```

*

##### Note

Ready for Product

***

### mapOr()

#### Call Signature

> **mapOr**\<`T`, `U`>(`defaultValue`, `fn`): (`ao`) => `Promise`\<`U`>

Defined in: [async-option/mapOr.ts:18](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/mapOr.ts#L18)

Maps the value of an `AsyncOption`, returning a default on `None`.
The mapper may be sync or async. Throws from the mapper are caught and
converted to the default (canonical AsyncOption catch+convert policy).

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### defaultValue

`U`

###### fn

(`value`) => `U` | `Promise`\<`U`>

##### Returns

(`ao`) => `Promise`\<`U`>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';

const v1 = await mapOr(-1, (x: number) => x * 2, ofSome(21)); // 42
const v2 = await mapOr(-1, (x: number) => x * 2, ofNone<number>()); // -1
```

##### Note

Ready for Product

#### Call Signature

> **mapOr**\<`T`, `U`>(`defaultValue`, `fn`, `ao`): `Promise`\<`U`>

Defined in: [async-option/mapOr.ts:22](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/mapOr.ts#L22)

Maps the value of an `AsyncOption`, returning a default on `None`.
The mapper may be sync or async. Throws from the mapper are caught and
converted to the default (canonical AsyncOption catch+convert policy).

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### defaultValue

`U`

###### fn

(`value`) => `U` | `Promise`\<`U`>

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

`Promise`\<`U`>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';

const v1 = await mapOr(-1, (x: number) => x * 2, ofSome(21)); // 42
const v2 = await mapOr(-1, (x: number) => x * 2, ofNone<number>()); // -1
```

##### Note

Ready for Product

***

### mapOrElse()

#### Call Signature

> **mapOrElse**\<`T`, `U`>(`onNone`, `fn`): (`ao`) => `Promise`\<`U`>

Defined in: [async-option/mapOrElse.ts:17](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/mapOrElse.ts#L17)

Maps the value of an `AsyncOption`, or computes a default from a thunk on `None`.
Both callbacks may be sync or async.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### onNone

() => `U` | `Promise`\<`U`>

###### fn

(`value`) => `U` | `Promise`\<`U`>

##### Returns

(`ao`) => `Promise`\<`U`>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';

const v1 = await mapOrElse(() => -1, (x: number) => x * 2, ofSome(21)); // 42
const v2 = await mapOrElse(() => -1, (x: number) => x * 2, ofNone<number>()); // -1
```

##### Note

Ready for Product

#### Call Signature

> **mapOrElse**\<`T`, `U`>(`onNone`, `fn`, `ao`): `Promise`\<`U`>

Defined in: [async-option/mapOrElse.ts:21](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/mapOrElse.ts#L21)

Maps the value of an `AsyncOption`, or computes a default from a thunk on `None`.
Both callbacks may be sync or async.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### onNone

() => `U` | `Promise`\<`U`>

###### fn

(`value`) => `U` | `Promise`\<`U`>

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

`Promise`\<`U`>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';

const v1 = await mapOrElse(() => -1, (x: number) => x * 2, ofSome(21)); // 42
const v2 = await mapOrElse(() => -1, (x: number) => x * 2, ofNone<number>()); // -1
```

##### Note

Ready for Product

***

### match()

#### Call Signature

> **match**\<`T`, `U`>(`handlers`): (`ao`) => `Promise`\<`U`>

Defined in: [async-option/match.ts:19](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/match.ts#L19)

Terminal — pattern-matches on both cases of an AsyncOption.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### handlers

###### none

() => `U` | `Promise`\<`U`>

###### some

(`value`) => `U` | `Promise`\<`U`>

##### Returns

(`ao`) => `Promise`\<`U`>

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, match } from '@sandlada/result/async-option';

const value = await match(
  { some: (v: number) => `success: ${v}`, none: () => 'failure' },
  fromOption(ofSome(42))
); // "success: 42"
```

*

##### Note

Ready for Product

#### Call Signature

> **match**\<`T`, `U`>(`handlers`, `ao`): `Promise`\<`U`>

Defined in: [async-option/match.ts:22](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/match.ts#L22)

Terminal — pattern-matches on both cases of an AsyncOption.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### handlers

###### none

() => `U` | `Promise`\<`U`>

###### some

(`value`) => `U` | `Promise`\<`U`>

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

`Promise`\<`U`>

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, match } from '@sandlada/result/async-option';

const value = await match(
  { some: (v: number) => `success: ${v}`, none: () => 'failure' },
  fromOption(ofSome(42))
); // "success: 42"
```

*

##### Note

Ready for Product

***

### ofNone()

> **ofNone**\<`T`>(): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

Defined in: [async-option/ofNone.ts:23](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/ofNone.ts#L23)

Creates an `AsyncOption` that always resolves to `None`.
Equivalent to `fromOption(ofNone())` but skips the sync intermediate.

Default `T = unknown` mirrors option/ofNone so contextual typing flows
the same way (`const x: AsyncOption<number> = ofNone()` widens without
needing an explicit generic argument).

#### Type Parameters

##### T

`T` = `unknown`

#### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

#### Example

```ts
import { ofNone } from '@sandlada/result/async-option';

const ao = ofNone<number>();
const opt = await ao.run(); // None
```

#### Note

Ready for Product

***

### ofSome()

> **ofSome**\<`T`>(`value`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

Defined in: [async-option/ofSome.ts:19](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/ofSome.ts#L19)

Lifts a raw value into an `AsyncOption<T>` that resolves to `Some(value)`.
Equivalent to `fromOption(ofSome(value))` but skips the sync intermediate.

#### Type Parameters

##### T

`T`

#### Parameters

##### value

`T`

#### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

#### Example

```ts
import { ofSome } from '@sandlada/result/async-option';

const ao = ofSome(42);
const opt = await ao.run(); // Some(42)
```

#### Note

Ready for Product

***

### okOr()

#### Call Signature

> **okOr**\<`T`, `E`>(`error`): (`ao`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-option/okOr.ts:21](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/okOr.ts#L21)

Converts an `AsyncOption<T>` into an `AsyncResult<T, E>`, supplying an error
value for the `None` case.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### error

`E`

##### Returns

(`ao`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';
import { okOr } from '@sandlada/result/async-option';

const r1 = await okOr('missing', ofSome(42)).run(); // Ok(42)
const r2 = await okOr('missing', ofNone<number>()).run(); // Err('missing')
```

##### Note

Ready for Product

#### Call Signature

> **okOr**\<`T`, `E`>(`error`, `ao`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-option/okOr.ts:24](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/okOr.ts#L24)

Converts an `AsyncOption<T>` into an `AsyncResult<T, E>`, supplying an error
value for the `None` case.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### error

`E`

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';
import { okOr } from '@sandlada/result/async-option';

const r1 = await okOr('missing', ofSome(42)).run(); // Ok(42)
const r2 = await okOr('missing', ofNone<number>()).run(); // Err('missing')
```

##### Note

Ready for Product

***

### okOrElse()

#### Call Signature

> **okOrElse**\<`T`, `E`>(`onNone`): (`ao`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-option/okOrElse.ts:21](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/okOrElse.ts#L21)

Converts an `AsyncOption<T>` into an `AsyncResult<T, E>`, computing the error
from a thunk on `None` (lazy — error is only built when needed).

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### onNone

() => `E` | `Promise`\<`E`>

##### Returns

(`ao`) => [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';
import { okOrElse } from '@sandlada/result/async-option';

const r1 = await okOrElse(() => 'missing', ofSome(42)).run(); // Ok(42)
const r2 = await okOrElse(() => 'missing', ofNone<number>()).run(); // Err('missing')
```

##### Note

Ready for Product

#### Call Signature

> **okOrElse**\<`T`, `E`>(`onNone`, `ao`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [async-option/okOrElse.ts:24](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/okOrElse.ts#L24)

Converts an `AsyncOption<T>` into an `AsyncResult<T, E>`, computing the error
from a thunk on `None` (lazy — error is only built when needed).

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### onNone

() => `E` | `Promise`\<`E`>

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';
import { okOrElse } from '@sandlada/result/async-option';

const r1 = await okOrElse(() => 'missing', ofSome(42)).run(); // Ok(42)
const r2 = await okOrElse(() => 'missing', ofNone<number>()).run(); // Err('missing')
```

##### Note

Ready for Product

***

### orElse()

#### Call Signature

> **orElse**\<`U`>(`fn`): \<`T`>(`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U` | `T`>

Defined in: [async-option/orElse.ts:38](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/orElse.ts#L38)

Curried form. The inner `<T>` is **deferred** so the AsyncOption's value
type is re-inferred at every application site.

##### Type Parameters

###### U

`U`

##### Parameters

###### fn

() => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`> | `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

##### Returns

\<`T`>(`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U` | `T`>

#### Call Signature

> **orElse**\<`T`, `U`>(`fn`, `ao`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T` | `U`>

Defined in: [async-option/orElse.ts:45](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/orElse.ts#L45)

Direct form. `T` is inferred from the supplied AsyncOption; the result widens to `T | U`.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### fn

() => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`U`> | `Promise`\<[`IOption`](/0.20260811/api/types/#ioption)\<`U`>>

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T` | `U`>

***

### tap()

#### Call Signature

> **tap**\<`T`>(`fn`): (`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

Defined in: [async-option/tap.ts:23](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/tap.ts#L23)

##### Type Parameters

###### T

`T`

##### Parameters

###### fn

(`value`) => `void`

##### Returns

(`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Fileoverview

Side-effect on the success track of an AsyncOption. Calls `fn`
with the value on Some and passes the original Option through unchanged.
Lazy — returns a new AsyncOption without executing the inner computation.

**Throw policy**: If the side-effect callback throws, the result converts
to `None` (canonical tap/tee policy — see AGENTS.md).

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, tap } from '@sandlada/result/async-option';

const ao = tap((v: number) => console.log(v), fromOption(ofSome(42)));
await ao.run(); // Logs 42, returns Some(42)
```

*

##### Note

Ready for Product

#### Call Signature

> **tap**\<`T`>(`fn`, `ao`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

Defined in: [async-option/tap.ts:26](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/tap.ts#L26)

##### Type Parameters

###### T

`T`

##### Parameters

###### fn

(`value`) => `void`

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Fileoverview

Side-effect on the success track of an AsyncOption. Calls `fn`
with the value on Some and passes the original Option through unchanged.
Lazy — returns a new AsyncOption without executing the inner computation.

**Throw policy**: If the side-effect callback throws, the result converts
to `None` (canonical tap/tee policy — see AGENTS.md).

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, tap } from '@sandlada/result/async-option';

const ao = tap((v: number) => console.log(v), fromOption(ofSome(42)));
await ao.run(); // Logs 42, returns Some(42)
```

*

##### Note

Ready for Product

***

### tapAsync()

#### Call Signature

> **tapAsync**\<`T`>(`fn`): (`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

Defined in: [async-option/tapAsync.ts:23](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/tapAsync.ts#L23)

##### Type Parameters

###### T

`T`

##### Parameters

###### fn

(`value`) => `void` | `Promise`\<`void`>

##### Returns

(`ao`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Fileoverview

Side-effect on the success track of an AsyncOption using an async function.
Calls `fn` with the value on Some and passes the original Option through unchanged.
Lazy — returns a new AsyncOption without executing the inner computation.

**Throw policy**: If the side-effect callback throws (or rejects), the result
converts to `None` (canonical tap/tee policy — see AGENTS.md).

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, tapAsync } from '@sandlada/result/async-option';

const ao = tapAsync(async (v: number) => { await save(v); }, fromOption(ofSome(42)));
await ao.run(); // returns Some(42) after saving
```

*

##### Note

Ready for Product

#### Call Signature

> **tapAsync**\<`T`>(`fn`, `ao`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

Defined in: [async-option/tapAsync.ts:26](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/tapAsync.ts#L26)

##### Type Parameters

###### T

`T`

##### Parameters

###### fn

(`value`) => `void` | `Promise`\<`void`>

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Fileoverview

Side-effect on the success track of an AsyncOption using an async function.
Calls `fn` with the value on Some and passes the original Option through unchanged.
Lazy — returns a new AsyncOption without executing the inner computation.

**Throw policy**: If the side-effect callback throws (or rejects), the result
converts to `None` (canonical tap/tee policy — see AGENTS.md).

##### Example

```ts
import { ofSome } from '@sandlada/result/option';
import { fromOption, tapAsync } from '@sandlada/result/async-option';

const ao = tapAsync(async (v: number) => { await save(v); }, fromOption(ofSome(42)));
await ao.run(); // returns Some(42) after saving
```

*

##### Note

Ready for Product

***

### transpose()

> **transpose**\<`T`, `E`>(`ao`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>, `E`>

Defined in: [async-option/transpose.ts:29](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/transpose.ts#L29)

Transposes an `AsyncOption<AsyncResult<T, E>>` into an
`AsyncResult<AsyncOption<T>, E>`.

* `Some(Ok(v))`  → `Ok(Some(v))`
* `Some(Err(e))` → `Err(e)`
* `None`         → `Ok(None)`

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>>

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>, `E`>

#### Example

```ts
import { ofSome } from '@sandlada/result/async-option';
import { fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result';
import { transpose } from '@sandlada/result/async-option';

const r = await transpose(ofSome(fromResult(ok(42)))).run();
// r.isSuccess === true; r.value is an AsyncOption resolving to Some(42)
```

#### Note

Ready for Product

***

### unwrap()

> **unwrap**\<`T`>(`ao`): `Promise`\<`T`>

Defined in: [async-option/unwrap.ts:17](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/unwrap.ts#L17)

Extracts the value from an `AsyncOption`, or throws if `None`.
Use sparingly — prefer `unwrapOr`, `unwrapOrElse`, or `match` in most code.

#### Type Parameters

##### T

`T`

#### Parameters

##### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

#### Returns

`Promise`\<`T`>

#### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';

const v = await unwrap(ofSome(42)); // 42
await unwrap(ofNone()); // throws Error
```

#### Note

Ready for Product

***

### unwrapOr()

#### Call Signature

> **unwrapOr**\<`T`>(`defaultValue`): (`ao`) => `Promise`\<`T`>

Defined in: [async-option/unwrapOr.ts:17](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/unwrapOr.ts#L17)

Extracts the value from an AsyncOption, or returns a default value.

##### Type Parameters

###### T

`T`

##### Parameters

###### defaultValue

`T` | `Promise`\<`T`>

##### Returns

(`ao`) => `Promise`\<`T`>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/option';
import { fromOption, unwrapOr } from '@sandlada/result/async-option';

const v1 = await unwrapOr(0, fromOption(ofSome(42))); // 42
const v2 = await unwrapOr(0, fromOption(ofNone())); // 0
```

*

##### Note

Ready for Product

#### Call Signature

> **unwrapOr**\<`T`>(`defaultValue`, `ao`): `Promise`\<`T`>

Defined in: [async-option/unwrapOr.ts:20](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/unwrapOr.ts#L20)

Extracts the value from an AsyncOption, or returns a default value.

##### Type Parameters

###### T

`T`

##### Parameters

###### defaultValue

`T` | `Promise`\<`T`>

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

`Promise`\<`T`>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/option';
import { fromOption, unwrapOr } from '@sandlada/result/async-option';

const v1 = await unwrapOr(0, fromOption(ofSome(42))); // 42
const v2 = await unwrapOr(0, fromOption(ofNone())); // 0
```

*

##### Note

Ready for Product

***

### unwrapOrElse()

#### Call Signature

> **unwrapOrElse**\<`T`>(`onNone`): (`ao`) => `Promise`\<`T`>

Defined in: [async-option/unwrapOrElse.ts:17](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/unwrapOrElse.ts#L17)

Extracts the value from an `AsyncOption`, or computes a default from a thunk
on `None`. Lazy — the default is only computed when needed.

##### Type Parameters

###### T

`T`

##### Parameters

###### onNone

() => `T` | `Promise`\<`T`>

##### Returns

(`ao`) => `Promise`\<`T`>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';

const v1 = await unwrapOrElse(() => 0, ofSome(42)); // 42
const v2 = await unwrapOrElse(() => 0, ofNone<number>()); // 0
```

##### Note

Ready for Product

#### Call Signature

> **unwrapOrElse**\<`T`>(`onNone`, `ao`): `Promise`\<`T`>

Defined in: [async-option/unwrapOrElse.ts:20](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/unwrapOrElse.ts#L20)

Extracts the value from an `AsyncOption`, or computes a default from a thunk
on `None`. Lazy — the default is only computed when needed.

##### Type Parameters

###### T

`T`

##### Parameters

###### onNone

() => `T` | `Promise`\<`T`>

###### ao

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`T`>

##### Returns

`Promise`\<`T`>

##### Example

```ts
import { ofSome, ofNone } from '@sandlada/result/async-option';

const v1 = await unwrapOrElse(() => 0, ofSome(42)); // 42
const v2 = await unwrapOrElse(() => 0, ofNone<number>()); // 0
```

##### Note

Ready for Product

***

### zipWith()

#### Call Signature

> **zipWith**\<`T`, `R`>(`fn`): (...`aos`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`R`>

Defined in: [async-option/zipWith.ts:44](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/zipWith.ts#L44)

##### Type Parameters

###### T

`T` *extends* readonly \[`unknown`, `unknown`, `unknown`]

###### R

`R`

##### Parameters

###### fn

(...`args`) => `R` | `Promise`\<`R`>

##### Returns

(...`aos`) => [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`R`>

#### Call Signature

> **zipWith**\<`T`, `R`>(`fn`, ...`aos`): [`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`R`>

Defined in: [async-option/zipWith.ts:47](https://github.com/sandlada/result/blob/b5a22d73ceb79ee07d75a3ecb3dff20b4154cf27/src/async-option/zipWith.ts#L47)

##### Type Parameters

###### T

`T` *extends* readonly \[`unknown`, `unknown`, `unknown`]

###### R

`R`

##### Parameters

###### fn

(...`args`) => `R` | `Promise`\<`R`>

###### aos

...\{ \[K in string | number | symbol]: AsyncOption\<T\[K]> }

##### Returns

[`AsyncOption`](/0.20260811/api/types/#asyncoption)\<`R`>
