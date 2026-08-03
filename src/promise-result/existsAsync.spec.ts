import { describe, it, expect, vi } from 'vitest';
import { existsAsync } from './index.js';
import { ok, err } from '../factories/index.js';

describe('existsAsync', () => {
    const isEven = async (x: number) => x % 2 === 0;

    it('returns true if success satisfies predicate (curried)', async () => {
        const check = existsAsync(isEven);
        const r = await check(Promise.resolve(ok(42)));
        expect(r).toBe(true);
    });

    it('returns true if success satisfies predicate (direct)', async () => {
        const r = await existsAsync(isEven, Promise.resolve(ok(42)));
        expect(r).toBe(true);
    });

    it('returns false if success does not satisfy predicate', async () => {
        const r = await existsAsync(isEven, Promise.resolve(ok(21)));
        expect(r).toBe(false);
    });

    it('returns false on failure', async () => {
        const r = await existsAsync(isEven, Promise.resolve(err<string>('fail')));
        expect(r).toBe(false);
    });

    it('works with sync predicate', async () => {
        const r = await existsAsync((x: number) => x > 10, Promise.resolve(ok(42)));
        expect(r).toBe(true);
    });

    it('propagates sync predicate throw (does not catch)', async () => {
        await expect(existsAsync(() => { throw new Error('boom'); }, Promise.resolve(ok(42)))).rejects.toThrow('boom');
    });

    it('propagates async predicate rejection (does not catch)', async () => {
        await expect(existsAsync(async () => { throw new Error('boom'); }, Promise.resolve(ok(42)))).rejects.toThrow('boom');
    });

    it('does not invoke the predicate on a failure source', async () => {
        const pred = vi.fn(async (x: number) => x > 10);
        const r = await existsAsync(pred, Promise.resolve(err<string>('pre-fail')));
        expect(pred).not.toHaveBeenCalled();
        expect(r).toBe(false);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<ReturnType<typeof ok<number>>>(() => { /* never */ });
        const result = existsAsync(isEven, pending);
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim', async () => {
        await expect(
            existsAsync(isEven, Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
    });
});
