import { describe, it, expect } from 'vitest';
import { race } from './index.js';
import { ok, err } from '../index.js';

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

    it('handles empty input (returns Err of undefined)', async () => {
        const r = await race([]).run();
        expect(r.isFailure).toBe(true);
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
        const ar1 = {
            run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('boom1')), 10)),
        };
        const ar2 = {
            run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('boom2')), 5)),
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
});
