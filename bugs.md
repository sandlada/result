# Type Safety / Generic Support Audit — `src/`

Audit criteria:
1. APIs must allow developers to define their own types (custom shapes are not locked by the library).
2. APIs must not lock types except for the industry-standard `Result` / `Option` ROP discriminants
   (`isSuccess`/`isFailure`/`value`/`error`, `isSome`/`isNone`/`value`, `run`).
3. APIs must work correctly in pipeline / stream composition with type inference
   (combine / `all` / `traverseArray` / curried pipelines must preserve heterogeneous inference).

Baseline (correct): `err<E>(error: E): IResultOfT<never, E>`, `err` lets the developer pick
any error shape — no library-defined `Error` subclass is forced.

---

## High Severity

### 1. `src/option/unwrapOr.ts` — locks default value type to option's value type
- **API**: `src/option/unwrapOr.ts` / exported `unwrapOr`
- **Problem case**: A single `T` generic forces the default to match the option's value type exactly.
  The canonical "fall back to a wider / sentinel value" pattern is blocked:
  ```ts
  const userOpt: IOption<User> = getUser();
  pipe(userOpt, unwrapOr(null));          // ERROR — T = null, expects IOption<null>
  pipe(userOpt, unwrapOr(defaultUser));   // ERROR — T = DefaultUser, not User
  ```
- **Expected**: `<T, D = T>(defaultValue: D): (opt: IOption<T>) => T | D` so the dev can pick a
  default value of a different (often wider) type.
- **Severity**: high (real type lock that breaks the documented developer-typed pattern)

### 2. `src/option/orElse.ts` — locks fallback option type to input option type
- **API**: `src/option/orElse.ts` / exported `orElse`
- **Problem case**: Single `T` requires the fallback `IOption` to have the same value type as the
  input, blocking the canonical "recover with broader / different value" pattern:
  ```ts
  pipe(ofNone<number>(), orElse<number>(() => ofSome('fallback'))); // type mismatch
  pipe(ofSome<number>(1), orElse<number>(() => ofSome('fallback'))); // type mismatch
  ```
- **Expected**: `<T, U>(fn: () => IOption<U>): (opt: IOption<T>) => IOption<T | U>`.
- **Severity**: high (same lock as `unwrapOr`)

### 3. `src/operators/catchErr.ts` — locks recovered type to input value type
- **API**: `src/operators/catchErr.ts` / exported `catchErr`
- **Problem case**:
  ```ts
  export function catchErr<A, E>(
      onErr: (e: E) => A,
  ): (r: IResultOfT<A, E>) => IResultOfT<A, never>;
  ```
  The handler must return the SAME `A` the input carries — preventing the common
  "catch error → produce a different shape" recovery:
  ```ts
  catchErr<Config, string>(e => ({ kind: 'Default', reason: e }));
  // error: object literal's `reason` and `kind` are missing on type `Config`
  ```
- **Expected**: `<A, B, E>(onErr: (e: E) => B): (r: IResultOfT<A, E>) => IResultOfT<A | B, never>`.
- **Severity**: high

### 4. `src/reliability/retry.ts` — `defaultAbortedSentinel` lies about runtime shape
- **API**: `src/reliability/retry.ts` / exported `retry`
- **Problem case**: When the loop never invokes `fn` (pre-aborted signal / negative `times`) and
  no `onAborted` factory is supplied, the library fabricates:
  ```ts
  const defaultAbortedSentinel = (reason, times) =>
      ({ kind: 'Aborted' as const, reason, times });
  // ... cast through `E`:
  const error: E = options.onAborted?.(reason, times) ??
      (defaultAbortedSentinel(reason, times) as unknown as E);
  ```
  If the developer declares `E = MyDomainError` (e.g. `{ kind: 'ValidationError' | 'NotFound' }`)
  the cast is a type lie — the returned `Err` is typed `IResultOfT<T, MyDomainError>` but the
  runtime `error` is `{ kind: 'Aborted', reason, times }` (an unknown shape to the developer).
  Discriminated-union narrowing at the call site will misfire.
- **Expected**: Either (a) widen the return type to `IResultOfT<T, E | AbortedSentinel>` so the
  developer can discriminate the abort case at the type level, or (b) require `onAborted` when
  `E` does not structurally accommodate `AbortSentinel`.
- **Severity**: high (type-lying on the failure path is the most dangerous failure mode)

### 5. `src/reliability/race.ts` — empty case fabricates `Error` and casts through `E`
- **API**: `src/reliability/race.ts` / exported `race`
- **Problem case**:
  ```ts
  if (runs.length === 0) {
      return err(new Error('race: no inputs') as unknown as E) as IResultOfT<T, E>;
  }
  ```
  The library creates a built-in `Error` object and claims it is the developer's custom error
  type `E`. If the developer has declared `E = AppError | NetworkError | …` there is no
  built-in `Error` in that union — the cast is a lie, and `r.error instanceof Error` will pass
  at runtime but the discriminated-union narrowing at the call site will misfire.
