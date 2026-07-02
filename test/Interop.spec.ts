import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResultOfT } from '../src/IResultOfT.js';
import {
    ok,
    err,
    map,
    bind,
    orElse,
    match,
    composeK,
    pipe,
    combine,
    unwrapOr as fpUnwrapOr,
} from '../src/fp/index.js';
import { AsyncResult } from '../src/promise/AsyncResult.js';
import {
    asyncOk,
    asyncErr,
    map as fpAsyncMap,
    bind as fpAsyncBind,
    match as fpAsyncMatch,
} from '../src/fp/promise/index.js';
import { pipeAsync } from '../src/fp/promise/composition.js';

// ── Sync OOP ↔ FP deep interop ────────────────────────────────────────

describe('sync OOP ↔ FP deep interop', () => {
    it('full FP pipe with OOP entry (Result.Success)', () => {
        const result = pipe(
            Result.Success<number>(10),
            map((x: number) => x * 2),
            bind((x: number) => ok(x + 1)),
            orElse((_e: Error) => ok<number>(0)),
            match(
                (v: number) => `OK: ${v}`,
                (_e: unknown) => 'FAIL',
            ),
        );

        expect(result).toBe('OK: 21');
    });

    it('Result.combine accepts mixed ok() and Result.Success() elements', () => {
        // Direct use of Result.combine with mixed origins
        const results: IResultOfT<number, Error>[] = [
            ok<number>(1),
            Result.Success(2),
            ok<number>(3),
        ];

        const combined = Result.combine(results);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) expect(combined.value).toEqual([1, 2, 3]);
    });

    it('FP-entry / OOP-chain: ok(value).andThen(v => Result.Success(...)).map(...)', () => {
        // ok() returns IResultOfT — it supports OOP .andThen/.map
        const result = ok<number>(21)
            .andThen(v => Result.Success(v * 2) as IResultOfT<number, Error>)
            .map(x => x + 1);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(43);
    });

    it('custom convenience factory works with FP map/bind', () => {
        type AppError = { kind: 'Fail'; msg: string };

        // Simulating the AGENTS.md TrdResult pattern
        const AppResult = {
            Success: <T>(value: T) => Result.Success(value) as unknown as IResultOfT<T, AppError>,
            Failure: <T>(error: AppError) => Result.Failure<T, AppError>(error),
        };

        const r = AppResult.Success(10);
        const mapped = map((x: number) => x * 2, r);

        expect(mapped.isSuccess).toBe(true);
        if (mapped.isSuccess) expect(mapped.value).toBe(20);

        // Failure path
        const f = AppResult.Failure<number>({ kind: 'Fail', msg: 'bad' });
        const bound = bind((x: number) => ok(x + 1), f);

        expect(bound.isSuccess).toBe(false);
        if (!bound.isSuccess) expect(bound.error).toEqual({ kind: 'Fail', msg: 'bad' });
    });

    it('composeK with first fn as OOP andThen, second as FP bind', () => {
        const f1 = (a: number): IResultOfT<number, Error> =>
            Result.Success(a * 2) as IResultOfT<number, Error>;
        const f2 = (b: number): IResultOfT<number, Error> =>
            ok(b + 1);

        const composed = composeK(f1, f2);
        const result = composed(10);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(21);
    });

    it('ResultOfT.unwrapOr and fp/unwrapOr behave identically', () => {
        const oopOk = Result.Success(42).unwrapOr(0);
        const fpOk = fpUnwrapOr(0, ok(42));

        expect(oopOk).toBe(fpOk);

        const oopFail = Result.Failure<number, string>('bad').unwrapOr(99);
        const fpFail = fpUnwrapOr(99, err('bad'));

        expect(oopFail).toBe(fpFail);
    });
});

// ── Async OOP ↔ FP deep interop ───────────────────────────────────────

describe('async OOP ↔ FP deep interop', () => {
    it('AsyncResult.tryCatch → FP async map → bind → match', async () => {
        const ar = AsyncResult.tryCatch(async () => 21);

        const result = await pipeAsync(
            ar,
            fpAsyncMap((x: number) => x * 2),
            fpAsyncBind((x: number) => asyncOk(x + 1)),
            fpAsyncMatch(
                (v: number) => `OK: ${v}`,
                (e: unknown) => `ERR: ${String(e)}`,
            ),
        );

        expect(result).toBe('OK: 43');
    });

    it('FP async pipeAsync mixed with AsyncResult instance methods', async () => {
        const result = await pipeAsync(
            asyncOk(10),
            fpAsyncMap((x: number) => x * 2),
        );

        // Pipe result is an AsyncResult — we can await it directly (thenable)
        const awaited = await result;
        expect(awaited.isSuccess).toBe(true);
        if (awaited.isSuccess) expect(awaited.value).toBe(20);
    });

    it('AsyncResult.from() bridges sync OOP → async FP chain', async () => {
        const syncResult = Result.Success(21);
        const ar = AsyncResult.from(syncResult);

        const result = await pipeAsync(
            ar,
            fpAsyncMap((x: number) => x * 2),
        );

        const awaited = await result;
        expect(awaited.isSuccess).toBe(true);
        if (awaited.isSuccess) expect(awaited.value).toBe(42);
    });

    it('AsyncResult.toPromise() → sync FP map', async () => {
        const ar = AsyncResult.success(21).map(x => x * 2);
        const promise = ar.toPromise();

        const syncResult = await promise;
        const mapped = map((x: number) => x + 1, syncResult);

        expect(mapped.isSuccess).toBe(true);
        if (mapped.isSuccess) expect(mapped.value).toBe(43);
    });

    it('pipeAsync with all-FP-async and sync callback transparency', async () => {
        const result = await pipeAsync(
            asyncOk(10),
            fpAsyncMap((x: number) => x * 2),      // sync callback in async context
            fpAsyncBind((x: number) => asyncOk(x + 1)),
            fpAsyncMatch(
                (v: number) => v,
                (_e: unknown) => -1,
            ),
        );

        expect(result).toBe(21);
    });
});

