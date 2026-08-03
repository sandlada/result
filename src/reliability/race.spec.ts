import { describe, it, expect, vi, afterEach } from 'vitest';
import { race } from './index.js';
import { ok, err } from '../factories/index.js';

const arFrom = <T, E>(ms: number, value: { isSuccess: true; isFailure: false; value: T } | { isSuccess: false; isFailure: true; error: E }) => ({
    run: () => new Promise<typeof value>((resolve) => setTimeout(() => resolve(value), ms)),
});

describe('race', () => {
    it('returns the first Ok', async () => {
        const r = await race([
            arFrom(50, ok(1)),
            arFrom(5, ok(2)),
        ]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(2);
    });

    it('returns the first Err when all fail', async () => {
        const r = await race([
            arFrom(5, err('first')),
            arFrom(50, err('later')),
        ]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('first');
    });

    it('mixes Ok and Err — first Ok still wins', async () => {
        const r = await race([
            arFrom(5, err('nope')),
            arFrom(20, ok(7)),
        ]).run();
        expect(r.isSuccess).toBe(true);
    });

    it('handles empty input (returns Err with sentinel Error)', async () => {
        const r = await race([]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
            expect((r.error as Error).message).toBe('race: no inputs');
        }
    });

    it('does not run any thunk until .run()', () => {
        const ar1 = arFrom(0, ok(1));
        const ar2 = arFrom(0, ok(2));
        const wrapped = race([ar1, ar2]);
        expect(typeof wrapped.run).toBe('function');
    });

    it('captures a rejected run() and reports its rejection as Err', async () => {
        const rejectedAr = {
            run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('boom')), 5)),
        };
        const otherRejectedAr = {
            run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('boom2')), 20)),
        };
        const r = await race([rejectedAr, otherRejectedAr]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('boom');
    });

    it('a late rejection after the race has settled is a no-op', async () => {
        // The OK resolves immediately, settling the race. The slow rejection
        // arrives later but the `if (settled) return;` guard drops it.
        const fast = arFrom(0, ok(1));
        const slowRejected = {
            run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('late')), 10)),
        };
        const r = await race([fast, slowRejected]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(1);
    });

    it('a late upstream error after the race has settled is a no-op (coverage for line 61)', async () => {
        const arFrom = <T, E>(ms: number, value: { isSuccess: true; isFailure: false; value: T } | { isSuccess: false; isFailure: true; error: E }) => ({
            run: () => new Promise<typeof value>((resolve) => setTimeout(() => resolve(value), ms)),
        });
        const fast = arFrom(0, ok(1));
        let rejectFn: (e: any) => void;
        const slowError = {
            run: () => new Promise<never>((_, reject) => { rejectFn = reject; }),
        };
        const r = race([fast, slowError]).run();

        setTimeout(() => rejectFn(new Error('late')), 10);
        const result = await r;
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(1);
    });

    it('handles multiple rejections correctly (coverage for lines 63-68)', async () => {
        // Use timings above the Windows default timer resolution (~15ms) so
        // the rejection order is deterministic across all platforms.
        const ar1 = {
            run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('boom1')), 80)),
        };
        const ar2 = {
            run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('boom2')), 30)),
        };
        const r = await race([ar1, ar2]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('boom2'); // fastest reject wins if all reject
    });

    it('handles all errors where first failure is not index 0 (coverage for line 55 branch idx === 0 tracking)', async () => {
        const arFrom = <T, E>(ms: number, value: { isSuccess: true; isFailure: false; value: T } | { isSuccess: false; isFailure: true; error: E }) => ({
            run: () => new Promise<typeof value>((resolve) => setTimeout(() => resolve(value), ms)),
        });
        const ar1 = arFrom(20, err('err1'));
        const ar2 = arFrom(5, err('err2'));
        const r = await race([ar1, ar2]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('err1'); // index 0 takes precedence in tracking if both fail
    });

    it('handles all errors where first failure IS index 0 (coverage for line 55 fallback)', async () => {
        const arFrom = <T, E>(ms: number, value: { isSuccess: true; isFailure: false; value: T } | { isSuccess: false; isFailure: true; error: E }) => ({
            run: () => new Promise<typeof value>((resolve) => setTimeout(() => resolve(value), ms)),
        });
        const ar1 = arFrom(5, err('err1'));
        const ar2 = arFrom(20, err('err2'));
        const r = await race([ar1, ar2]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('err1');
    });

    describe('with fake timers', () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it('returns the first Ok regardless of input order (deterministic)', async () => {
            vi.useFakeTimers();
            // First in input order would normally resolve later.
            const r = race([
                arFrom(500, ok('slow-first')),
                arFrom(10, ok('fast-second')),
                arFrom(100, ok('middle-third')),
            ]);
            const promise = r.run();
            await vi.advanceTimersByTimeAsync(500);
            const result = await promise;
            expect(result.isSuccess).toBe(true);
            if (result.isSuccess) expect(result.value).toBe('fast-second');
        });

        it('returns input-index-0 Err when all fail even if it settles last', async () => {
            vi.useFakeTimers();
            const r = race([
                arFrom(500, err('first-index-0')),  // index 0, slow
                arFrom(10, err('fast')),             // fast but loses
                arFrom(100, err('middle')),
            ]);
            const promise = r.run();
            await vi.advanceTimersByTimeAsync(500);
            const result = await promise;
            expect(result.isFailure).toBe(true);
            if (result.isFailure) expect(result.error).toBe('first-index-0');
        });

        it('surfaces the fastest Promise rejection when all thunks reject', async () => {
            vi.useFakeTimers();
            const r = race([
                { run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('late')), 500)) },
                { run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('early')), 10)) },
            ]);
            const promise = r.run();
            await vi.advanceTimersByTimeAsync(500);
            const result = await promise;
            expect(result.isFailure).toBe(true);
            if (result.isFailure) expect((result.error as Error).message).toBe('early');
        });

        it('does not call any .run() until the consumer calls .run() on race', () => {
            const ar1 = { run: vi.fn(() => Promise.resolve(ok(1))) };
            const ar2 = { run: vi.fn(() => Promise.resolve(ok(2))) };
            race([ar1, ar2]);
            expect(ar1.run).not.toHaveBeenCalled();
            expect(ar2.run).not.toHaveBeenCalled();
        });

        it('invokes every input .run() exactly once when the race runs', async () => {
            const ar1 = { run: vi.fn(() => Promise.resolve(ok(1))) };
            const ar2 = { run: vi.fn(() => Promise.resolve(err('nope'))) };
            await race([ar1, ar2]).run();
            expect(ar1.run).toHaveBeenCalledTimes(1);
            expect(ar2.run).toHaveBeenCalledTimes(1);
        });
    });

    it('returns the input-index-0 Err if every Err has the same timing', async () => {
        // Two equal-time errors; input index 0 should win.
        const r = await race([
            arFrom(20, err('index-0')),
            arFrom(20, err('index-1')),
        ]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('index-0');
    });

    it('first settled Ok wins even if it is not index 0', async () => {
        const r = await race([
            arFrom(50, err('index-0-loses')),
            arFrom(5, ok('index-1-wins')),
        ]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('index-1-wins');
    });
});
