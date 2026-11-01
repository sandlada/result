# Bugs

Working log of bugs and incidents found in `@sandlada/result`.

Each entry records: what breaks, where, a minimal reproduction, and the observed
versus expected behaviour. Entries are append-only — a fix is noted in the entry
rather than by deleting it, so the history stays readable.

**Scope note:** this file is a catalogue of defects, not a work log. Do not
reference entry IDs from `.ts` / `.spec.ts` comments (see the Comment Policy in
`AGENTS.md`) - encode the constraint in the code or the test instead.

**Pointer note:** the `Where` section of an entry gives the file path and the
line numbers *as they were when the defect was found*. The line numbers are a
historical anchor, not a live index - the code at that location has usually
been rewritten by the fix, so a line number can point past the end of the
current file. The durable identifiers are the **file path** and the **quoted
snippet**; use those to find the code. Every entry carries a `Fixed` note that
describes the current state.

---

## BUG-001 — `async-result/ap` and `promise-result/ap` reject when the applied function throws

**Severity:** high — the `Err` channel is bypassed entirely.

**Where**

- `src/async-result/ap.ts:44`
- `src/promise-result/ap.ts:33`

**Problem**

`ap` calls the wrapped function outside any `try`/`catch`:

```ts
const value = fnR.value(valR.value);   // async-result/ap.ts:44
return ok(value);
```

A throwing applied function therefore **rejects** the returned promise instead
of producing `Err(thrown)`. This breaks the Result contract for a plain
function call — the sync sibling `src/operators/ap.ts:47-50` catches and
returns `Err(thrown)`, and `async-result/map.ts` catches a throwing mapper.

**Reproduction**

```ts
import { ap, fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';

await ap(
    fromResult(ok(() => { throw new Error('boom'); })),
    fromResult(ok(21)),
).run();
// observed:  rejects with Error: boom
// expected: Ok/Err carrier — Err('boom')
```

**Note:** `docs/behavior-modes.md` lists `ap` under "Propagate directly" for the
async layers, so the *documented* policy matches the current behaviour. The
defect is the divergence from the sync `ap` and from the surrounding Result
contract: the same logical expression behaves differently depending on which
module it is imported from. Either the code must catch, or the sync `ap` must
be aligned with the async one — but the current split is not defensible.

**Fixed:** `async-result/ap` and `promise-result/ap` catch a throwing applied function and report it as `Err(thrown)`, matching the sync sibling `operators/ap`. The policy change is recorded in `docs/behavior-modes.md` and in the behaviour matrix.

---

## BUG-002 — `async-result/ap` runs its two carriers sequentially

**Severity:** medium — pure latency regression; `ap` has no short-circuit
requirement, so both carriers must run anyway.

**Where**

- `src/async-result/ap.ts:40-42`

**Problem**

```ts
const fnR = await fnResult.run();   // waits
const valR = await result.run();    // waits
```

The two carriers are awaited one after the other. The sibling
`src/promise-result/ap.ts:32` uses `Promise.all([fnResult, result])` and runs
them in parallel. `ap` never short-circuits — both sides are required when
both succeed — so the serialisation buys nothing.

**Reproduction**

```ts
const slow = (ms: number) => ({ run: async () => { await new Promise(r => setTimeout(r, ms)); return ok(ms); } });

const t = Date.now();
await ap(slow(100), slow(100)).run();
// observed:  ~215 ms
// expected:  ~100 ms (parallel, matching promise-result/ap)
```

**Fixed:** `async-result/ap` starts both carriers through `Promise.all`. The short-circuit now only selects the result - it no longer skips the value carrier - which matches the sibling `promise-result/ap` and the `combine` family.

---

## BUG-003 — `Promise.resolve(x).then(f)` silently adopts a thenable payload

**Severity:** medium — the error or success value delivered to the callback is
replaced by the thenable's resolved value.

**Where**

- `src/promise-result/asyncOrElse.ts:34`
- `src/promise-result/asyncBind.ts:66`
- `src/promise-result/asyncMatch.ts:35-36`

**Problem**

`Promise.resolve(r.error)` unwraps a thenable `r.error` before `f` ever sees
it, so the callback receives the thenable's *resolved* value instead of the
original payload. The same applies to `r.value` in `asyncBind` and
`asyncMatch`.

`asyncOrElse.ts:31-33` carries a comment claiming this exact bug was fixed:

```
// The old `Promise.resolve().then(() => f(r.error))` lost `r.error`
// through thenable adoption when the rejection was a thenable.
```

The fix went in the wrong direction — `Promise.resolve().then(() => f(r.error))`
is the shape that *preserves* the payload; `Promise.resolve(r.error).then(f)`
is the shape that adopts it.

**Reproduction**

```ts
const t = { then(res) { res('ADOPTED'); } };

await asyncOrElse(async (e) => { console.log(e); return ok(1); }, err(t));
// observed:  handler received 'ADOPTED'
// expected:  handler received the original thenable `t`

await asyncBind(async (v) => { console.log(v); return ok(1); }, ok(t));
// observed:  handler received 'ADOPTED'
```

**Correct shape:** `Promise.resolve().then(() => f(r.error))` — the payload is
read inside the callback, after the promise machinery has already settled.

**Fixed:** `asyncOrElse`, `asyncBind` and `asyncMatch` read the payload inside the `.then` callback, so a thenable payload reaches the callback unchanged instead of being adopted.

