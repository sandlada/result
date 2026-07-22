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
        // Per the AsyncResult contract, .run() should never reject, but the
        // implementation must defend against an upstream bug.
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
});