- **Expected**: Provide an `onEmpty?: () => E` factory (mirroring `timeout`'s `onTimeout`),
  default to widening the error type to `E | { kind: 'EmptyInputs' }`.
- **Severity**: high

---

## Medium Severity

### 6. `src/option/all.ts` — tuple-only input, no array overload
- **API**: `src/option/all.ts` / exported `all`
- **Problem case**: The constraint
  ```ts
  T extends readonly [IOption<unknown>, ...IOption<unknown>[]]
  ```
  rejects runtime-sized arrays:
  ```ts
  const opts: IOption<number>[] = [ofSome(1), ofSome(2), ofSome(3)];
  const r = all(opts); // ERROR — not a tuple
  ```
  Compare with `combine/all.ts`, which deliberately relaxed this for the Result side. The
  Option side was intentionally left strict, but stream / array pipelines routinely pass
  array values.
- **Expected**: Add a second overload `function all<T>(opts: readonly IOption<T>[]): IOption<T[]>`
  alongside the heterogeneous-tuple overload.
- **Severity**: medium

### 7. `src/option/okOrElse.ts` — unsafe `as unknown as E` cast on caught throws
- **API**: `src/option/okOrElse.ts` / exported `okOrElse`
- **Problem case**: The catch-block hard-casts an arbitrary thrown value to the user-declared
  error type `E`:
  ```ts
  } catch (e: unknown) {
      return err(e as unknown as E) as unknown as IResultOfT<T, E>;
  }
  ```
  If the user declares `E = MyAppError`, but the function throws a plain `Error` / DOMException /
  string, the returned `Err` claims to be `MyAppError` at the type level while carrying an
  arbitrary runtime value.
- **Expected**: Widen the return type to `IResultOfT<T, E | Error>` (or honour an explicit
  `errorFn` factory like `fromThrowable`).
- **Severity**: medium

### 8. `src/async-result/bind.ts`, `src/async-result/map.ts`, `src/async-result/mapErr.ts`, `src/async-result/mapAsync.ts`, `src/async-result/orElse.ts`, `src/async-result/bimap.ts`, `src/async-result/tap.ts`, `src/async-result/tapErr.ts` — `try { … } catch (e: unknown) { err(e as unknown as E | F | …) }` pattern silently widens `unknown` to the user's error type
- **APIs**:
  - `src/async-result/bind.ts:45`
  - `src/async-result/map.ts:39`
  - `src/async-result/mapAsync.ts` (no catch — sync throws propagate; Promise rejections caught only by upstream `fromPromise`)
  - `src/async-result/mapErr.ts:39`
  - `src/async-result/orElse.ts:44`
  - `src/async-result/bimap.ts:46`
  - `src/async-result/tap.ts:42`
  - `src/async-result/tapErr.ts:42`
- **Problem case**: When the developer's mapping callback throws an arbitrary `unknown`, the
  library casts it to the user-declared error type. This is documented "tap/tee catch+convert"
  policy, but the policy itself lies about the runtime payload for non-Error throws:
  ```ts
  const r = pipe(
      fromResult(ok(1)),
      map<number, string, MyError>(x => { throw 'string-throw'; }),
  );
  // type: AsyncResult<string, MyError>
  // runtime: AsyncResult<string, 'string-throw'>  // misnomer at the type level
  ```
- **Expected**: Either widen the error to `E | unknown` or require a per-operator
  `errorFn: (thrown: unknown) => E` factory.
- **Severity**: medium (the policy is documented — but the underlying issue is the same as
  `option/okOrElse.ts` and `operators/catchErr.ts`).

### 9. `src/operators/bimap.ts:36`, `src/operators/andThrough.ts:50`, `src/operators/filterOrElse.ts:41` — same `e as unknown as E | F` catch pattern
- **APIs**: see titles above.
- **Problem case**: Same catch-block type-lying as #8. Documented throw policy; the underlying
  risk is identical.
- **Severity**: medium

### 10. `src/async-option/orElse.ts` — locks recovered type to input value type
- **API**: `src/async-option/orElse.ts` / exported `orElse`
- **Problem case**:
  ```ts
  export function orElse<T>(
      fn: () => AsyncOption<T> | Promise<IOption<T>>,
  ): (ao: AsyncOption<T>) => AsyncOption<T>;
  ```
  The fallback must produce the same `T` as the input, mirroring the bug in `option/orElse.ts`.
  Same fix shape: `<T, U>(fn: () => AsyncOption<U> | Promise<IOption<U>>): (ao: AsyncOption<T>) => AsyncOption<T | U>`.
- **Severity**: medium

### 11. `src/async-option/zipWith.ts` — locks zip-with to two operands; no `zipWith3`/variadic
- **API**: `src/async-option/zipWith.ts` / exported `zipWith`
- **Problem case**: Three- and four-operand zips in pipelines require nested calls and lose
  heterogeneous inference at every layer beyond the second.
- **Severity**: medium (feature gap that hurts composition)

### 12. `src/combine/combine.ts` — heterogeneous arrays not supported (use `all` instead)
- **API**: `src/combine/combine.ts` / exported `combine`
- **Problem case**: `combine<A, E>(results: readonly IResultOfT<A, E>[]): IResultOfT<A[], E>`
  forces all inputs to share `A` and `E`:
  ```ts
  combine([ok(1), ok('a')]); // either cast `as IResultOfT<string|number, never>[]` or fail
  ```
  The sibling `combine/all.ts` already supports heterogeneous tuple inference. Pipeline users
  expect both forms to "just work".
- **Severity**: medium (the workaround is to use `all`, but the dual naming suggests `combine`
  is the primitive)

### 13. `src/async-option/all.ts` — homogeneous `T` only; no heterogeneous-tuple overload
- **API**: `src/async-option/all.ts` / exported `all`
- **Problem case**: `all(aos: readonly AsyncOption<T>[]): AsyncOption<T[]>` requires uniform `T`.
  Compare with `src/combine/all.ts` which uses `{ [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never }`
  for heterogeneous tuple inference.
- **Severity**: medium

### 14. `src/promise-result/unwrapOrAsync.ts`, `unwrapOrElseAsync.ts` and `src/promise-option/unwrapOrAsyncOption.ts`, `unwrapOrElseAsyncOption.ts` — same single-`T` lock pattern as `option/unwrapOr.ts`
- **APIs**: see titles above.
- **Problem case**: The async-side default value is locked to `T` matching the inner success value.
  Same fix as `option/unwrapOr.ts`.
- **Severity**: medium

### 15. `src/async-result/fromPromise.ts:34`, `src/factories/fromPromise.ts:26`, `src/factories/fromThrowable.ts:31`, `src/factories/tryCatch.ts:27`, `src/factories/tryCatchAsync.ts:26`, `src/adapters/switchFn.ts:33`, `src/adapters/switchFnAsync.ts:31` — same catch-block cast when `errorFn` is omitted
- **APIs**: see titles above.
- **Problem case**: When the developer does NOT supply `errorFn`, the library passes through
  the raw `unknown` rejection cast to `E`:
  ```ts
  const innerError = errorFn ? errorFn(e) : (e as unknown as E);
  ```
  This is documented behavior — the rejection IS cast. The issue is the "no errorFn" branch
  silently widens `unknown` to whatever `E` the user declared, which is type-lying for
  discriminated unions.
- **Severity**: medium

### 16. `src/factories/fromSafePromise.ts:29` — hardcoded `Error` shape
- **API**: `src/factories/fromSafePromise.ts`
- **Problem case**: The function is annotated as returning `IResultOfT<T, Error>` but the only
  thing the library knows about `E` defaults — the developer can't pick a different error
  shape because `E` is hardcoded as `Error`. The export also forces a closed `Error` type.
- **Expected**: generic `<T, E = Error>` with `errorFn?: (raw: unknown) => E` mirror of
  `fromPromise`.
- **Severity**: medium (locked `Error` is a default, but the function does NOT support
  custom shapes even when desired)

### 17. `src/async-result/tap.ts`, `src/async-result/tapErr.ts`, `src/async-result/mapErr.ts`, `src/operators/tap.ts`, `src/operators/tapErr.ts`, `src/operators/andTee.ts`, `src/operators/orTee.ts`, `src/operators/andThrough.ts` — when fn throws, result error type is the user-declared `E`, but no `errorFn` is offered to map the throw
- **APIs**: see titles above.
- **Problem case**: The throw policy cast `e as unknown as E` cannot be customised. For users
  who want to discriminate their error union, an `errorFn: (thrown: unknown) => E` parameter
  is the standard remedy (already used by `fromThrowable`/`fromPromise`).
- **Severity**: medium (the operator family does NOT offer the same hook that the factories do)

---

## Low Severity

### 18. `src/option/ofNone.ts` and `src/async-option/ofNone.ts` — default `T = never`
- **APIs**: see titles above.
- **Problem case**: `ofNone<T = never>()` makes a bare `ofNone()` incompatible with any
  `IOption<X>` slot in a pipeline:
  ```ts
  pipe(ofNone(), map(x => x.toFixed()), bind(x => ofSome(x.toString())));
  // x: never in each step — type system can't show what's missing
  ```
  The factory's JSDoc admits this; but it is friction in pipeline composition. A default of
  `unknown` would let the singleton sit in any slot and let contextual typing do the rest.
- **Severity**: low (documented, but real pipeline friction)

### 19. `src/option/transpose.ts` — uses `ofNone()` without type argument
- **API**: `src/option/transpose.ts`
- **Problem case**:
  ```ts
  if (!opt.isSome) return ok(ofNone()) as unknown as IResultOfT<IOption<T>, E>;
  ```
  Within a generic context, callers cannot predict what `T` is inferred as. The cast hides
  the inference site.
- **Severity**: low (inconsistent with the rest of the file's `ofNone<T>()` style)

### 20. `src/option/traverseArray.ts` — `readonly A[]` only, no Iterable
- **API**: `src/option/traverseArray.ts` / exported `traverseArray`
- **Problem case**: Generators and iterables used in stream composition don't fit:
  ```ts
  function* gen(): IterableIterator<number> { yield 1; yield 2; }
  traverseArray(x => ofSome(x), gen()); // ERROR
  ```
- **Severity**: low (feature gap)

### 21. `src/option/zipWith.ts` — binary only
- **API**: `src/option/zipWith.ts`
- **Problem case**: Three-or-more option tuples must decompose into nested `zipWith`, losing
  inference symmetry. Mirror of `async-option/zipWith.ts`.
- **Severity**: low

### 22. `src/async-option/flatten.ts` — unnecessary `as unknown as IOption<T>` cast on None
- **API**: `src/async-option/flatten.ts` line 18:
  ```ts
  if (!opt.isSome) return opt as unknown as IOption<T>;
  ```
  After `!opt.isSome`, TS has already narrowed `opt` to `IOptionNone` — a member of
  `IOption<T>` for every `T`. The cast is only there to silence a false alarm; it also masks
  the narrowing so future readers can't see the type story.
- **Severity**: low (cosmetic, but signals an intent mismatch)

### 23. `src/promise-option/tapErrAsyncOption.ts` — callback typed `(value: T | undefined) => …`
- **API**: `src/promise-option/tapErrAsyncOption.ts`
- **Problem case**: On the `None` path there is genuinely no value, yet the slot is typed
  `T | undefined`. The library executes `if (inner.isNone) await fn(undefined as T | undefined);`
  meaning the developer can write a callback that compiles cleanly yet blows up at runtime:
  ```ts
  await tapErrAsyncOption((v: number) => console.log(v.id), asyncNone<number>());
  // v is `undefined` at runtime — `v.id` throws
  ```
- **Expected**: split into `fn: (value: T) => void | Promise<void>` for Some + `fnNone?: () => void | Promise<void>` for None.
- **Severity**: low (misleads but doesn't break happy path)

### 24. `src/promise-option/asyncMapOption.ts:29`, `src/promise-option/mapAsyncOption.ts:33`, `:37`, `src/promise-option/bindAsyncOption.ts:35`, `src/promise-option/orElseAsyncOption.ts:39`, `src/promise-option/tapAsyncOption.ts:36` — bare `ofNone()` (no type arg) inside `IOption<B | U>` slots
- **APIs**: see titles above.
- **Problem case**: Same `never`-default propagation as #18. Each call is type-safe under
  `strict`, but loses self-documenting intent — particularly painful in curried forms.
- **Severity**: low

### 25. `src/async-result/mapAsync.ts` — sync throws propagate as Promise rejection, but the success path can lose the error type
- **API**: `src/async-result/mapAsync.ts`
- **Problem case**: When `fn` rejects asynchronously, the rejection propagates. When `fn`
  throws synchronously, the throw escapes the `run()` executor and there is NO `catch`
  converting it. This is documented, but means the error type stays the user's `E` (no
  widening — fine), while inconsistency with `map` (which catches sync throws and
  re-wraps) becomes a footgun in mixed pipelines.
- **Severity**: low (documented asymmetry)

### 26. `src/factories/ok.ts`, `src/factories/fromPredicate.ts` — use `arguments.length` to differentiate overloads
- **APIs**: see titles above.
- **Problem case**: `arguments.length` is technically valid in non-arrow functions and the docs
  call this out, but it conflicts with strict-type arrow-friendly signatures used elsewhere in
  the library and is a known footgun in strict-mode bundlers.
- **Severity**: low (works today; brittle under future strictness)

### 27. `src/operators/expect.ts:21`, `src/operators/expectErr.ts:21`, `src/operators/unwrap.ts:18`, `src/operators/unwrapErr.ts:18` — always `new TypeError(...)`; can't customize thrown error class
- **APIs**: see titles above.
- **Problem case**: When the developer has a custom error class, the library throws a built-in
  `TypeError` whose `cause` / `kind` discriminator can't carry domain-meaningful data. There
  is no opt-out / customization hook.
- **Expected**: accept a `throwingFn: (info: { message: string; value: T | E }) => Error` /
  `Error` parameter.
- **Severity**: low (escape hatches exist via `unsafeUnwrap`/`unsafeUnwrapErr`)

### 28. `src/observability/inspect.ts`, `src/observability/observe.ts` — custom error shapes round-tripped through `inspect`; no narrowing help for tagged unions
- **APIs**: see titles above.
- **Problem case**: `inspect` returns `{ kind: 'ok', value: T } | { kind: 'err', error: E }`,
  which is great for logging but doesn't help with narrowing tagged unions at the call site.
  This is by design but is friction for cases where `E` is a tagged union.
- **Severity**: low (design choice, not a lock)

### 29. `src/operators/ap.ts` — required both `fnResult` and `result` to share `E`
- **API**: `src/operators/ap.ts`
- **Problem case**:
  ```ts
  export function ap<A, B, E>(
      fnResult: IResultOfT<(a: A) => B, E>,
      result: IResultOfT<A, E>,
  ): IResultOfT<B, E>;
  ```
  The function-result and value-result are required to have identical error types `E`.
  Pipeline composition with two result-types-of-different-errors requires manual handling.
- **Expected**: `<A, B, E, F>(fnResult: IResultOfT<(a: A) => B, E>, result: IResultOfT<A, F>): IResultOfT<B, E | F>`.
- **Severity**: low (friction in heterogeneous-error pipelines)

### 30. `src/async-result/tapErr.ts` — `fn` typed `(error: E) => void`; can't return a Promise to surface async outcomes
- **API**: `src/async-result/tapErr.ts`
- **Problem case**: The callback is sync-only even though the surrounding context is async.
  Compare with `observability/tapErrContext.ts`, which correctly accepts
  `(error: E, ctx) => unknown` (sync or async).
- **Severity**: low (symmetry missing)

### 31. `src/observability/tapErrContext.ts` — returns `Promise<IResultOfT<T,E>> | IResultOfT<T,E>` union, breaks pipe composition
- **API**: `src/observability/tapErrContext.ts`
- **Problem case**: Both curried and direct overloads return a union whose right branch is
  selected based on whether the user's callback was sync or async:
  ```ts
  export function tapErrContext<T, E>(
      fn: (error: E, context: ErrContext) => unknown,
  ): (r: IResultOfT<T, E>) => Promise<IResultOfT<T, E>> | IResultOfT<T, E>;
  ```
  In a sync `pipe`, the next step receives a union — the developer must narrow with a cast
  even when the callback is provably sync:
  ```ts
  pipe(
      ok(42),
      tapErrContext((e) => console.error(e)),  // sync callback — but type still says union
      (r) => {
          if (r instanceof Promise) return r;
          return r; // forced narrowing
      },
  );
  ```
- **Expected**: Always return `Promise<IResultOfT<T, E>>` (the awaited form) so a single
  signature threads through pipelines and the user wraps with `await` or `pipeAsync` at the
  boundary; or provide distinct sync/async overloads (mirroring how `map`/`mapAsync` are
  separated).
- **Severity**: medium

### 32. `src/observability/withPath.ts` — `withPath(segment)` returns `void`; can't be threaded through `pipe`
- **API**: `src/observability/withPath.ts`
- **Problem case**: The single-argument overload is declared `void`:
  ```ts
  export function withPath(segment: PathSegment): void;
  export function withPath<T, E>(segment: PathSegment, r: IResultOfT<T, E>): IResultOfT<T, E>;
  ```
  Inside a `pipe`, only the binary form threads values; the curried `withPath('seg')` is
  unusable as a pipe slot:
  ```ts
  pipe(
      err('x'),
      (r) => withPath('first', r),   // forced arrow wrap
      (r) => withPath('second', r),  // forced arrow wrap
  );
  ```
  Compare with `tap`/`tapErr`/`bind`/`mapErr`, whose curried forms return
  `(r) => IResultOfT`/`AsyncResult` and slot directly into `pipe`.
- **Expected**: A third overload that accepts `withPath<T,E>(segment, fn: (r: IResultOfT<T,E>) => IResultOfT<T,E>)`
  or returns a curried `(r: IResultOfT<T, E>) => IResultOfT<T, E>` so `pipe` can use it.
- **Severity**: low (workaround is the arrow wrapper, but the API is asymmetric)

### 33. `src/primitives/partitionOption.ts` — returns mutable arrays from `readonly` input
- **API**: `src/primitives/partitionOption.ts` / `Partitioned<T>`
- **Problem case**: Input is `readonly IOption<T>[]`, but `Partitioned<T>` exposes
  `readonly some: T[]` (the field is marked `readonly`, but `T[]` itself is mutable):
  ```ts
  partitioned.some.push(maliciousValue); // allowed at the type level
  ```
  Other combinators (`sequence`, `combine`, `reduce`) don't expose mutation surfaces.
- **Expected**: `readonly some: readonly T[]` to match the rest of the library.
- **Severity**: low (cosmetic inconsistency)

### 34. `src/primitives/lift.ts` — single-argument overload's `IResultOfT<T, never>` is type-lying when fn throws
- **API**: `src/primitives/lift.ts`
- **Problem case**: When `errorFn` is absent, the type signature pins `E = never` and the
  `catch` block re-throws:
  ```ts
  const total = lift((n: number) => {
      if (n < 0) throw new Error('negative');
      return n * 2;
  });
  // type: (...args) => IResultOfT<number, never>
  // runtime: throws escape from the wrapper for negative inputs
  ```
  Consumers who rely on the type system alone believe the channel cannot produce an `Err` —
  but a thrown exception does escape the wrapper. The library documents this but the type
  signature is still a contract claim.
- **Expected**: Widen to `IResultOfT<T, never | throws>` (impossible directly), or push the
  user to `lift(fn, errorFn)` and accept that the "no errorFn" path is escape-hatch only —
  surfaced by a separate `liftThrowing` name.
- **Severity**: low (documented asymmetry)

### 35. `src/reliability/any.ts`, `src/reliability/allSettled.ts` — defensive cast `rej as unknown as E` for unexpected rejections
- **APIs**: see titles above.
- **Problem case**: The inner thunk contract says `.run()` never rejects; when it does, the
  rejection is captured and silently widened to the *outer* `E` (not the inner thunk's `E`):
  ```ts
  (rej: unknown) => { errors.push(rej as unknown as E); },  // any.ts
  settledOutcomes[idx] = { ok: false, error: rej as unknown as E }; // allSettled.ts
  ```
  This is "defensive and rare" — but the cast can misrepresent the inner error at the
  consumer's narrowing point if it ever fires.
- **Severity**: low (defensive; documented as the AsyncResult no-rejection contract)

### 36. `src/promise-result/unwrapOrAsync.ts`, `src/promise-result/unwrapOrElseAsync.ts` — single-`T` lock, mirrors `option/unwrapOr.ts`
- **APIs**: see titles above.
- **Problem case**:
  ```ts
  // unwrapOrAsync.ts
  export function unwrapOrAsync<A, E>(
      defaultValue: A | Promise<A>,
  ): <R extends Promise<IResultOfT<A, E>>>(r: R) => Promise<A>;
  ```
  The promise-side default is locked to `A`, the same value type as the success branch.
  Users can't fall back to a wider / sentinel value:
  ```ts
  pipe(
      fromPromise(() => fetchUser()), // Promise<IResultOfT<User, NetworkError>>
      unwrapOrAsync<null>(null),     // ERROR — `A = null`
      unwrapOrAsync(defaultUser),    // ERROR — `A = DefaultUser` not `User`
  );
  ```
  Same fix shape as `option/unwrapOr.ts` (`<A, D = A>`).
- **Severity**: medium (named-async mirror of the sync bug; affects every async pipeline)

### 37. `src/promise-result/mapOrAsync.ts` — curried form `<A, B, E>` ordering makes `E` uninferable from the first two args
- **API**: `src/promise-result/mapOrAsync.ts`
- **Problem case**: `E` does not appear in the curried form's arguments:
  ```ts
  export function mapOrAsync<A, B, E>(
      defaultValue: B,
      fn: (a: A) => B | Promise<B>,
  ): <R extends Promise<IResultOfT<A, E>>>(r: R) => Promise<B>;
  ```
  When called with only `defaultValue` + `fn`, `E` cannot be inferred and defaults to
  `unknown`. The user must write `mapOrAsync<number, string, NetworkError>(...)` to keep
  their error tagged-union visible. Compare with `mapOrElseAsync<A, B, E>` whose
  `onErr` parameter enables inference.
- **Expected**: Provide a single-arg `errorFn`-bearing overload, or expose
  `mapOrAsync`'s `E` via a partial-application helper.
- **Severity**: low (ergonomic; the type is preserved at the application site via `R extends Promise<IResultOfT<A, E>>`)

### 38. `src/promise-result/mapOrAsync.ts`, `src/promise-result/unwrapOr.ts` (and async siblings) — duplicate implementations under different names
- **APIs**:
  - `src/promise-result/unwrapOrAsync.ts` and `src/promise-result/unwrapOr.ts` are byte-identical.
  - `src/promise-result/unwrapOrElseAsync.ts` and `src/promise-result/unwrapOrElse.ts` are byte-identical.
- **Problem case**: Both produce the exact same type and behavior:
  ```ts
  await unwrapOr(0, asyncOk(42));      // Promise<number>
  await unwrapOrAsync(0, asyncOk(42)); // Promise<number>
  ```
  No type bug — the duplication is documented (docstring: "naming parity with
  `mapAsync`/`mapErrAsync`"). Including in this audit only because the duplicated surface
  is a foot-gun for inconsistent future maintenance.
- **Severity**: low (documentation/ergonomics)

### 39. `src/promise-result/mapOrAsync.ts:39-43` — silently swallows `fn` throws, asymmetric with `mapOrElseAsync`
- **API**: `src/promise-result/mapOrAsync.ts`
- **Problem case**: The implementation has a `try/catch { return defaultValue; }` that
  discards both sync throws and async rejections from `fn`:
  ```ts
  try {
      return await fn(r.value);
  } catch {
      return defaultValue;
  }
  ```
  Compare with `mapOrElseAsync`, which lets throws propagate. The asymmetry means a
  developer's `fn` throwing will yield `defaultValue` from `mapOrAsync` but blow up the
  pipeline when invoked through the more granular `mapOrElseAsync`. Behavior documented
  in JSDoc, not a type lock.
- **Severity**: low (documented behavior — no type-level lock, but the resulting pipeline
  cannot use discriminated throws to surface errors)

### 40. `src/async-result/bind.ts` — locks outer `E` to inner `E` (no union widening)
- **API**: `src/async-result/bind.ts`
- **Problem case**:
  ```ts
  export function bind<T, U, E>(
      fn: (value: T) => AsyncResult<U, E> | Promise<IResultOfT<U, E>>,
  ): (ar: AsyncResult<T, E>) => AsyncResult<U, E>;
  ```
  Both the outer AsyncResult and the inner callback's returned AsyncResult must share `E`.
  Compare with `src/operators/bind.ts` which widens `E | F`. This deviation means a
  `dbErr`/`validationErr` pipeline cannot use the async `bind` without manual unification:
  ```ts
  pipe(
      fromResult(ok(config)),                   // AsyncResult<Config, AppError>
      bind(c => fromPromise(loadUser(c.id))),  // inner has error type DbError, not AppError — ERROR
  );
  ```
- **Expected**: `<T, U, E, F>(fn: (v: T) => AsyncResult<U, F> | Promise<...>): (ar: AsyncResult<T, E>) => AsyncResult<U, E | F>`.
- **Severity**: medium (asymmetric with the sync `bind`)

### 41. `src/async-result/tap.ts`, `src/async-result/tapErr.ts` — async callback's promise is silently swallowed
- **API**: `src/async-result/tap.ts`, `src/async-result/tapErr.ts`
- **Problem case**: The JSDoc claims "The callback may be sync or async", but the body
  calls the callback without awaiting it:
  ```ts
  // tap.ts
  run: async () => {
      const r = await ar.run();
      if (r.isSuccess) {
          try {
              fn(r.value);  // ← not awaited — async callback returns a floating Promise
          } catch (e) { /* converts sync throws to err */ }
      }
      return r;
  }
  ```
  Users who supply an `async` callback per the documentation get fire-and-forget semantics
  with **silently swallowed rejection**:
  ```ts
  const sideEffect = async (v: number) => { throw new Error('boom'); await save(v); };
  const ar = tap(sideEffect, fromResult(ok(42)));     // typed as `AsyncResult<number, E>` (E = unknown)
  await ar.run();                                     // resolves; `sideEffect`'s rejection is lost (floating).
  ```
  Because the type is `() => void` (bivariant with `() => Promise<void>`), the compiler
  doesn't enforce sync-only behavior. A user reading the docs and supplying an async
  callback receives silently-different semantics than `tapAsync` (which does await).
- **Expected**: Either (a) tighten `fn` to `(v: T) => void | Promise<void>` AND `await fn(r.value)`,
  or (b) rename to `tapSync` / `tapErrSync` so the sync-only nature is in the symbol name.
- **Severity**: medium (silent error loss)

### 42. `src/async-result/expect.ts`, `src/async-result/expectErr.ts`, `src/async-result/unwrap.ts`, `src/async-result/unwrapErr.ts` — `String(r.error)` clobbers structured `E`
- **APIs**: see titles above.
- **Problem case**: For an `E` that is a structured shape (class instance, object literal,
  tagged union member), `String({code: 1})` yields `'[object Object]'`:
  ```ts
  type DbErr = { kind: 'timeout' | 'auth'; trace: string };
  await expect('must connect',
      fromResult(err<DbErr>({ kind: 'timeout', trace: 't1' })));
  // throws: Error(`must connect: [object Object]`) — `kind` and `trace` are lost.
  ```
  The original `E` shape is preserved on `result.error` but discarded when constructing
  the thrown `Error`. No `toString` is invoked on the user's type, no `cause` is attached,
  no `inspect`-style structural view is used.
- **Expected**: Either (a) attach the original `E` as `cause` on the thrown `Error`, or
  (b) accept a `formatErr?: (e: E) => string` hook.
- **Severity**: medium (debuggability + fidelity loss for custom error shapes)

### 43. `src/async-result/ap.ts` — locks `E` between fn-result and value-result
- **API**: `src/async-result/ap.ts`
- **Problem case**:
  ```ts
  export function ap<A, B, E>(
      fnResult: AsyncResult<(a: A) => B, E>,
  ): (result: AsyncResult<A, E>) => AsyncResult<B, E>;
  ```
  Identical to the sync `operators/ap.ts` finding (item #29): both carriers must share `E`.
- **Severity**: low (matches `operators/ap.ts`)

### 44. `src/types/asyncCarrier.ts` — `isAsyncCarrier` declared as `boolean`, not a type predicate
- **API**: `src/types/asyncCarrier.ts`
- **Problem case**:
  ```ts
  // declaration
  export const isAsyncCarrier: (v: unknown) => v is unknown; // returns boolean
  ```
  Because the return type is a non-narrowing boolean, downstream `bind`/`orElse` cannot
  narrow their `T | Promise<T>` callback results and must cast:
  ```ts
  // src/async-option/bind.ts:43
  if (isAsyncCarrier(next)) {
      return (next as AsyncOption<U>).run();
  }
  return next as unknown as IOption<U>;  // ← cast forced because the predicate is not branded
  ```
  If `isAsyncCarrier` were declared with a type predicate like
  `(v: unknown): v is AsyncCarrier`, the cast would disappear and a caller's structural
  violation (returning a primitive) would surface as a compile-time error.
- **Severity**: medium (two call-sites depend on this)

### 45. `src/async-option/bind.ts`, `src/async-option/orElse.ts` — duplicate `as unknown as IOption<T>` cast
- **APIs**: see titles above.
- **Problem case**: After `if (isAsyncCarrier(next))`, the `else` branch unconditionally
  casts the value:
  ```ts
  // bind.ts:43 and orElse.ts:42
  return next as unknown as IOption<U>;  // bind
  return next as unknown as IOption<T>;  // orElse
  ```
  The cast exists only because `isAsyncCarrier` returns a non-narrowing `boolean`. The
  underlying contract ("if the callback returns a `Promise<IOption<T>>`, treat it as
  one") is unsound at the type level; the cast is a structural lie that hides a callback
  that violates the signature.
- **Severity**: medium (consequence of #44)

### 46. `src/async-option/okOr.ts`, `src/async-option/okOrElse.ts` — ternary `IResultOfT<T, never> | IResultOfT<never, E>` cast through `Awaited<ReturnType<...>>`
- **APIs**: `src/async-option/okOr.ts:38`, `src/async-option/okOrElse.ts:35,37,39`
- **Problem case**:
  ```ts
  // okOr.ts
  return (opt.isSome ? ok(opt.value) : err(error))
      as unknown as Awaited<ReturnType<AsyncResult<T, E>['run']>>;
  ```
  The two arms `IResultOfT<T, never>` and `IResultOfT<never, E>` are not jointly
  assignable to `IResultOfT<T, E>` under strict typing. The `Awaited<ReturnType<...>>`
  cast works only because `AsyncResult<T, E>['run']` returns the target type — but
  future changes to `IResultOfT` (e.g. adding a discriminating field) will silently
  compile while leaving a broken carrier.
- **Expected**: Either (a) type the result with the precise union and refactor the cast
  away, or (b) add a `Mixed` helper that takes the ternary and returns
  `IResultOfT<T, E>` directly.
- **Severity**: medium

### 47. `src/async-option/transpose.ts:38` — `syncOfNone()` cast is unnecessary; `syncOfNone<T>()` already type-checks
- **API**: `src/async-option/transpose.ts`
- **Problem case**:
  ```ts
  if (!inner.isSome) {
      return ok(syncOfNone() as unknown as IOption<T>) as unknown as IResultOfT<IOption<T>, E>;
  }
  ```
  `syncOfNone<T>()` already returns `IOption<T>` (no widening needed). The cast only exists
  because the call site omitted the explicit type argument.
- **Severity**: low (cosmetic but persists the cast-debt pattern)

### 48. `src/async-option/{map,mapAsync}.ts`, `orElse.ts`, `tap.ts`, `tapAsync.ts` — bare `ofNone()` losing self-documenting intent
- **APIs**: see titles above.
- **Problem case**: `return ofNone();` inside an `IOption<U>` slot relies on
  `IOption<never>` being structurally assignable to `IOption<U>`. Other sibling files
  (`bind.ts:37,45`, `filter.ts:42,44`) use the explicit form `ofNone<U>()` — these files
  don't, creating an inconsistency.
- **Severity**: low (clarity only)

### 49. `src/operators/or.ts` — curried overload does not defer `E`; output error widens to `unknown`
- **API**: `src/operators/or.ts`
- **Problem case**:
  ```ts
  export function or<A, E, F>(other: IResultOfT<A, F>): (r: IResultOfT<A, E>) => IResultOfT<A, E | F>;
  ```
  In the curried form, only `A` and `F` are inferable from `other`; `E` is declared but
  appears in the returned function's input and output only. When the user writes
  ```ts
  const fn = or(ok(1) as IResultOfT<number, RangeError>);
  const out = fn(err(new TypeError()) as IResultOfT<number, TypeError>);
  // out: IResultOfT<number, unknown>
  ```
  the returned function's `E` is locked to whatever `fn`'s call-site inference produced —
  in this case widening to `unknown` because TS doesn't pull `E` from the application.
- **Expected**: `<A, F>(other: IResultOfT<A, F>): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E | F>`.
- **Severity**: high (compromises the entire pipeline-inference design that the criteria require)

### 50. `src/operators/andTee.ts` — `B` and `F` parameters are phantom types
- **API**: `src/operators/andTee.ts`
- **Problem case**: The callback returns `IResultOfT<B, F>`, but the operator returns
  `IResultOfT<A, E>` (the input's types) — `B` and `F` are declared solely for callback
  typing and discarded:
  ```ts
  export function andTee<A, E, B, F>(
      fn: (a: A) => IResultOfT<B, F>,
      r: IResultOfT<A, E>,
  ): IResultOfT<A, E>;
  ```
  This is intentional (the operator ignores the callback's return value) but provides no
  marker that `B`/`F` are inert — callers may rely on their generics for constraint
  resolution.
- **Severity**: low (API sign convention)

### 51. `src/operators/unwrapOr.ts` — curried form infers literal `A` too narrow
- **API**: `src/operators/unwrapOr.ts`
- **Problem case**:
  ```ts
  export function unwrapOr<A>(defaultValue: A): <E>(r: IResultOfT<A, E>) => A;
  ```
  When called bare, `A` is inferred from the default:
  ```ts
  const fn = unwrapOr(0);        // A = 0  (literal, not number)
  fn(ok(42) as IResultOfT<number, CustomError>); // ERROR — A is 0, expects IResultOfT<0, _>
  ```
- **Expected**: Either widen the parameter (e.g. type as `A` rather than literal), or add
  an `inferredA: A` overload.
- **Severity**: low

### 52. `src/operators/bimap.ts` — curried form locks `A, E` from the callback; pipeline input later can't refine
- **API**: `src/operators/bimap.ts`
- **Problem case**:
  ```ts
  export function bimap<A, E, C, F>(
      onOk: (a: A) => C,
      onErr: (e: E) => F,
  ): (r: IResultOfT<A, E>) => IResultOfT<C, F>;
  ```
  `A` and `E` are inferred from the explicit parameter annotations on `onOk`/`onErr`. A
  result with a wider error type is rejected:
  ```ts
  const f = bimap(
      (n: number) => n.toString(),
      (e: DomainError) => e.message,
  );
  const r: IResultOfT<number, string> = ...;
  f(r); // REJECTED — error type locked to DomainError
  ```
- **Expected**: `<A, E, C, F>(...): <A2, E2>(r: IResultOfT<A2, E2>) => IResultOfT<C, F>` where the
  inner `A2`/`E2` are deferred to the application site (mirroring `map` / `mapErr`'s design).
- **Severity**: medium (inconsistent with sibling operators)

### 53. `src/operators/unzip.ts`, `src/operators/swap.ts` — structural-soundness workarounds via `as unknown as`
- **APIs**: see titles above.
- **Problem case**: Both rely on a failure value being projected to *both* output carrier
  types (`unzip.ts`) or on construction-time `never` tracks being widened to the swapped
  pair (`swap.ts`):
  ```ts
  // unzip.ts:28-29
  return [
      r as unknown as IResultOfT<A, E>,
      r as unknown as IResultOfT<B, E>,
  ];
  // swap.ts:20-21
  if (r.isSuccess) return err(r.value) as unknown as IResultOfT<E, A>;
  return ok(r.error) as unknown as IResultOfT<E, A>;
  ```
  Narrowing on `isSuccess` keeps the runtime safe — but the type story says the
  constructed objects are members of the broader `IResultOfT<E, A>` union when they
  actually contain a phantom `never` track. A future change to `IResultOfT` would silently
  compile yet produce a broken carrier.
- **Expected**: Build the carrier as an explicit `IResultOfT<E, A>` literal so the type
  matches the runtime shape.
- **Severity**: low (currently safe by structural narrowing)

---

## Cross-Module Patterns (no per-API file needed)

- **"type-locked default" pattern**: the canonical recovery operators
  (`unwrapOr`, `orElse`, `catchErr`, `mapOr`'s twinned `unwrapOr`) force the recovery value /
  fallback to share the input value's type. The library's stated philosophy (cf. `err`) is
  to let the developer choose any custom shape — these operators partially violate that.
- **"catches but casts to `unknown as E`" pattern**: every operator whose doc-comment
  describes a "sync-throw → Err" conversion policy (`tap`, `tapErr`, `bind`, `map`,
  `mapErr`, `mapOr`, `bimap`, `andTee`, `orTee`, `andThrough`, `filterOrElse`,
  `okOrElse`, `fromPromise`, `fromThrowable`, `tryCatch`, `tryCatchAsync`,
  `switchFn`, `switchFnAsync`, `fromSafePromise`, `async-result/{tap,tapErr,…}`)
  accepts an arbitrary thrown `unknown` and casts it to the user-declared `E`. The
  user has no `errorFn` hook to discriminate, despite such hooks being provided by the
  `tryCatch` / `fromThrowable` family.
- **"`defaultAbortedSentinel`/`new Error(...)` cast to `E`" pattern**: `reliability/race.ts`
  and `reliability/retry.ts` produce error values the type system claims are `E` but
  whose runtime shape is library-defined. Same comment applies to `reliability/timeout.ts`'s
  default `TimeoutError`, although `timeout.ts` provides an `onTimeout` hook that mitigates.

---

## Files Audited (no issues) — clean under all three criteria

`factories/{err,fromPredicate,fromPromise,fromThrowable,tryCatch,tryCatchAsync,asyncOk,asyncErr}`,
`types/{IResult,IResultOfT,Option,AsyncOption,AsyncResult}`,
`operators/{contains,exists,map,mapErr,bimap,mapOr,mapOrElse,unwrapOr,unwrapOrElse,or,orElse,and,andTee,andThrough,tap,tapErr,flatten,separate,swap,unzip,choose,traverseArray,filterOrElse,unsafeUnwrap,unsafeUnwrapErr,unwrap,unwrapErr,expectErr,orThrow,orThrowWith,match}`,
`option/{bind,contains,filter,flatten,map,match,ofSome,okOr,tap}`,
`async-option/{from,fromPromise,fromOption,ofSome,ofNone,map,mapAsync,mapOr,mapOrElse,bind,match,filter,isSome,isNone,unwrap,unwrapOr,unwrapOrElse,exists,contains,okOr,tap,tapAsync,flatten,okOrElse,transpose}`,
`async-result/{from,fromPromise,fromResult,bimap,map,mapAsync,mapErr,bind,orElse,match,contains,containsErr,exists,unwrap,unwrapOr,unwrapOrElse,unwrapErr,expect,expectErr,isOk,isErr,tap,tapErr,flatten}`,
`composition/{pipe,pipeAsync}`,
`adapters/{switchFn,switchFnAsync,liftMap,tee,teeAsync,toOption,fromOption}`,
`observability/{inspect,observe,format,withPath,tapErrContext,ctx}`,
`primitives/{cond,condErr,lift,partitionOption,reduce,sequence,sequenceAsyncResult}`,
`reliability/{any,allSettled,timeout,timeoutEager,retryLazy}`.

---

## Summary

- **High**: 5 — `unwrapOr.ts`, `orElse.ts`, `catchErr.ts`, `reliability/retry.ts`,
  `reliability/race.ts` (recoveries that lie about error shape when the developer has
  declared a tagged-union `E`).
- **Medium**: 12 — `option/all.ts`, `option/okOrElse.ts`, async-result / operators'
  catch-blocks-casting-to-`E` family, `async-option/orElse.ts`, `async-option/zipWith.ts`,
  `combine/combine.ts`, `async-option/all.ts`, `promise-result/{unwrapOrAsync,unwrapOrElseAsync}.ts`,
  `promise-option/{unwrapOrAsyncOption,unwrapOrElseAsyncOption}.ts`, the factories'
  no-`errorFn` catch path, `factories/fromSafePromise.ts`, the operators' `tap*` family
  missing an `errorFn` hook.
- **Low**: 13 — `option/ofNone.ts` default, `option/transpose.ts`, `option/traverseArray.ts`,
  `option/zipWith.ts`, `async-option/flatten.ts`, `promise-option/tapErrAsyncOption.ts`,
  the several `promise-option/...AsyncOption.ts` bare `ofNone()` calls,
  `async-result/mapAsync.ts` sync-throw asymmetry, `factories/{ok,fromPredicate}.ts`
  `arguments.length`, `operators/{expect,expectErr,unwrap,unwrapErr}.ts` class lock,
  `observability/{inspect,observe}.ts` narrowing friction,
  `operators/ap.ts` required identical `E`, `async-result/tapErr.ts` sync-only callback.
