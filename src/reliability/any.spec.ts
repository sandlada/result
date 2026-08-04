import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { any } from './index.js';
import { ok, err } from '../factories/index.js';

describe('any', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('collects all successes when at least one Ok', async () => {
        const ar1 = { run: () => Promise.resolve(ok(1)) };
        const ar2 = { run: () => Promise.resolve(err<string>('a')) };
        const ar3 = { run: () => Promise.resolve(ok(2)) };
        const r = await any([ar1, ar2, ar3]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value.sort()).toEqual([1, 2]);
    });

    it('returns Err(errors[]) when every thunk fails', async () => {
        const ar1 = { run: () => Promise.resolve(err('a')) };
        const ar2 = { run: () => Promise.resolve(err('b')) };
        const ar3 = { run: () => Promise.resolve(err('c')) };
        const r = await any([ar1, ar2, ar3]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error.sort()).toEqual(['a', 'b', 'c']);
    });

    it('Ok([]) on empty input', async () => {
        const r = await any([]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('does not run until .run()', () => {
        const ar = { run: () => Promise.resolve(ok(1)) };
        const wrapped = any([ar]);
        expect(typeof wrapped.run).toBe('function');
    });

    it('captures a rejected promise as an error', async () => {
        // Per the AsyncResult contract, .run() should never reject, but the
        // implementation must defend against an upstream bug.
        const rejected = { run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('boom')), 5)) };
        const good = { run: () => new Promise<typeof ok<number, string>>((resolve) => setTimeout(() => resolve(ok(7)), 10)) };
        const ar = any([rejected, good]);
        const promise = ar.run();
        // Drive the scheduled rejection (5ms) and resolution (10ms).
        await vi.advanceTimersByTimeAsync(10);
        const r = await promise;
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([7]);
    });

    it('captures rejections even when every thunk rejects', async () => {
        const rejected = { run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('boom1')), 5)) };
        const otherRejected = { run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('boom2')), 10)) };
        const ar = any([rejected, otherRejected]);
        const promise = ar.run();
        // Drive the scheduled rejection (10ms).
        await vi.advanceTimersByTimeAsync(10);
        const r = await promise;
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error.length).toBe(2);
            expect(r.error.map((e: Error) => e.message).sort()).toEqual(['boom1', 'boom2']);
        }
    });

    it('does NOT short-circuit — every thunk is invoked regardless of an earlier Ok', async () => {
        let slowInvoked = false;
        let fastInvoked = false;
        const fast = { run: () => { fastInvoked = true; return Promise.resolve(ok(1)); } };
        const slow = { run: () => new Promise<typeof ok<number, string>>((resolve) => {
            setTimeout(() => { slowInvoked = true; resolve(err('slow-fail')); }, 5);
        }) };
        const ar = any([fast, slow]);
        const promise = ar.run();
        // Drive the scheduled timer so `slow` resolves.
        await vi.advanceTimersByTimeAsync(5);
        const r = await promise;
        expect(r.isSuccess).toBe(true);
        expect(fastInvoked).toBe(true);
        expect(slowInvoked).toBe(true);
    });

    it('collects all successes (not just the first one) when multiple resolve with Ok', async () => {
        const r = await any([
            { run: () => Promise.resolve(ok(1)) },
            { run: () => Promise.resolve(ok(2)) },
            { run: () => Promise.resolve(ok(3)) },
        ]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value.sort()).toEqual([1, 2, 3]);
    });

    it('aggregates every error when none succeed', async () => {
        const r = await any([
            { run: () => Promise.resolve(err('e1')) },
            { run: () => Promise.resolve(err('e2')) },
            { run: () => Promise.resolve(err('e3')) },
            { run: () => Promise.resolve(err('e4')) },
        ]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error.length).toBe(4);
            expect(r.error.sort()).toEqual(['e1', 'e2', 'e3', 'e4']);
        }
    });

    it('mixes Ok/Err — only successes appear in the success array', async () => {
        const r = await any([
            { run: () => Promise.resolve(ok(1)) },
            { run: () => Promise.resolve(err('x')) },
            { run: () => Promise.resolve(ok(2)) },
            { run: () => Promise.resolve(err('y')) },
        ]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value.sort()).toEqual([1, 2]);
    });

    it('does not invoke any .run() until the consumer calls .run() on any', () => {
        const ar1 = { run: vi.fn(() => Promise.resolve(ok(1))) };
        const ar2 = { run: vi.fn(() => Promise.resolve(err('nope'))) };
        any([ar1, ar2]);
        expect(ar1.run).not.toHaveBeenCalled();
        expect(ar2.run).not.toHaveBeenCalled();
    });
});
