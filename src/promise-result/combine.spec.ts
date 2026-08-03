import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { combine } from './combine.js';

describe('promise-result combine', () => {
    it('combines all Ok into an array', async () => {
        const r = await combine([Promise.resolve(ok(1)), Promise.resolve(ok(2)), Promise.resolve(ok(3))]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 2, 3]);
    });

    it('short-circuits on first Err', async () => {
        const r = await combine([Promise.resolve(ok(1)), Promise.resolve(err<string>('fail')), Promise.resolve(ok(3))]);
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('fail');
    });

    it('returns Ok([]) for empty input', async () => {
        const r = await combine([]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('combines a mixed Ok/Err input — first Err wins', async () => {
        // Mixed cases: even when later items would succeed, the first Err
        // encountered in iteration order is the result. This is the
        // `Promise.all` short-circuit semantics reflected into IResultOfT.
        const r = await combine([
            Promise.resolve(ok(1)),
            Promise.resolve(err<{ code: number }>({ code: 7 })),
            Promise.resolve(ok(3)),
            Promise.resolve(err<{ code: number }>({ code: 8 })),
        ]);
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toEqual({ code: 7 });
    });

    it('handles heterogeneous E types via explicit type argument', async () => {
        // Without `combine<number, string>` the inner type is `never`, since
        // `asyncOk<number>(1)` yields `Promise<IResultOfT<number, never>>` and
        // `asyncErr<number>(7)` yields `Promise<IResultOfT<never, number>>`;
        // the union `never | number` collapses to `number`.
        const r = await combine<number, number>([
            Promise.resolve(ok(1)),
            Promise.resolve(err<number>(7)),
            Promise.resolve(ok(3)),
        ]);
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe(7);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        // combine calls `Promise.all(results)` immediately, attaching
        // aggregation synchronously.
        const pending = [new Promise<ReturnType<typeof ok<number>>>(() => { /* never */ })];
        const result = combine(pending);
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates an outer Promise rejection from any input as a rejection', async () => {
        // An *input* Promise rejection is not an Err — `Promise.all`
        // rejects immediately with that reason, and combine does not catch.
        await expect(combine([
            Promise.resolve(ok(1)),
            Promise.reject(new Error('outer-reject')),
        ])).rejects.toThrow('outer-reject');
    });

    it('returns empty array for empty input — preserves element type', async () => {
        // The empty case must yield `Ok([])`, not `Ok(undefined)` or `Ok(null)`.
        const r = await combine([]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(Array.isArray(r.value)).toBe(true);
    });
});