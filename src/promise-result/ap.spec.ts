import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { ap } from './ap.js';

describe('promise-result ap', () => {
    it('applies fn to value when both Ok', async () => {
        const r = await ap(Promise.resolve(ok((x: number) => x * 2)), Promise.resolve(ok(21)));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('propagates fn Err', async () => {
        const r = await ap(Promise.resolve(err<string>('fn-err')), Promise.resolve(ok(21)));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('fn-err');
    });

    it('propagates value Err', async () => {
        const r = await ap(Promise.resolve(ok((x: number) => x * 2)), Promise.resolve(err<string>('val-err')));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('val-err');
    });

    it('is curried', async () => {
        const applier = ap(Promise.resolve(ok((x: number) => x * 2)));
        const r = await applier(Promise.resolve(ok(21)));
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('does not invoke the inner fn when value is Err', async () => {
        const fn = vi.fn((x: number) => x * 2);
        const fnR = Promise.resolve(ok(fn));
        await ap(fnR, Promise.resolve(err<string>('val-err')));
        expect(fn).not.toHaveBeenCalled();
    });

    it('propagates an outer Promise rejection from either operand', async () => {
        // `ap` uses `Promise.all([fnResult, result])`; rejection from
        // either operand rejects the chain (not converted to Err).
        await expect(
            ap(Promise.reject(new Error('fn-reject')), Promise.resolve(ok(1))),
        ).rejects.toThrow('fn-reject');
        await expect(
            ap(Promise.resolve(ok((x: number) => x)), Promise.reject(new Error('val-reject'))),
        ).rejects.toThrow('val-reject');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<ReturnType<typeof ok<number>>>(() => { /* never */ });
        const result = ap(Promise.resolve(ok((x: number) => x)), pending);
        expect(result).toBeInstanceOf(Promise);
    });
});