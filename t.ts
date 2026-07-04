/**
 * @fileoverview Comprehensive sample demonstrating every API function in @sandlada/result.
 * Uses simulated API requests (with delays) to showcase real-world usage patterns.
 *
 * Run with: npx tsgo
 */

// ─────────────────────────────────────────────────────────────────────────────
// Imports — main barrel (@sandlada/result)
// ─────────────────────────────────────────────────────────────────────────────
import {
    // — Core constructors —
    ok, err,
    fromPredicate, fromThrowable, tryCatch, tryCatchAsync,
    fromPromise as fromPromiseEager,
    asyncOk, asyncErr,

    // — Sync operators —
    map, mapErr, bind, orElse,
    match, tap, tapErr,
    unwrapOr, unwrapOrElse, unwrap, expect,
    unwrapErr, expectErr,
    flatten, and, or,
    contains, exists,
    bimap, swap,
    mapOr, mapOrElse, filterOrElse,

    // — Collection operators —
    ap, separate, traverseArray,

    // — Async operators (Promise<IResultOfT>) —
    mapAsync, mapErrAsync,
    mapOrAsync, mapOrElseAsync,
    bindAsync, orElseAsync,
    matchAsync, tapAsync, tapErrAsync,
    unwrapOrAsync, unwrapOrElseAsync,

    // — Composition —
    composeK, pipe, composeKAsync, pipeAsync,

    // — Adapters —
    switchFn, liftMap, tee,
    toOption, fromOption,
    switchFnAsync, teeAsync,

    // — Combine —
    combine as combineResults, all, combineWithAllErrors,

    // — AsyncResult (renamed as exported from main barrel) —
    from as asyncResultFrom,
    asyncResultFromPromise,
    fromResult as asyncResultFromResult,
    asyncResultMap, asyncResultMapAsync, asyncResultMapErr,
    asyncResultAndThen, asyncResultOrElse,
    asyncResultMatch, asyncResultTap, asyncResultTapErr,
    asyncResultUnwrapOr,
    asyncResultCombine,

    // — Option (from main barrel) —
    ofSome, ofNone,
    mapOption, andThen as optionAndThen,
    orElseOption, matchOption, tapOption, unwrapOrOption,
    filterOption, flattenOption, containsOption,
    allOption, zipWithOption,
} from './build/index.js';

import type {
    IResultOfT, IResultSuccess, IResultFailure,
    IOption, IOptionSome, IOptionNone,
    AsyncResult,
} from './build/types/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions — representing our domain
// ─────────────────────────────────────────────────────────────────────────────

type AppError =
    | { kind: 'NetworkError'; message: string }
    | { kind: 'NotFound'; id: string }
    | { kind: 'Validation'; field: string; detail: string };

interface User {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly age: number;
}

interface Post {
    readonly id: string;
    readonly userId: string;
    readonly title: string;
    readonly body: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — simulated API (delays + random failure)
// ─────────────────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
}

/** A small in-memory "database" */
const DB: { users: Record<string, User>; posts: Record<string, Post[]> } = {
    users: {
        'u1': { id: 'u1', name: 'Alice', email: 'alice@example.com', age: 30 },
        'u2': { id: 'u2', name: 'Bob', email: 'bob@example.com', age: 25 },
    },
    posts: {
        'u1': [
            { id: 'p1', userId: 'u1', title: 'Hello World', body: 'First post!' },
            { id: 'p2', userId: 'u1', title: 'ROP in TypeScript', body: 'Railway oriented programming\u2026' },
        ],
        'u2': [
            { id: 'p3', userId: 'u2', title: 'My Journey', body: 'Learning FP\u2026' },
        ],
    },
};

function maybeFail(probability = 0.1): void {
    if (Math.random() < probability) throw new Error('Simulated network error');
}

/** Simulated: fetch user from "API" */
async function apiFetchUser(id: string): Promise<User> {
    await delay(300 + Math.random() * 200); // 300-500ms
    maybeFail(0.15); // 15% chance of network failure
    const user = DB.users[id];
    if (!user) throw new Error(`User ${id} not found`);
    return user;
}