// ── Sync / Async cross-boundary interop ────────────────────────────────

describe('sync ↔ async cross-boundary', () => {
    it('sync Result.tryCatch → AsyncResult.from → async chain', async () => {
        const sync = Result.tryCatch(() => 21);
        const ar = AsyncResult.from(sync);

        const result = await ar.map(x => x * 2);
        const awaited = await result;

        expect(awaited.isSuccess).toBe(true);
        if (awaited.isSuccess) expect(awaited.value).toBe(42);
    });

    it('async result awaited → sync .map().andThen()', async () => {
        const ar = AsyncResult.success(10).map(x => x * 2);
        const syncResult = await ar.toPromise();

        const processed = syncResult
            .map(x => x + 1)
            .andThen(x => Result.Success(x * 2) as IResultOfT<number, Error>);

        expect(processed.isSuccess).toBe(true);
        if (processed.isSuccess) expect(processed.value).toBe(42);
    });

    it('AsyncResult.combine accepts mixed sync-origin results', async () => {
        const syncResults = [
            AsyncResult.from(Result.Success(1) as IResultOfT<number, Error>),
            AsyncResult.success(2),
            AsyncResult.from(Result.Success(3) as IResultOfT<number, Error>),
        ];

        const combined = AsyncResult.combine(syncResults);
        const awaited = await combined;

        expect(awaited.isSuccess).toBe(true);
        if (awaited.isSuccess) expect(awaited.value).toEqual([1, 2, 3]);
    });

    it('Result.combine and AsyncResult.combine behave consistently on empty arrays', async () => {
        const syncCombined = Result.combine([]);
        const asyncCombined = await AsyncResult.combine([]);

        expect(syncCombined.isSuccess).toBe(true);
        expect(asyncCombined.isSuccess).toBe(true);
        if (syncCombined.isSuccess) expect(syncCombined.value).toEqual([]);
        if (asyncCombined.isSuccess) expect(asyncCombined.value).toEqual([]);
    });

    it('sync FP pipe ending with AsyncResult.from enters async pipeline', async () => {
        const syncResult = pipe(
            ok(10),
            map((x: number) => x * 2),
        );

        const ar = AsyncResult.from(syncResult);
        const result = await ar.map(x => x + 1);
        const awaited = await result;

        expect(awaited.isSuccess).toBe(true);
        if (awaited.isSuccess) expect(awaited.value).toBe(21);
    });
});

// ── Edge conditions ────────────────────────────────────────────────────

describe('edge conditions across paradigms', () => {
    it('Result.Success(undefined) vs Result.Success() in FP pipe', () => {
        // Result.Success() with no arg — void success
        const voidResult = Result.Success();

        expect(voidResult.isSuccess).toBe(true);
        // Can still enter FP pipe
        const piped = pipe(
            voidResult as unknown as IResultOfT<unknown, Error>,
            match(
                () => 'void',
                (_e) => 'error',
            ),
        );

        expect(piped).toBe('void');
    });

    it('empty array combine is consistent between Result and FP', () => {
        const oop = Result.combine([]);
        const fp = combine([]);

        expect(oop.isSuccess).toBe(fp.isSuccess);
        if (oop.isSuccess && fp.isSuccess) {
            expect(oop.value).toEqual(fp.value);
        }
    });

    it('TError = never result passes through any FP operator', () => {
        // ok() returns IResultOfT<T, never>
        const r = ok(42);

        const mapped = map((x: number) => x * 2, r);
        expect(mapped.isSuccess).toBe(true);
        if (mapped.isSuccess) expect(mapped.value).toBe(84);

        const bound = bind((x: number) => ok(x + 1), mapped);
        expect(bound.isSuccess).toBe(true);
        if (bound.isSuccess) expect(bound.value).toBe(85);
    });

    it('andThen callback with different error type widens correctly', () => {
        type E1 = { kind: 'A' };
        type E2 = { kind: 'B' };

        // Start with E1, andThen to E2 → result has E1 | E2
        const r = Result.Failure<number, E1>({ kind: 'A' }).andThen(
            (_v: number): IResultOfT<number, E2> =>
                Result.Failure<number, E2>({ kind: 'B' }),
        );

        // Should be failure with E1 (short-circuited)
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toEqual({ kind: 'A' });
    });
});
