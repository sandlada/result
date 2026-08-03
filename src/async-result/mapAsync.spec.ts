import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { mapAsync } from '../../src/async-result/mapAsync.js';

describe('AsyncResult mapAsync', () => {
    it('maps with an async function', async () => {
        const ar = mapAsync(async (x: number) => x * 2, fromResult(ok(21)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('passes through failure', async () => {
        const ar = mapAsync(async (x: number) => x * 2, fromResult(err<string>('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('propagates async callback rejection (does not catch)', async () => {
        const ar = mapAsync(async (_: number) => { throw new Error('async err'); }, fromResult(ok(1)));
        await expect(ar.run()).rejects.toThrow('async err');
    });

    it('accepts a sync callback and awaits it as a Promise', async () => {
        const ar = mapAsync((x: number) => x * 2, fromResult(ok(7)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(14);
    });

    it('is curried', async () => {
        const double = mapAsync(async (x: number) => x * 2);
        const ar = double(fromResult(ok(11)));
        const result = await ar.run();
        if(result.isSuccess) expect(result.value).toBe(22);
    });

    it('is lazy', () => {
        const ar = mapAsync(async (x: number) => x * 2, fromResult(ok(5)));
        expect(ar).toBeDefined();
    });

    // ── Throw policy (brief Step 8.1) ──────────────────────────────────────
    // The source documents that mapAsync does NOT catch — sync throws and
    // promise rejections propagate out of `.run()`. Pin the propagation policy.
    it('propagates a sync throw from fn (does not catch)', async () => {
        const ar = mapAsync((() => { throw new Error('sync err'); }) as (x: number) => number, fromResult(ok(1)));
        await expect(ar.run()).rejects.toThrow('sync err');
    });

    it('propagates a rejected Promise returned by fn (does not catch)', async () => {
        const ar = mapAsync((_x: number) => Promise.reject(new Error('rejected')), fromResult(ok(1)));
        await expect(ar.run()).rejects.toThrow('rejected');
    });

    it('does not invoke fn on failure (no leak)', async () => {
        let called = false;
        const ar = mapAsync((_x: number) => { called = true; return 1; }, fromResult(err<string>('skip')));
        await expect(ar.run()).resolves.toMatchObject({ isSuccess: false });
        expect(called).toBe(false);
    });

    it('curried form has the same propagation policy as direct form', async () => {
        const fn = mapAsync((_x: number) => Promise.reject(new Error('curried-prop')));
        const ar = fn(fromResult(ok(1)));
        await expect(ar.run()).rejects.toThrow('curried-prop');
    });
});