/** Simulated: fetch posts for a user */
async function apiFetchPosts(userId: string): Promise<Post[]> {
    await delay(200 + Math.random() * 300); // 200-500ms
    maybeFail(0.1); // 10% chance of network failure
    return DB.posts[userId] ?? [];
}

/** Simulated: save a post */
async function apiSavePost(post: Omit<Post, 'id'>): Promise<Post> {
    await delay(150 + Math.random() * 150);
    maybeFail(0.05);
    const id = `p${Date.now()}`;
    const saved = { ...post, id };
    (DB.posts[post.userId] ??= []).push(saved);
    return saved;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main demo
// ─────────────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
    console.log('\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
    console.log('  @sandlada/result \u2014 Comprehensive API Demo');
    console.log('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n');

    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    // SECTION 1 \u2014 Core Constructors
    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    console.log('\u2500\u2500\u2500 Section 1: Core Constructors \u2500\u2500\u2500');

    // ok / err \u2014 basic constructors
    const s1 = ok(42) as IResultOfT<number, string>;
    const e1 = err<string>('something went wrong');
    console.log('  ok(42):', s1);
    console.log('  err("wrong"):', e1);

    // Void result
    const voidSuccess: IResultSuccess = ok() as IResultSuccess;
    console.log('  ok() (void):', voidSuccess);

    // fromPredicate \u2014 condition \u2192 Result
    const isPositive = (n: number) => n > 0;
    const fpOk = fromPredicate(isPositive, 'must be positive', 5);
    const fpErr = fromPredicate(isPositive, 'must be positive', -1);
    console.log('  fromPredicate ok:', fpOk);
    console.log('  fromPredicate err:', fpErr);

    // fromThrowable \u2014 wrap throwing function
    const safeParse = fromThrowable(JSON.parse);
    const parsed1 = safeParse('{"a":1}');
    const parsed2 = safeParse('not json');
    console.log('  fromThrowable ok:', (parsed1 as IResultOfT<unknown, unknown>).isSuccess);
    console.log('  fromThrowable fail:', parsed2.isFailure);

    // fromThrowable with error mapping
    const safeParseMapped = fromThrowable(
        JSON.parse,
        (e: unknown) => ({ kind: 'Validation' as const, field: 'json', detail: String(e) }),
    );
    console.log('  fromThrowable mapped:', (safeParseMapped('bad') as IResultOfT<unknown, AppError>).isFailure);

    // tryCatch \u2014 wrap sync function that throws
    const tryOk = tryCatch(() => JSON.parse('{"b":2}'));
    const tryFail = tryCatch(() => JSON.parse('bad'));
    console.log('  tryCatch ok:', tryOk.isSuccess);
    console.log('  tryCatch fail:', tryFail.isFailure);

    // tryCatchAsync \u2014 wrap async function that throws
    const tryAsyncOk = await tryCatchAsync(async () => {
        await delay(10); return 'ok';
    });
    const tryAsyncFail = await tryCatchAsync(async () => {
        await delay(10); throw new Error('async fail');
    });
    console.log('  tryCatchAsync ok:', tryAsyncOk.isSuccess);
    console.log('  tryCatchAsync fail:', tryAsyncFail.isFailure);


    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    // SECTION 2 \u2014 Sync Operators
    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    console.log('\n\u2500\u2500\u2500 Section 2: Sync Operators \u2500\u2500\u2500');

    const r42 = ok(42) as IResultOfT<number, string>;

    // map \u2014 transform value
    const doubled = map((x: number) => x * 2, r42);
    console.log('  map (x2):', match(v => `Ok(${v})`, e => `Err(${e})`, doubled));

    // mapErr \u2014 transform error
    const rErr = err<string>('original error');
    const mappedErr = mapErr((e: string) => `[wrapped] ${e}`, rErr);
    console.log('  mapErr:', match(v => `Ok(${v})`, e => e, mappedErr));

    // bind \u2014 monadic chain
    const chainedOk = bind(
        (x: number) => x > 10 ? ok(x * 10) as IResultOfT<number, string> : err('too small'),
        ok(5) as IResultOfT<number, string>,
    );
    const chainedOk2 = bind(
        (x: number) => x > 10 ? ok(x * 10) as IResultOfT<number, string> : err('too small'),
        ok(15) as IResultOfT<number, string>,
    );
    console.log('  bind (chain 5 \u2192 fail):', match(v => `Ok(${v})`, e => e, chainedOk));
    console.log('  bind (chain 15 \u2192 150):', match(v => `Ok(${v})`, e => e, chainedOk2));

    // orElse \u2014 error recovery
    const recovered = orElse(
        (e: string) => e === 'not found' ? ok('default') : err(e),
        err<string>('not found'),
    );
    console.log('  orElse recovered:', unwrapOr('nope', recovered));

    // match \u2014 pattern matching
    const desc = match(
        (v: number) => `Value is ${v}`,
        (e: string) => `Error: ${e}`,
        r42,
    );
    console.log('  match:', desc);

    // tap / tapErr \u2014 side effects
    let sideEffect = '';
    tap((v: number) => { sideEffect = `got ${v}`; }, r42);
    console.log('  tap side effect:', sideEffect);

    tapErr((e: string) => { sideEffect = `err ${e}`; }, rErr);
    console.log('  tapErr side effect:', sideEffect);

    // Extraction operators
    console.log('  unwrapOr:', unwrapOr(0, r42));            // 42
    console.log('  unwrapOrElse:', unwrapOrElse((e: string) => e.length, r42)); // 42
    try { console.log('  expect:', expect('should work', r42)); } catch (e) { console.log('  expect threw:', e); } // 42
    const errVal = err<string>('oops');
    try { unwrap(errVal); } catch { console.log('  unwrap panicked \u2713'); }

    // unwrapErr / expectErr
    console.log('  unwrapErr:', unwrapErr(err('oops')));     // "oops"
    try { expectErr('should be err', r42); } catch { console.log('  expectErr panicked \u2713'); }

    // contains / exists \u2014 predicates on success
    console.log('  contains(42):', contains(42, r42));        // true
    console.log('  contains(99):', contains(99, r42));        // false
    console.log('  exists(x > 40):', exists((x: number) => x > 40, r42)); // true
    console.log('  exists(x > 99):', exists((x: number) => x > 99, r42)); // false

    // bimap \u2014 simultaneous map over both tracks
    const bimapped = bimap(
        (v: number) => v * 3,
        (e: string) => `ERR: ${e}`,
        r42,
    );
    console.log('  bimap:', unwrapOr(0, bimapped)); // 126

    // swap \u2014 swap Ok/Err variants
    const swappedOk = swap(err<string>('was error'));
    console.log('  swap err\u2192ok:', (swappedOk as IResultOfT<void, string>).isSuccess);
    const swappedErr = swap(r42);
    console.log('  swap ok\u2192err:', swappedErr.isFailure);

    // mapOr / mapOrElse \u2014 map with default
    console.log('  mapOr:', mapOr(-1, (v: number) => v * 2, r42)); // 84
    console.log('  mapOrElse:', mapOrElse((e: string) => -1, (v: number) => v * 2, ok(21) as IResultOfT<number, string>)); // 42
    console.log('  mapOrElse (fail):', mapOrElse((e: string) => -1, (v: number) => v * 2, err('nope'))); // -1

    // flatten \u2014 flatten nested Result
    const nested = ok(ok(100) as IResultOfT<number, string>) as unknown as IResultOfT<IResultOfT<number, string>, string>;
    const flat = flatten(nested);
    console.log('  flatten:', unwrapOr(0, flat)); // 100

    // and / or \u2014 logical combinators
    const rA = ok(1) as IResultOfT<number, string>;
    const rB = ok(2) as IResultOfT<number, string>;
    const rE = err<string>('err');
    console.log('  and:', unwrapOr(0, and(rB, rA)));            // 2 (second)
    console.log('  and (fail):', and(rE, rA).isFailure);        // true
    console.log('  or:', unwrapOr(0, or(rB, rA)));              // 1 (first)
    console.log('  or (fail):', unwrapOr(0, or(rB, rE)));       // 2 (second wins)

    // filterOrElse \u2014 filter success or map to error
    const filteredOk = filterOrElse((x: number) => x > 10, (x: number) => `${x} too small`, ok(20));
    const filteredErr = filterOrElse((x: number) => x > 10, (x: number) => `${x} too small`, ok(5));
    console.log('  filterOrElse ok:', unwrapOr(0, filteredOk));
    console.log('  filterOrElse fail:', match(v => String(v), e => e, filteredErr));


    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    // SECTION 3 \u2014 Collection Operators
    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    console.log('\n\u2500\u2500\u2500 Section 3: Collection Operators \u2500\u2500\u2500');

    // ap \u2014 apply wrapped function to wrapped value
    const fnResult = ok((x: number) => x * 10) as IResultOfT<(x: number) => number, string>;
    const apResult = ap(fnResult, ok(7) as IResultOfT<number, string>);
    console.log('  ap:', unwrapOr(0, apResult)); // 70

    // separate \u2014 partition successes and failures
    const mixed = [
        ok(1) as IResultOfT<number, string>,
        err<string>('a'),
        ok(2) as IResultOfT<number, string>,
        err<string>('b'),
    ];
    const parts = separate(mixed);
    console.log('  separate ok:', parts.ok);   // [1, 2]
    console.log('  separate err:', parts.err); // ['a', 'b']

    // traverseArray \u2014 map fn over array, short-circuit on first failure
    const allOk = traverseArray(
        (x: number) => x > 0 ? ok(x * 2) as IResultOfT<number, string> : err('neg'),
        [1, 2, 3],
    );
    const shortCircuit = traverseArray(
        (x: number) => x > 0 ? ok(x * 2) as IResultOfT<number, string> : err('neg'),
        [1, -1, 3],
    );
    console.log('  traverseArray allOk:', unwrapOr([], allOk));  // [2, 4, 6]
    console.log('  traverseArray fail:', shortCircuit.isFailure); // true

    // combine (sync) \u2014 merge array of Results
    const combinedArr = combineResults([
        ok(10) as IResultOfT<number, AppError>,
        ok(20) as IResultOfT<number, AppError>,
    ]);
    console.log('  combine:', unwrapOr([], combinedArr)); // [10, 20]

    // all \u2014 heterogeneous tuple combine
    const allMixed = all([ok(1) as IResultOfT<number, string>, ok('hi') as IResultOfT<string, string>]);
    console.log('  all:', match(v => JSON.stringify(v), e => e, allMixed)); // [1, "hi"]

    // combineWithAllErrors \u2014 collect ALL errors
    const withErrors = combineWithAllErrors([
        ok(1) as IResultOfT<number, string>,
        err<string>('errA'),
        ok(2) as IResultOfT<number, string>,
        err<string>('errB'),
    ]);
    console.log('  combineWithAllErrors:', match(
        v => `Ok(${v})`,
        e => `Err(${JSON.stringify(e)})`,
        withErrors,
    )); // Err(["errA","errB"])


    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    // SECTION 4 \u2014 Composition & Adapters
    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    console.log('\n\u2500\u2500\u2500 Section 4: Composition & Adapters \u2500\u2500\u2500');

    // pipe \u2014 left-to-right function composition
    const pipeResult = pipe(
        ok(5) as IResultOfT<number, string>,
        map((x: number) => x * 2),
        bind((x: number) => x > 5 ? ok(x) as IResultOfT<number, string> : err('too small')),
        match((v: number) => `Ok(${v})`, (e: string) => `Err(${e})`),
    );
    console.log('  pipe:', pipeResult); // Ok(10)

    // composeK \u2014 Kleisli composition (Result-returning functions)
    const validate = composeK(
        (x: number) => x > 0 ? ok(x) as IResultOfT<number, string> : err('not positive'),
        (x: number) => x < 100 ? ok(x) as IResultOfT<number, string> : err('too large'),
    );
    console.log('  composeK ok:', unwrapOr(0, validate(50)));   // 50
    console.log('  composeK fail:', validate(-1).isFailure);     // true

    // tee \u2014 dead-end side effect on plain value
    const teeResult = tee((x: number) => console.log('  tee side effect:', x))(42);
    console.log('  tee returned:', teeResult); // 42

    // switchFn \u2014 lift plain function to Result
    const safeDouble = switchFn((x: number) => x * 2);
    console.log('  switchFn:', unwrapOr(0, safeDouble(21))); // 42

    // liftMap \u2014 alias for map (teaching aid)
    const lifted = liftMap((x: number) => x * 3);
    console.log('  liftMap:', unwrapOr(0, lifted(ok(10) as IResultOfT<number, never>))); // 30

    // toOption / fromOption \u2014 Option interop
    const optSome = toOption(r42);
    const optNone = toOption(err('nope'));
    console.log('  toOption Some:', optSome.isSome);
    console.log('  toOption None:', optNone.isNone);

    const backToResult = fromOption('should not happen', optSome);
    console.log('  fromOption Some:', unwrapOr(0, backToResult)); // 42

    const fromNone = fromOption('was none', optNone);
    console.log('  fromOption None:', fromNone.isFailure); // true


    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    // SECTION 5 \u2014 Async Operators (Promise<IResultOfT> style)
    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    console.log('\n\u2500\u2500\u2500 Section 5: Async Operators (Promise<IResultOfT>) \u2500\u2500\u2500');

    // asyncOk / asyncErr \u2014 construct async results
    const aOk = asyncOk(42);
    const aErr = asyncErr('nope');
    console.log('  asyncOk:', (await aOk).isSuccess);
    console.log('  asyncErr:', (await aErr).isFailure);

    // fromPromise \u2014 eager wrap Promise<T> \u2192 Promise<IResultOfT>
    const apiResult = await fromPromiseEager(
        fetch('https://jsonplaceholder.typicode.com/todos/1').then(r => r.json()),
        (e: unknown) => ({ kind: 'NetworkError' as const, message: String(e) }),
    );
    console.log('  fromPromise:', match(
        (v: unknown) => `Ok(${JSON.stringify(v).slice(0, 40)}\u2026)`,
        (e: AppError) => `Err(${e.kind})`,
        apiResult,
    ));

    // mapAsync \u2014 async transform of success value
    const mappedAsync = await mapAsync(
        async (x: number) => { await delay(10); return x * 2; },
        asyncOk(21),
    );
    console.log('  mapAsync:', unwrapOr(0, mappedAsync)); // 42

    // mapErrAsync \u2014 async transform of error
    const mappedErrAsync = await mapErrAsync(
        async (e: string) => { await delay(10); return `[async] ${e}`; },
        asyncErr('original'),
    );
    console.log('  mapErrAsync:', match(
        (v) => String(v),
        (e: string) => e,
        mappedErrAsync,
    )); // "[async] original"

    // bindAsync \u2014 async monadic chain
    const chainedAsync = await bindAsync(
        async (x: number) => { await delay(10); return x > 50 ? asyncOk(x) : asyncErr('too small'); },
        asyncOk(100),
    );
    console.log('  bindAsync:', unwrapOr(0, chainedAsync)); // 100

    // orElseAsync \u2014 async error recovery
    const recoveredAsync = await orElseAsync(
        async (e: string) => { await delay(10); return asyncOk(`recovered from ${e}`); },
        asyncErr('fail'),
    );
    console.log('  orElseAsync:', unwrapOr('nope', recoveredAsync));

    // matchAsync \u2014 async pattern matching
    const matchedAsync = await matchAsync(
        async (v: number) => { await delay(10); return `success: ${v}`; },
        async (e: string) => { await delay(10); return `error: ${e}`; },
        asyncOk(7),
    );
    console.log('  matchAsync:', matchedAsync); // "success: 7"

    // tapAsync / tapErrAsync \u2014 async side effects
    let asyncSideEffect = '';
    await tapAsync(async (v: number) => { await delay(10); asyncSideEffect = `got ${v}`; }, asyncOk(99));
    console.log('  tapAsync:', asyncSideEffect); // "got 99"

    await tapErrAsync(async (e: string) => { await delay(10); asyncSideEffect = `err ${e}`; }, asyncErr('fail'));
    console.log('  tapErrAsync:', asyncSideEffect); // "err fail"

    // unwrapOrAsync / unwrapOrElseAsync \u2014 async extraction
    console.log('  unwrapOrAsync:', await unwrapOrAsync(0, asyncOk(42))); // 42
    console.log('  unwrapOrElseAsync:', await unwrapOrElseAsync(
        async (e: string) => e.length,
        asyncErr<string>('fail'),
    )); // 0

    // mapOrAsync / mapOrElseAsync
    console.log('  mapOrAsync:', await mapOrAsync(-1, async (v: number) => v * 2, asyncOk(21))); // 42
    console.log('  mapOrElseAsync:', await mapOrElseAsync(
        async (e: string) => -1,
        async (v: number) => v * 2,
        asyncOk(21),
    )); // 42

    // pipeAsync \u2014 async pipeline
    const pipeResultAsync = await pipeAsync(
        asyncOk(7),
        mapAsync((x: number) => x * 2),
        bindAsync(async (x: number) => x > 10 ? asyncOk(x) : asyncErr('too small')),
        matchAsync(
            async (v: number) => `OK: ${v}`,
            async (e: string) => `Error: ${e}`,
        ),
    );
    console.log('  pipeAsync:', pipeResultAsync); // "OK: 14"

    // composeKAsync \u2014 async Kleisli composition
    const validateAsync = composeKAsync(
        async (x: number) => { await delay(10); return x > 0 ? asyncOk(x) : asyncErr('not positive'); },
        async (x: number) => { await delay(10); return x < 100 ? asyncOk(x) : asyncErr('too large'); },
    );
    console.log('  composeKAsync ok:', unwrapOr(0, await validateAsync(50))); // 50
    console.log('  composeKAsync fail:', (await validateAsync(-1)).isFailure); // true

    // switchFnAsync \u2014 lift async function to Result
    const safeAsyncFetch = switchFnAsync(async (url: string) => {
        await delay(10);
        return `data from ${url}`;
    });
    const fetchResult = await safeAsyncFetch('/api/data');
    console.log('  switchFnAsync:', unwrapOr('nope', fetchResult));

    // teeAsync \u2014 async side effect on plain value
    const teeAsyncResult = await teeAsync(async (x: number) => {
        await delay(10);
        console.log('  teeAsync side effect:', x);
    })(42);
    console.log('  teeAsync returned:', teeAsyncResult); // 42


    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    // SECTION 6 \u2014 AsyncResult (Lazy Thunk)
    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    console.log('\n\u2500\u2500\u2500 Section 6: AsyncResult (Lazy Thunk) \u2500\u2500\u2500');

    // from \u2014 wrap a thunk returning Promise<IResultOfT>
    const arFrom = asyncResultFrom(() => Promise.resolve(ok(42) as IResultOfT<number, string>));
    console.log('  asyncResult.from:', unwrapOr(0, await arFrom.run())); // 42

    // asyncResultFromPromise \u2014 wrap lazy Promise<T>
    const arFetch = asyncResultFromPromise(
        () => apiFetchUser('u1'),
        (e: unknown) => ({ kind: 'NetworkError' as const, message: String(e) }),
    );

    // asyncResultMap \u2014 sync map over success
    const arMapped = asyncResultMap((u: User) => u.name, arFetch);
    console.log('  asyncResultMap:', unwrapOr('?', await arMapped.run())); // "Alice"

    // asyncResultMapAsync \u2014 async map
    const arMappedAsync = asyncResultMapAsync(
        async (name: string) => { await delay(10); return name.toUpperCase(); },
        arMapped,
    );
    console.log('  asyncResultMapAsync:', unwrapOr('?', await arMappedAsync.run())); // "ALICE"

    // asyncResultMapErr \u2014 transform error
    const arMapErrRes = asyncResultMapErr(
        (e: AppError) => `[${e.kind}] ${'message' in e ? (e as { message: string }).message : ''}`,
        arFetch,
    );
    await arMapErrRes.run(); // just running to show no error for valid user

    // asyncResultAndThen \u2014 monadic chain on AsyncResult
    const arChained = asyncResultAndThen(
        (user: User) => asyncResultFromPromise(
            () => apiFetchPosts(user.id),
            (e: unknown) => ({ kind: 'NetworkError' as const, message: String(e) }),
        ),
        arFetch,
    );
    console.log('  asyncResultAndThen:', match(
        (posts: Post[]) => `Ok(${posts.length} posts)`,
        (e: AppError) => `Err(${e.kind})`,
        await arChained.run(),
    )); // "Ok(2 posts)"

    // asyncResultOrElse \u2014 recovery on AsyncResult
    const arRecovered = asyncResultOrElse(
        () => asyncResultFromResult(ok<User>({ id: 'guest', name: 'Guest', email: '', age: 0 })),
        arFetch,
    );
    await arRecovered.run();

    // asyncResultTap / asyncResultTapErr \u2014 side effects
    let tapLog = '';
    const arTapped = asyncResultTap(
        (u: User) => { tapLog = `tapped: ${u.name}`; },
        arFetch,
    );
    await arTapped.run();
    console.log('  asyncResultTap:', tapLog);

    // asyncResultMatch \u2014 terminal pattern match
    const arMatchResult = await asyncResultMatch<number, AppError, string>(
        { ok: (v: number) => `value: ${v}`, err: (e: AppError) => `error: ${e.kind}` },
        asyncResultFromResult(ok(42) as IResultOfT<number, AppError>),
    );
    console.log('  asyncResultMatch:', arMatchResult); // "value: 42"

    // asyncResultUnwrapOr \u2014 terminal extraction
    const arUnwrapped = await asyncResultUnwrapOr<string, AppError>(
        'default',
        asyncResultFromResult(ok('hi') as IResultOfT<string, AppError>),
    );
    console.log('  asyncResultUnwrapOr:', arUnwrapped); // "hi"

    // asyncResultCombine \u2014 combine array of AsyncResults
    const ar1 = asyncResultFromResult(ok(10) as IResultOfT<number, AppError>);
    const ar2 = asyncResultFromResult(ok(20) as IResultOfT<number, AppError>);
    const arCombined = asyncResultCombine([ar1, ar2]);
    console.log('  asyncResultCombine:', unwrapOr([], await arCombined.run())); // [10, 20]


    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    // SECTION 7 \u2014 Option
    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    console.log('\n\u2500\u2500\u2500 Section 7: Option \u2500\u2500\u2500');

    // ofSome / ofNone \u2014 constructors
    const some = ofSome(42);
    const none = ofNone();
    console.log('  ofSome:', some.isSome);
    console.log('  ofNone:', none.isNone);

    // mapOption \u2014 transform Some value
    const mappedOpt = mapOption((x: number) => x * 2)(some);
    console.log('  mapOption:', matchOption(v => `Some(${v})`, () => 'None')(mappedOpt));

    // optionAndThen \u2014 monadic chain
    const chainedOpt = optionAndThen(
        (x: number) => x > 50 ? ofSome(x) : ofNone(),
    )(ofSome(100));
    console.log('  optionAndThen Some:', unwrapOrOption(0)(chainedOpt)); // 100

    const chainedOptNone = optionAndThen(
        (x: number) => x > 50 ? ofSome(x) : ofNone(),
    )(ofSome(10));
    console.log('  optionAndThen None:', chainedOptNone.isNone); // true

    // orElseOption \u2014 provide fallback Option
    const orElseOpt = orElseOption(() => ofSome(99))(none);
    console.log('  orElseOption:', unwrapOrOption(0)(orElseOpt)); // 99

    // matchOption \u2014 pattern match
    const matchOpt = matchOption(
        (v: number) => `Some(${v})`,
        () => 'None',
    )(some);
    console.log('  matchOption:', matchOpt); // "Some(42)"

    // tapOption \u2014 side effect
    let tapOptLog = '';
    tapOption((v: number) => { tapOptLog = `opt ${v}`; })(some);
    console.log('  tapOption:', tapOptLog);

    // unwrapOrOption — extract with default
    console.log('  unwrapOrOption:', unwrapOrOption(0)(none)); // 0

    // filterOption \u2014 conditional Some
    const filteredSome = filterOption((x: number) => x > 10)(some);
    const filteredNone = filterOption((x: number) => x > 100)(some);
    console.log('  filterOption Some:', filteredSome.isSome); // true
    console.log('  filterOption None:', filteredNone.isNone); // true

    // flattenOption \u2014 flatten nested Option
    const nestedOpt = ofSome(ofSome(7) as IOptionSome<number>);
    const flatOpt = flattenOption(nestedOpt);
    console.log('  flattenOption:', unwrapOrOption(0)(flatOpt)); // 7

    // containsOption \u2014 check value
    console.log('  containsOption:', containsOption(42)(some)); // true
    console.log('  containsOption:', containsOption(99)(some)); // false

    // allOption \u2014 combine tuple of Options
    const allOptResult = allOption([ofSome(1), ofSome('hi'), ofSome(true)]);
    console.log('  allOption:', matchOption(
        (v: [number, string, boolean]) => JSON.stringify(v),
        () => 'None',
    )(allOptResult)); // [1,"hi",true]

    // zipWithOption \u2014 combine two Options with function
    const zipped = zipWithOption(
        (a: number, b: string) => `${a}-${b}`,
    )(ofSome(42), ofSome('hello'));
    console.log('  zipWithOption:', unwrapOrOption('nope')(zipped)); // "42-hello"


    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    // SECTION 8 \u2014 Real-World Scenario: fetch user \u2192 fetch posts
    // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    console.log('\n\u2500\u2500\u2500 Section 8: Real-World Scenario \u2500\u2500\u2500');

    // Approach A: AsyncResult pipeline (lazy, composable)
    const pipeline = pipe(
        asyncResultFromPromise(
            () => apiFetchUser('u1'),
            (e: unknown) => ({ kind: 'NetworkError' as const, message: String(e) }),
        ),
        asyncResultTap((user: User) => console.log('  [A] Fetched user:', user.name)),
        asyncResultAndThen((user: User) =>
            asyncResultFromPromise(
                () => apiFetchPosts(user.id),
                (e: unknown) => ({ kind: 'NetworkError' as const, message: String(e) }),
            ),
        ),
        asyncResultMap((posts: Post[]) => posts.map(p => p.title)),
    );
    const titles = await asyncResultMatch(
        { ok: (t: string[]) => `Posts: ${t.join(', ')}`, err: (e: AppError) => `Failed: ${e.kind}` },
        pipeline,
    );
    console.log('  [A] Pipeline result:', titles);

    // Approach B: Eager async (Promise<IResultOfT>) style
    const userResult = await fromPromiseEager(
        apiFetchUser('u2'),
        (e: unknown) => ({ kind: 'NetworkError' as const, message: String(e) } as AppError),
    );
    if (userResult.isSuccess) {
        const postsResult = await bindAsync(
            async (user: User) => {
                const posts = await fromPromiseEager(
                    apiFetchPosts(user.id),
                    (e: unknown) => ({ kind: 'NetworkError' as const, message: String(e) } as AppError),
                );
                return posts;
            },
            Promise.resolve(userResult) as Promise<IResultOfT<User, AppError>>,
        );
        console.log('  [B] User u2 posts count:', match(
            (posts: Post[]) => posts.length,
            (e: AppError) => 0,
            postsResult,
        ));
    }

    // Approach C: FromThrowable + validation
    const rawJson = '{"userId":"u1","title":"New Post","body":"Content"}';
    const validatedPost = pipe(
        tryCatch(
            () => JSON.parse(rawJson),
            (e: unknown) => ({ kind: 'Validation' as const, field: 'json', detail: String(e) }) as AppError,
        ),
        bind((data: Record<string, unknown>) => {
            if (typeof data.title !== 'string' || data.title.length === 0) {
                return err<AppError>({ kind: 'Validation', field: 'title', detail: 'title required' });
            }
            return ok(data as unknown as Omit<Post, 'id'>);
        }),
        bind((post: Omit<Post, 'id'>) => {
            if (typeof post.userId !== 'string') {
                return err<AppError>({ kind: 'Validation', field: 'userId', detail: 'userId required' });
            }
            return ok(post);
        }),
        match<Omit<Post, 'id'>, AppError, string>(
            (post) => `Valid post: "${post.title}"`,
            (e) => `Invalid: ${e.kind} \u2014 ${'detail' in e ? (e as { detail: string }).detail : ''}`,
        ),
    );
    console.log('  [C] Validated:', validatedPost);

    console.log('\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
    console.log('  Demo complete!');
    console.log('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n');
}

main().catch(console.error);


