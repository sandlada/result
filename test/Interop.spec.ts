import { describe, it, expect } from 'vitest';
import type { IResultOfT } from '../src/types/IResultOfT.js';
import {
    ok,
    err,
    map,
    mapErr,
    bind,
    orElse,
    match,
    tap,
    tapErr,
    unwrapOr,
    composeK,
    pipe,
    combine,
    tryCatch,
    asyncOk,
    asyncErr,
    tryCatchAsync,
    mapAsync,
    mapErrAsync,
    bindAsync,
    orElseAsync,
    matchAsync,
    tapAsync,
    tapErrAsync,
    pipeAsync,
} from '../src/index.js';

// ── Sync FP deep interop ─────────────────────────────────────────────

describe('sync FP interop', () => {
    it('full FP pipe with ok entry', () => {
        const result = pipe(
            ok<number>(10),
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

    it('combine accepts ok() elements', () => {
        const results: IResultOfT<number, Error>[] = [
            ok<number>(1),
            ok(2),
            ok<number>(3),
        ];

        const combined = combine(results);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) expect(combined.value).toEqual([1, 2, 3]);
    });

    it('custom convenience factory works with FP map/bind', () => {
        type AppError = { kind: 'Fail'; msg: string };

        const AppResult = {
            Success: <T>(value: T) => ok(value) as unknown as IResultOfT<T, AppError>,
            Failure: <T>(error: AppError) => err<T, AppError>(error),
        };

        const r = AppResult.Success(10);
        const mapped = map((x: number) => x * 2, r);

        expect(mapped.isSuccess).toBe(true);
        if (mapped.isSuccess) expect(mapped.value).toBe(20);

        const f = AppResult.Failure<number>({ kind: 'Fail', msg: 'bad' });
        const bound = bind((x: number) => ok(x + 1), f);

        expect(bound.isSuccess).toBe(false);
        if (!bound.isSuccess) expect(bound.error).toEqual({ kind: 'Fail', msg: 'bad' });
    });

    it('composeK chains FP functions', () => {
        const f1 = (a: number): IResultOfT<number, Error> =>
            ok(a * 2) as IResultOfT<number, Error>;
        const f2 = (b: number): IResultOfT<number, Error> =>
            ok(b + 1);

        const composed = composeK(f1, f2);
        const result = composed(10);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(21);
    });

    it('unwrapOr works identically in both styles', () => {
        const fpOk = unwrapOr(0, ok(42));
        expect(fpOk).toBe(42);

        const fpFail = unwrapOr(99, err<number, string>('bad'));
        expect(fpFail).toBe(99);
    });
});

// ── Async FP deep interop ─────────────────────────────────────────────

describe('async FP interop', () => {
    it('tryCatchAsync → FP mapAsync → bindAsync → matchAsync', async () => {
        const ar = tryCatchAsync(async () => 21);

        const result = await pipeAsync(
            ar,
            mapAsync((x: number) => x * 2),
            bindAsync((x: number) => asyncOk(x + 1)),
            matchAsync(
                (v: number) => `OK: ${v}`,
                (e: unknown) => `ERR: ${String(e)}`,
            ),
        );

        expect(result).toBe('OK: 43');
    });

    it('FP pipeAsync with asyncOk entry', async () => {
        const result = await pipeAsync(
            asyncOk(10),
            mapAsync((x: number) => x * 2),
        );

        const awaited = await result;
        expect(awaited.isSuccess).toBe(true);
        if (awaited.isSuccess) expect(awaited.value).toBe(20);
    });

    it('Promise.resolve bridges sync → async FP chain', async () => {
        const syncResult = ok(21);
        const ar = Promise.resolve(syncResult);

        const result = await pipeAsync(
            ar,
            mapAsync((x: number) => x * 2),
        );

        const awaited = await result;
        expect(awaited.isSuccess).toBe(true);
        if (awaited.isSuccess) expect(awaited.value).toBe(42);
    });

    it('pipeAsync with all-FP-async and sync callback transparency', async () => {
        const result = await pipeAsync(
            asyncOk(10),
            mapAsync((x: number) => x * 2),
            bindAsync((x: number) => asyncOk(x + 1)),
            matchAsync(
                (v: number) => v,
                (_e: unknown) => -1,
            ),
        );

        expect(result).toBe(21);
    });
});

// ── Sync / Async cross-boundary ──────────────────────────────────────

describe('sync ↔ async cross-boundary', () => {
    it('sync tryCatch → async pipeline', async () => {
        const sync = tryCatch(() => 21);
        const ar = Promise.resolve(sync);

        const result = await bindAsync(
            (x: number) => asyncOk(x * 2),
            ar,
        );
        const awaited = await result;

        expect(awaited.isSuccess).toBe(true);
        if (awaited.isSuccess) expect(awaited.value).toBe(42);
    });

    it('async result awaited → sync operators', async () => {
        const ar = mapAsync((x: number) => x * 2, asyncOk(10));
        const syncResult = await ar;

        const processed = pipe(
            syncResult,
            map((x: number) => x + 1),
            bind((x: number) => ok(x * 2) as IResultOfT<number, Error>),
        );

        expect(processed.isSuccess).toBe(true);
        if (processed.isSuccess) expect(processed.value).toBe(42);
    });

    it('combine accepts mixed sync-origin results as promises', async () => {
        const syncResults: Promise<IResultOfT<number, string>>[] = [
            Promise.resolve(ok(1) as IResultOfT<number, string>),
            asyncOk(2),
            Promise.resolve(ok(3) as IResultOfT<number, string>),
        ];

        const resolved = await Promise.all(syncResults);
        const combined = combine(resolved);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) expect(combined.value).toEqual([1, 2, 3]);
    });

    it('combine behaves consistently on empty arrays', async () => {
        const syncCombined = combine([]);
        const asyncCombined = await combine([]);

        expect(syncCombined.isSuccess).toBe(true);
        expect(asyncCombined.isSuccess).toBe(true);
        if (syncCombined.isSuccess) expect(syncCombined.value).toEqual([]);
        if (asyncCombined.isSuccess) expect(asyncCombined.value).toEqual([]);
    });

    it('sync FP pipe enters async pipeline, then awaits', async () => {
        const syncResult = pipe(
            ok(10),
            map((x: number) => x * 2),
        );

        const result = await mapAsync(
            (x: number) => x + 1,
            Promise.resolve(syncResult),
        );

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(21);
    });
});

// ── Edge conditions ────────────────────────────────────────────────────

describe('edge conditions', () => {
    it('ok(undefined) vs ok() in FP pipe', () => {
        const voidResult = ok();

        expect(voidResult.isSuccess).toBe(true);
        const piped = pipe(
            voidResult as unknown as IResultOfT<unknown, Error>,
            match(
                () => 'void',
                (_e) => 'error',
            ),
        );

        expect(piped).toBe('void');
    });

    it('empty array combine is always success', () => {
        const fp = combine([]);
        expect(fp.isSuccess).toBe(true);
    });

    it('TError = never result passes through any FP operator', () => {
        const r = ok(42);

        const mapped = map((x: number) => x * 2, r);
        expect(mapped.isSuccess).toBe(true);
        if (mapped.isSuccess) expect(mapped.value).toBe(84);

        const bound = bind((x: number) => ok(x + 1), mapped);
        expect(bound.isSuccess).toBe(true);
        if (bound.isSuccess) expect(bound.value).toBe(85);
    });

    it('bind callback with different error type widens correctly', () => {
        type E1 = { kind: 'A' };
        type E2 = { kind: 'B' };

        const r = err<number, E1>({ kind: 'A' });

        const mapped = bind(
            (_v: number): IResultOfT<number, E2> => err<number, E2>({ kind: 'B' }),
            r,
        );

        expect(mapped.isSuccess).toBe(false);
        if (!mapped.isSuccess) expect(mapped.error).toEqual({ kind: 'A' });
    });
});