---

## BUG-004 — `async-result/from` and `async-option/from` do not guarantee a Promise from `run()`

**Severity:** high — every terminal of both modules crashes with a `TypeError`
when the thunk returns a plain (non-Promise) result.

**Where**

- `src/async-result/from.ts:21`
- `src/async-option/from.ts:21`

**Problem**

```ts
return markAsyncCarrier({ run: thunk });
```

The raw thunk is used as `run`, with no `async` wrapper. The
`AsyncResult`/`AsyncOption` contract is `run: () => Promise<...>`, but a
thunk that returns a plain result produces a non-Promise. Every terminal that
does `ar.run().then(...)` then crashes.

`src/async-result/README.md:17` explicitly documents `from` as *"Wraps a thunk
returning a Result (or a plain Result)"*, so the documented contract and the
implementation disagree.

**Reproduction**

```ts
import { from, isOk } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';

const c = from(() => ok(1));          // plain Result, as documented
await isOk(c);
// observed:  TypeError: ar.run(...).then is not a function
// expected: true
```

The sibling `fromPromise` in the same folder wraps its thunk in an `async`
function and does not have this problem.

**Fixed:** `async-result/from` and `async-option/from` await the thunk, so `run()` always returns a Promise even when the thunk returns a plain Result.

---

## BUG-005 — `async-result/from` and `async-option/from` let a synchronous throw escape `.run()`

**Severity:** high — the failure never reaches the Promise channel, so
`await`/`catch` around the *terminal* never observes it.

**Where**

- `src/async-result/from.ts:21`
- `src/async-option/from.ts:21`

**Problem**

Same root cause as BUG-004: because `run` is the bare thunk, a thunk that
throws before returning escapes as a raw synchronous exception from a
`Promise`-returning API.

**Reproduction**

```ts
const c = from(() => { throw new Error('sync-throw'); });
await isOk(c);
// observed:  the synchronous throw escapes `isOk` (which is declared
//            Promise<boolean>) — the caller never gets a rejected promise
```

**Expected:** the terminal returns a rejected promise, or the carrier converts
the throw to `Err` — matching `fromPromise`.

**Fixed:** the thunk now runs inside an `async` function, so a synchronous throw surfaces as a rejected promise instead of escaping `run()` as a raw exception.

---

## BUG-006 — `sequenceAsyncResult` loses the carrier's `this` receiver

**Severity:** medium — a method-shorthand `AsyncResult` crashes at runtime.

**Where**

- `src/primitives/sequenceAsyncResult.ts:26`

**Problem**

```ts
const runs = results.map((ar) => ar.run);   // detached method reference
```

The `run` reference is detached from its carrier, so a carrier implemented as
an object method loses `this`. Every other module in the library was
deliberately fixed for this — `src/reliability/race.ts:90`, `any.ts:44`,
`allSettled.ts:56`, `timeout.ts:49` and `retryLazy.ts:39` all use
`() => ar.run()` with an explicit comment *"detaching `ar.run` would drop
`this`"*. `sequenceAsyncResult` was missed.

`src/async-result/combine.ts:23` has the same shape (`results.map((ar) =>
ar.run())`) but is safe because the call site keeps the carrier as the
receiver.

**Reproduction**

```ts
const carrier = {
    value: 42,
    run() { return Promise.resolve(ok(this.value)); },
};

await sequenceAsyncResult([carrier]).run();
// observed:  TypeError: Cannot read properties of undefined (reading 'value')
// expected:  Ok([42])
```

**Fix:** `const runs = results.map((ar) => () => ar.run());`

**Fixed:** `sequenceAsyncResult` keeps the carrier as the receiver of `run()`, so a method-shorthand `AsyncResult` no longer loses `this`.

---

## BUG-007 — `observability/format` misplaces the closing parenthesis when the error message contains a newline

**Severity:** low — malformed output only.

**Where**

- `src/observability/format.ts:100-104`

**Problem**

```ts
const nl = body.indexOf('\n');
if (nl < 0) return tag + body + ')';
return tag + body.slice(0, nl) + ')' + body.slice(nl);
```

The heuristic assumes the first newline comes from a stack trace, so it can
close the parenthesis before it. `new Error('line1\nline2').message` also
contains a real newline, and the parenthesis lands in the middle of the
message.

**Reproduction**

```ts
format(err(new Error('line1\nline2')));
// observed:  "Err(Error: line1)\nline2)"
// expected:  "Err(Error: line1\nline2)"
```

`ok('a\nb')` is unaffected — `JSON.stringify` escapes the newline. Only
`Error.message` and `Error.stack` are affected.

**Fixed:** `format` closes the parenthesis at the end of the rendered value. Only a stack trace is moved to a line of its own, so a newline that belongs to the error message no longer splits the parenthesis.

---

## BUG-008 — `installObserver(null)` destroys every installed observer, not just the active one

**Severity:** medium — a previously installed observer is permanently lost and
its disposer silently becomes a no-op.

**Where**

- `src/observability/observe.ts:79-84`

**Problem**

```ts
if (handler === null) {
    stack.length = 0;          // clears the whole stack
    return () => { /* no-op */ };
}
```

The rest of `installObserver` implements LIFO *restoration* semantics: a
disposer removes only its own entry, so cancelling the top restores the
previous observer. `installObserver(null)` instead truncates the entire stack,
which breaks that invariant.

**Reproduction**

```ts
const cancelA = installObserver(a);
const cancelB = installObserver(b);
installObserver(null);
cancelB();
getActiveObserver() === a;   // observed: false — 'a' was destroyed
```

**Note:** the intent of `installObserver(null)` is ambiguous — the README says
"clears", which does not distinguish *the active observer* from *all
observers*. The asymmetry with the disposer path is the concrete defect.

**Fixed:** `installObserver(null)` removes the active observer (the top of the stack) only, so the observers below it survive - the same single-entry semantics the disposer path has.

---

## BUG-009 — `race` can hang forever when an inner carrier resolves with a non-Result

**Severity:** high — the returned promise never settles.

**Where**

- `src/reliability/race.ts:139-149`

**Problem**

The fulfillment handler dereferences `r.isSuccess` without guarding. When the
dereference throws *inside* a `.then` fulfillment callback, the rejection is
not routed to the `onRejected` argument of the same `.then` call, so the
promise created at `race.ts:100` never settles — the caller awaits forever —
and Node reports an unhandled rejection.

**Reproduction**

```ts
const p = race([{ run: async () => undefined }] as never).run();
// observed:  never settles; process reports an unhandled rejection
//           "Cannot read properties of undefined (reading 'isSuccess')"
```

**Fixed:** `race` recognises a carrier that resolves with a non-Result, records it in the rejection channel and settles with an `Err` instead of hanging.

---

## BUG-010 — `race`, `any`, `allSettled`, `retry` and `timeout` reject on a malformed carrier

**Severity:** medium — the `reliability` module's headline contract is that it
is *"the only async layer that never rejects"*
(`src/reliability/README.md:7`, `docs/behavior-modes.md:157`). These operators
break it.

**Where**

- `src/reliability/race.ts:139` — `carrier.then(...)` on a non-Promise return
  throws a `TypeError` inside the `new Promise` executor, which rejects.
- `src/reliability/any.ts:61,63` — same, plus the unguarded `r.isSuccess`.
- `src/reliability/allSettled.ts:72,74` — the unguarded `r.isSuccess`
  rejects, contradicting the documented *"always returns `Ok`"*.
- `src/reliability/retry.ts:253-254` — `safeInvoke` converts *throws* into
  `Err`, but a resolution with a non-Result escapes as a `TypeError` and
  rejects, contradicting the JSDoc at `retry.ts:146-147` (*"The returned
  promise therefore never rejects"*).
- `src/reliability/timeout.ts:74-79` — the fulfillment handler casts the inner
  value blindly, so a non-Result inner resolves with a value that is not a
  Result and the timeout error is never produced.

**Reproduction**

```ts
race([{ run: () => ({ isSuccess: true, isFailure: false, value: 1 }) }] as never).run();
// observed:  rejects — "carrier.then is not a function"

any([{ run: async () => undefined }] as never).run();
// observed:  rejects — "Cannot read properties of undefined (reading 'isSuccess')"

allSettled([{ run: async () => undefined }] as never).run();
// observed:  rejects (documented: always Ok)

await retry(async () => undefined as never, { times: 1 });
// observed:  rejects (documented: never rejects)

await timeout(50, { run: async () => undefined } as never).run();
// observed:  resolves with `undefined` (not a Result); the timeout Err is never produced
```

**Note:** the trigger is a carrier that violates the `AsyncResult` type. The
defect is that the library's most defensive module — the one that promises
never to reject — has the least defensive handling of its own inputs.

**Fixed:** `race`, `any`, `allSettled`, `retry` and `timeout` route a malformed carrier into their error channel; none of them rejects any more. A `retry` function that resolves with a non-Result is reported through the `TE` (throw) channel.

---

## BUG-011 — `retry` does not clamp a non-finite `delayMs`

**Severity:** low — the delay silently collapses to ~1 ms instead of the
requested interval.

**Where**

- `src/reliability/retry.ts:112-119` (`computeDelay`) and `retry.ts:101`
  (`setTimeout`)

**Problem**

```ts
return Math.max(0, raw);
```

The clamp guards the lower bound only. `Infinity` (or `NaN`) reaches
`setTimeout` unchanged; Node then emits a `TimeoutOverflowWarning` and clamps
the delay to **1 ms**. A caller that computes a backoff of `Infinity` — for
example `delayMs: n => 1000 * 2 ** n` overflowing at large `n` — gets an
immediate retry storm instead of the intended long delay.

**Reproduction**

```ts
const t = Date.now();
await retry(async () => err('x'), { times: 2, delayMs: () => Infinity });
// observed:  elapsed ~1 ms per attempt, plus a TimeoutOverflowWarning
```

**Fixed:** `retry` clamps a non-finite `delayMs` before it reaches the timer - an infinite delay becomes the maximum timer interval, `NaN` becomes zero.

---

## BUG-012 — `promise-option/tapErrAsyncOption` runs its "error track" callback on the success branch

**Severity:** medium — the callback fires on the wrong branch.

**Where**

- `src/promise-option/tapErrAsyncOption.ts:13-14`

**Problem**

```ts
if (inner.isSome) pending = fn(inner.value);
else if (noneFn) pending = noneFn();
```

For an `Option`, the failure track is `None`. The function is named
`tapErr*` and its summary line says *"Side-effect on the error track"*, yet
`fn` fires only on `Some` and `fnNone` only on `None`. The JSDoc example
(`fn` with `ofNone()`) never fires `fn` at all.

The behaviour matrix probe (`src/tests/hardening/behavior-matrix.ts`) only
exercises `fn` on `ofSome(1)`, so it does not disambiguate the two readings.

**Reproduction**

```ts
const calls: unknown[] = [];
await tapErrAsyncOption(v => calls.push(['fn', v]), Promise.resolve(ofSome(42)), () => calls.push(['fnNone']));
// observed:  [['fn', 42]]

await tapErrAsyncOption(v => calls.push(['fn', v]), Promise.resolve(ofNone()), () => calls.push(['fnNone']));
// observed:  [['fnNone']] — 'fn' (the "error" callback) never ran
```

**Partially fixed (documentation):** the misleading "error track" wording is gone - the JSDoc and the module README now state that `fn` observes the Some track and `fnNone` the None track (the failure track of an Option). The branch assignment itself was deliberately left unchanged: it keeps the `(value: T | undefined)` lie out of the API and is pinned by `tapErrAsyncOption.spec.ts` and `tapErrAsyncOption.type-spec.ts`, so swapping the branches would silently break every existing caller.

---

## BUG-013 — `async-option/exists` rejects on a throwing predicate while its eager sibling returns `false`

**Severity:** low — the same operator name behaves differently in the lazy and
eager Option layers.

**Where**

- `src/async-option/exists.ts:18`

**Problem**

```ts
return ao.run().then(async opt => opt.isSome && (await predicate(opt.value)));
```

There is no `try`/`catch`, so a throwing or rejecting predicate escapes as a
rejection. The eager sibling `src/promise-option/existsAsyncOption.ts:29-36`
catches and returns `false`.

**Reproduction**

```ts
await exists(() => { throw new Error('pred-throw'); }, fromOption(ofSome(1)));
// observed (async-option):    rejects with 'pred-throw'
// observed (promise-option):  false
```

`docs/behavior-modes.md:151` lists `exists` as propagating, so the lazy
behaviour is *documented* — the defect is the divergence from the eager layer
under the same name.

**Fixed:** `async-option/exists` collapses a throwing or rejecting predicate to `false`, matching the eager sibling `promise-option/existsAsyncOption` and the convention of the Option layer, where every callback captures its failure. The policy change is recorded in `docs/behavior-modes.md` and in the behaviour matrix.

---

## BUG-014 — `map` / `tap` / `tapErr` let a throwing `errorFn` escape, unlike their siblings

**Severity:** low — the library is internally inconsistent here.

**Where**

- `src/operators/map.ts` (both the curried and the direct branch)
- `src/operators/tap.ts`
- `src/operators/tapErr.ts`
- `src/operators/andTee.ts`, `src/operators/orTee.ts`,
  `src/operators/andThrough.ts`

**Problem**

`map`, `tap`, `tapErr`, `andTee`, `orTee` and `andThrough` call `errorFn`
directly inside their `catch` block, so a throwing `errorFn` propagates out of
the operator. Their siblings — `bimap`, `filterOrElse`, `orElse`, `andThrough`'s
sibling `bindThroughAsync`, `tryCatch`, `fromThrowable`, `fromPromise`,
`switchFn`, `lift`, `async-result/map`, `async-result/bind` — wrap the mapper
in a nested `try`/`catch` so that a buggy mapper cannot escape the Result
wrapper.

**Reproduction**

```ts
const boom = () => { throw new Error('mapper-bug'); };

map(() => { throw new Error('x'); }, ok(1), boom);
// observed:  throws 'mapper-bug'
// expected: Err('mapper-bug')  — as bimap does

bimap(() => { throw new Error('x'); }, e => e, ok(1), boom);
// observed:  Err(...) — the sibling already behaves correctly
```

**Note:** `docs/behavior-modes.md:71` documents this split explicitly
(*"a second throw from the `errorFn` of the `map` / `tap` family propagates"*),
so the current behaviour is intentional and pinned by the policy document. The
defect is the inconsistency with `bimap` / `filterOrElse` / `orElse`, which
collapse the second throw. Either family should converge.

**Fixed:** the `map` / `tap` / `tapErr` / `andTee` / `orTee` / `andThrough` family now collapses a throwing `errorFn` into the error channel, exactly like `bimap` / `orElse` / `filterOrElse`. A buggy mapper never escapes the Result wrapper any more.

---

## BUG-015 — `composeK` / `composeKAsync` JSDoc references a non-existent symbol and an external numbering scheme

**Severity:** low — documentation defect; violates the Comment Policy in
`AGENTS.md`.

**Where**

- `src/composition/composeK.ts:65`
- `src/composition/composeKAsync.ts:57`

**Problem**

Both files' JSDoc reads:

```
the same honesty trade-off documented in `retry.ts:toErrFailure` (Batch 5).
```

Two problems:

1. `toErrFailure` does not exist in `src/reliability/retry.ts` — the function
   there is called `toThrown`. The cross-reference points at a symbol that is
   not in the codebase.
2. `(Batch 5)` is an external identifier that only means something to someone
   with the original batch plan. `AGENTS.md`'s Comment Policy forbids exactly
   this: *"Identifiers like `BUG001`, `bugs.md-BUG001`, 'Bug 1 contract', 'Task
   L5', or any other token that is only meaningful if you have a specific
   external `.md` open are forbidden in `.ts` / `.spec.ts` comments."*

**Fixed:** the `composeK` / `composeKAsync` JSDoc no longer references the non-existent `retry.ts:toErrFailure` symbol or the external `(Batch 5)` numbering. Two more comments in the same class (`tapErrContext.type-spec.ts`, `promise-result/map.spec.ts`) were rewritten as well.

---

## BUG-016 — `combine/all` and `option/all` disagree on the empty-input type

**Severity:** low — type-level asymmetry only; runtime behaviour (`Ok([])`) is
correct in both.

**Where**

- `src/combine/all.ts:15-17,50-52`
- `src/option/all.ts:13`

**Problem**

`combine/all` relaxes its constraint to `readonly IResultOfT<unknown,
unknown>[]`, so `all([])` typechecks and its success value types as
`unknown[]`. `option/all` keeps the stricter
`readonly [IOption<unknown>, ...IOption<unknown>[]]` constraint and rejects
the empty tuple at the type level. `combine([])` (the sibling function in the
same module) types the empty case as `[]`.

The divergence is deliberate and pinned by
`src/combine/all.type-spec.ts`, so this is a note rather than a defect — but
the three combiners in the library (`combine`, `combine/all`, `option/all`)
now give three different types for "combine nothing".

**Noted:** the divergence is documented instead of changed. `option/all` now states that the three combiners of the library give three different static types for "combine nothing" (`combine([])` -> `IResultOfT<[], never>`, `combine/all([])` -> `IResultOfT<unknown[], unknown>`, `option/all([])` -> `IOption<unknown[]>`) while the runtime behaviour is the same everywhere.

---

## BUG-017 — `async-option/zipWith` propagates a *synchronous* throw from its callback

**Severity:** low — inconsistent with the module's capture-to-`None` policy.

**Where**

- `src/async-option/zipWith.ts:96-104`

**Problem**

The callback invocation sits inside an `async` `run()` with no `try`/`catch`:

```ts
value: (await (fn as any)(...values)) as R,
```

A synchronous throw from `fn` rejects the promise instead of collapsing to
`None`. The JSDoc only mentions *"Async rejections from the callback
propagate"* — the synchronous case is unstated. Every other `async-option`
callback (`map`, `filter`, `bind`, `mapAsync`, `mapOr`) captures a throw to
`None`.

**Reproduction**

```ts
await zipWith(() => { throw new Error('boom'); }, ofSome(1), ofSome(2)).run();
// observed:  rejects with 'boom'
// expected:  None — matching async-option/map
```

**Fixed:** a *synchronous* throw from the `async-option/zipWith` callback collapses to `None`; an async rejection from the callback still propagates. The policy change is recorded in `docs/behavior-modes.md` and in the behaviour matrix.

---

## BUG-018 — `promise-option/asyncMapOption` and `asyncTapOption` call `.then` on the raw callback return value

**Severity:** low — only reachable by violating the declared callback type.

**Where**

- `src/promise-option/asyncMapOption.ts:31-35`
- `src/promise-option/asyncTapOption.ts` (same shape)

**Problem**

```ts
let inner: Promise<B>;
try {
    inner = f(o.value);
} catch {
    return Promise.resolve(ofNone<B>());
}
return inner.then(v => ofSome(v));   // <- `.then` on the raw return value
```

The `try`/`catch` only guards the *call* to `f`. If `f` returns a non-Promise
(a synchronous mapper, or `undefined` from a callback with a forgotten
`return`), the `.then` call throws a `TypeError` **outside** the guarded
region, so it escapes synchronously from a function declared to return a
`Promise`.

**Reproduction**

```ts
await asyncMapOption((x) => x * 2, ofSome(21));   // sync mapper
// observed:  TypeError: a.then is not a function (thrown synchronously)
```

**Note:** the declared callback type is `(a: A) => Promise<B>`, so this is
outside the type contract. The defect is that the failure mode is a raw
synchronous `TypeError` rather than a rejected promise or a `None` — the
declared return type is a lie in that path.

**Fixed:** the `.then` call of `asyncMapOption` / `asyncTapOption` moved inside the existing guard, so a callback that violates the declared `Promise`-returning contract converts to `None` instead of throwing a raw synchronous `TypeError` from a function that promises a `Promise`.

---

## BUG-019 — `promise-option/asyncBindOption` and `asyncOrElseOption` return the callback's value un-wrapped

**Severity:** low — the declared `Promise<IOption<T>>` return type is a lie
when the callback returns a plain `IOption`.

**Where**

- `src/promise-option/asyncBindOption.ts:41` (`return inner;`)
- `src/promise-option/asyncOrElseOption.ts:44` (`return Promise.resolve(inner);`)

**Problem**

`asyncBindOption` returns the callback's raw value. The declared callback
type is `(value: T) => Promise<IOption<U>>`, so the value is expected to be a
Promise — but nothing enforces it at runtime. If a callback returns a plain
`IOption`, the caller receives an `IOption` where a `Promise` was promised, and
the caller's `.then()` chaining crashes with `TypeError: opt.then is not a
function`.

`asyncOrElseOption` is safer (`Promise.resolve(inner)` adapts both), but it
still declares `Promise<IOption<T>>` while the callback type permits the
narrower `IOption<T>`.

**Reproduction**

```ts
await asyncBindOption(async (x) => ofSome(x * 2), ofSome(21));
// observed:  Some(42)  — works only because the callback returns a Promise
// with a sync callback returning a plain IOption:
//   TypeError: opt.then is not a function
```

**Fixed:** `asyncBindOption` adapts the callback's return value with `Promise.resolve`, so the declared `Promise<IOption<U>>` return type always holds - a callback that returns a plain Option no longer hands the caller a non-Promise. The callback types of `asyncBindOption` and `asyncOrElseOption` now accept a plain Option as well.

---

## BUG-020 — `fromSafeTry` / `fromSafeTryAsync` never detect a double yield

**Severity:** medium — a documented error path is dead code, and a second
failure is silently discarded.

**Where**

- `src/composition/safeTry.ts:92-103`
- `src/composition/safeTryAsync.ts:102-115`

**Problem**

The failure path closes the generator *before* probing it for a second yield:

```ts
if (typeof iterator.return === 'function') { try { iterator.return(undefined!); } catch {} }
const check = iterator.next();          // always done -> the guard never fires
if (!check.done) throw new Error('safeTry: generator yielded more than once.');
```

`iterator.return()` completes a real generator, so the following `next()`
always reports `done: true`. The `throw` is reachable only for a hand-rolled
iterator with no `return` method — which is exactly what the spec file
fabricates.

The behaviour is nevertheless documented as real in two places:
`docs/behavior-modes.md` §4.3 (*"throws an `Error` when the generator succeeds
without returning a value or **yields twice**"*) and
`src/composition/README.md:38`.

A second consequence: a `finally` block that yields is silently dropped.

**Reproduction**

```ts
function* twice() { yield err('first'); yield err('second'); }

fromSafeTry(twice);
// observed:  { isSuccess: false, isFailure: true, error: 'first' }
// expected:  throws "safeTry: generator yielded more than once."
```

Async twin: `fromSafeTryAsync(twiceAsync)` likewise returns `Err('first')`
instead of throwing.

**Fixed:** `fromSafeTry` / `fromSafeTryAsync` probe a raw yield for a second yield before reporting the failure, so a real generator that yields twice now throws. A failure that came from `yield* safeTry(...)` still short-circuits without resuming the generator body.

---

## BUG-021 — the documented `ok(undefined)` workaround produces a doubly wrapped Result

**Severity:** medium — there is no way to express `Ok(undefined)`.

**Where**

- `src/composition/safeTry.ts:73-79` (the error message) and `safeTry.ts:81`
  (`return ok(first.value)`)
- `src/composition/safeTryAsync.ts:89-95` and `safeTryAsync.ts:101`

**Problem**

The success path unconditionally wraps the generator's return value in `ok()`:

```ts
return ok(first.value);
```

The thrown error message tells the user to fix the "returned undefined" case
with ``return ok(undefined);`` — but that produces `Ok(Ok(undefined))`, whose
`.value` is a *Result*, not `undefined`. The advice in the error message is
itself broken.

**Reproduction**

```ts
const nested = fromSafeTry(function* () { return ok(undefined); });

nested;
// observed:  { isSuccess: true, isFailure: false, value: { isSuccess: true, isFailure: false } }
//             — value is a Result, so `nested.value` is Ok(undefined), not undefined
```

Async twin behaves identically.

**Fixed:** a generator that returns a Result is used as-is, so the documented `return ok(undefined)` workaround produces `Ok(undefined)` instead of a doubly wrapped Result. The overloads of `fromSafeTry` / `fromSafeTryAsync` reflect the unwrapped type.

---

## BUG-022 — seven `option` exports silently ignore the direct form's second argument

**Severity:** medium — a silent wrong result for JavaScript consumers, and a
compile error for TypeScript consumers.

**Where**

- `src/option/map.ts:16`
- `src/option/bind.ts:15`
- `src/option/filter.ts:16`
- `src/option/tap.ts:19`
- `src/option/okOr.ts:19`
- `src/option/okOrElse.ts:37`
- `src/option/contains.ts:15`

**Problem**

`src/option/README.md:60` claims:

> Data-last and curried: `map(fn)(option)`; **every operator also accepts the
> direct form `map(fn, option)`**.

Only `match`, `unwrapOr`, `orElse`, `zipWith`, `traverseArray` and `traverse`
actually implement a direct form. The seven listed above take a single
parameter, so `map(fn, opt)` returns the *curried function* and drops `opt`
entirely — a silent wrong result.

This is also inconsistent with the Result side, where `src/operators/map.ts`
does support `map(f, r)`.

**Reproduction**

```ts
import * as O from '@sandlada/result/option';

typeof O.map(x => x * 2, O.ofSome(21));   // observed: 'function'  (expected: an Option)
typeof O.okOr('e', O.ofSome(21));          // observed: 'function'
```

Same for `bind`, `filter`, `tap`, `okOrElse` and `contains`.

**Fixed:** `map`, `bind`, `filter`, `tap`, `okOr`, `okOrElse` and `contains` now accept the direct form (`map(fn, option)`) next to the curried one, so the module README's claim holds for every operator. The direct form previously returned the curried function and dropped the option.

---

## BUG-023 — `option/okOrElse` stores a non-`Error` throw value but types it as `Error`

**Severity:** low — a type lie; `instanceof Error` is `false` on the value.

**Where**

- `src/option/okOrElse.ts:44-51`

**Problem**

```ts
const innerError = e instanceof Error
    ? e
    : (e as unknown as Error);
```

A non-`Error` thrown value is stored verbatim but cast to `Error`. The result
is typed `IResultOfT<T, E | Error>`, so `result.error` claims to be an `Error`
while `instanceof Error` is `false` at runtime. The JSDoc only acknowledges
the opposite direction (an `Error` instance passing through).

**Reproduction**

```ts
const r = okOrElse(() => { throw 'plain-string'; })(ofNone());

r.error;               // observed: 'plain-string' (a string)
r.error instanceof Error;  // observed: false — but the type says Error
```

**Fixed:** a thrown value that is not an `Error` instance is wrapped in one (the original value stays available through `cause`), so the declared `IResultOfT<T, E | Error>` error channel holds for every value the caller can receive.

---

## BUG-024 — `option/bind` widens the value type to `unknown` in the canonical example

**Severity:** low — the module's own JSDoc example loses its value type.

**Where**

- `src/option/bind.ts:15` (the `ofNone()` default in the callback)

**Problem**

`ofNone()` defaults its type parameter to `unknown`, so the canonical `bind`
shape —

```ts
pipe(ofSome(21), bind(n => n > 0 ? ofSome(n * 2) : ofNone()))
```

— types as `IOption<unknown>` rather than `IOption<number>`. Verified with
`tsc`: `Equals<IOption<number>>` is `false`, `Equals<IOption<unknown>>` is
`true`.

The `unknown` default is deliberate and documented in `ofNone`'s JSDoc, so the
defect is that the `bind` example in `src/option/bind.ts:8-13` — the shape most
users copy — silently loses the value type.

**Note:** the same widening affects the `Option` module generally, but it is
invisible on the Result side (`operators/bind` keeps `A`).

**Fixed:** the canonical `bind` example annotates the `None` branch (`ofNone<number>()`), so the pipeline keeps `IOption<number>` instead of widening to `IOption<unknown>`. A type-level regression test pins the shape.

---

## BUG-025 — `option/all([])` typechecks, contradicting the module README and the behavior matrix

**Severity:** low — documentation defect; runtime behaviour (`Some([])`) is
correct.

**Where**

- `src/option/all.ts:13` (the array overload)
- `src/option/README.md:58`
- `docs/behavior-modes.md` §3 (line 45) and §4.5 (line 119)

**Problem**

The README states *"`all` requires a non-empty tuple at the type level; unlike
`combine/all`, `all([])` does not typecheck"*, and the behavior document
repeats it (*"an empty tuple is rejected at the type level"*). Both are false:
the array overload `all<T>(options: readonly IOption<T>[])` accepts an empty
array.

Verified with `tsc --noEmit --strict`: `const e = all([])` produces **no
error** and types as `IOption<unknown[]>`.

**Reproduction**

```ts
all([]);   // observed: Some([]) — typechecks; documented as a type error
```

**Fixed:** the documentation now matches the implementation - the tuple overload of `option/all` requires at least one element, but the array overload accepts an empty array, so `all([])` typechecks and returns `Some([])`.
---

## BUG-026 - concurrent `fromSafeTryAsync` runs cross their delegation bookkeeping

**Severity:** medium - a failed pipeline resumes its generator body, so the
side effects after the failure still run.

**Where**

- `src/composition/safeTryAsync.ts` (the module-level `activeRun` flag)
- `src/composition/safeTry.ts` (the same flag in the sync sibling)

**Problem**

The runner has to know whether the value it received came from a
`yield* safeTry(...)` delegation or from a raw `yield`: only a raw yield may be
probed for a second yield, because resuming a delegation would run the
generator body past the failure.

The bookkeeping was a module-level "currently running generator" flag. That
flag cannot express "which run" - two `fromSafeTryAsync` runs can be in
flight at the same time, so the flag attributes one run's delegation to the
other. The run that lost the flag then treats its own delegation as a raw
yield, resumes its generator, and runs the body after the failure. The
`finally` block that restores the flag also clobbers the pointer of the run
that is still in flight, so that run's later delegations are not recognised
either.

**Reproduction**

```ts
let sideEffect = 'NOT-RUN';
const runA = fromSafeTryAsync(async function* () {
    await new Promise((r) => setTimeout(r, 20));
    yield* safeTryAsync(err('A-failure'));
    sideEffect = 'RAN';          // must never run
    return 1;
}).run();
const runB = fromSafeTryAsync(async function* () {
    await new Promise((r) => setTimeout(r, 200));
    return 2;
}).run();
await runA;
// observed:  sideEffect === 'RAN'
// expected:  sideEffect === 'NOT-RUN'
```

**Fixed:** the attribution is per *value* instead of per run. A `safeTry`
delegation marks the Result object it yields, and the runner consumes that
mark when it receives the value - so a delegation is recognised no matter how
many runs are in flight, and no module-level mutable state is involved. The
sync sibling uses the same mechanism, which removes its flag as well.
---

## BUG-027 - `promise-option/asyncMatchOption` adopts a thenable payload

**Severity:** low - the handler receives a different value than the one the
Option carries.

**Where**

- `src/promise-option/asyncMatchOption.ts:33`

**Problem**

```ts
return o.isSome
    ? Promise.resolve(o.value).then(handlers.some)
```

`Promise.resolve` adopts a thenable, so a payload that carries a `then`
method is unwrapped and the handler receives the thenable's *resolved* value
instead of the payload. This is the same defect shape as the Result-side
entry, where `asyncOrElse` / `asyncBind` / `asyncMatch` were corrected. The
Option sibling was missed by that pass.

The comment above the code also claimed the opposite shape
(`Promise.resolve().then(() => ...)`), so the comment did not describe the
implementation either.

**Reproduction**

```ts
const thenable = { then: (res) => res(99) };
await asyncMatchOption({ some: (x) => { seen = x; return 'some'; }, none: () => 'none' }, ofSome(thenable));
// observed:  seen === 99
// expected:  seen === thenable
```

**Fixed:** the payload is read inside the callback, exactly like the
Result-side `promise-result/asyncMatch`.

---

## BUG-028 - `async-option/okOrElse` types its error channel as `E` but stores any thrown value

**Severity:** low - a type lie; `instanceof Error` is `false` on the value.

**Where**

- `src/async-option/okOrElse.ts` (`err(e as E)`)

**Problem**

The `catch` block stores the caught value verbatim while the declared type is
`AsyncResult<T, E>`. A thrown value can be any `unknown`, so the declared
error type does not hold for every value the caller can receive. The sync
sibling `option/okOrElse` had exactly this defect and was corrected to
`E | Error` with the caught value wrapped in an `Error`; the async sibling was
missed by that pass.

**Fixed:** the return type is widened to `AsyncResult<T, E | Error>` and a
caught value that is not an `Error` instance is wrapped in one (the original
value stays available through `cause`).

---

## BUG-029 - `option/okOrElse` points at a non-existent `okOrElseAsync`

**Severity:** low - documentation defect.

**Where**

- `src/option/okOrElse.ts:39`

**Problem**

The JSDoc told the reader that an async error function needs
"`okOrElseAsync` from `@sandlada/result/promise-result`" - no such export
exists in that module.

**Fixed:** the reference is replaced by the plain constraint (the thunk is
synchronous; bridge the async work yourself).
---

## BUG-030 - three source comments point at symbols or states that do not exist

**Severity:** low - documentation defects.

**Where**

- `src/types/asyncCarrier.ts` (the `unwrapAsyncCarrier` reference)
- `src/option/zipWith.ts` (the `zipWith3` / `zipWith4` reference)
- `src/async-result/map.ts` and `src/observability/ctx.spec.ts` (the
  "pre-fix" / "pre-merge" references)

**Problem**

The `isAsyncCarrier` JSDoc told the reader to "Use `unwrapAsyncCarrier`" -
no such function exists anywhere in the library. The `option/zipWith`
comment referred to "the pre-merge `zipWith` / `zipWith3` / `zipWith4`" -
neither `zipWith3` nor `zipWith4` exists, and the reference points at a
repository state rather than at the code next to it.

Two more comments described a "pre-fix" / "pre-merge" implementation instead
of the code they sit next to, which is exactly the kind of non-self-contained
prose the comment policy forbids: the reader has to know the history to
understand the intent.

**Fixed:** all four comments now state the invariant directly and name only
symbols that exist.
---

## BUG-031 - five operators document an error-type widening their signature does not have

**Severity:** low - documentation defect; the type system contradicts the
prose.

**Where**

- `src/operators/map.ts`
- `src/operators/andThrough.ts`
- `src/operators/bimap.ts`
- `src/operators/orElse.ts`
- `src/operators/filterOrElse.ts`

**Problem**

The JSDoc of these operators claimed that a captured throw widens the error
type - "the error type widened to `E | Error`", "widening the error type to
`E | F | Error`". Their signatures return `IResultOfT<B, E>`,
`IResultOfT<A, E | F>`, `IResultOfT<C, F>`, `IResultOfT<A | B, F>` and
`IResultOfT<A, E>` respectively: no `Error` arm exists in any of them.

The sibling `operators/tap` already stated the real contract - "Without
`errorFn` the thrown value is cast to the input result's `E`" - and the rest
of the library (`composeK`, `tryCatch`, `retry`) documents the same rule: the
thrown value is captured verbatim and the declared error type is a structural
claim until an `errorFn` maps the throw onto it.

**Fixed:** all five now state that contract. The signatures are unchanged -
they already matched the library-wide convention.
---

## BUG-032 - the module summary table still lists `async-result`'s `ap` as propagating

**Severity:** low - documentation defect; the per-module table says the
opposite.

**Where**

- `docs/behavior-modes.md` (the module summary table, the `async-result` row)

**Problem**

The summary row read "Everything except the propagating `mapAsync` /
`mapOrElse` / `match` / `exists` / `unwrapOrElse` / `ap` captures to values".
`ap` captures a throwing applied function as `Err` since the capture policy
was aligned with the sync sibling - the per-module table states that
correctly, the summary row was left behind.

**Fixed:** the summary row no longer lists `ap` as propagating and states
what `ap` does: the applied function's throw is captured as `Err`, a
rejection of either carrier still propagates.
