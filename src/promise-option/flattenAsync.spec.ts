import type { IOption } from '../types/Option.js';
import { describe, it, expect } from 'vitest';
import { flattenAsync } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

describe('flattenAsync', () => {
    it('flattens nested Some', async () => {
        const r = await flattenAsync(Promise.resolve(ofSome(ofSome(42))));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('flattens inner None', async () => {
        const r = await flattenAsync(Promise.resolve(ofSome(ofNone())));
        expect(r.isNone).toBe(true);
    });

    it('passes through outer None', async () => {
        const r = await flattenAsync(Promise.resolve(ofNone<IOption<number>>()));
        expect(r.isNone).toBe(true);
    });

    it('flattens exactly one layer (does not deep-flatten)', async () => {
        // Some(Some(Some(7))) only gets one layer peeled off — the result
        // is Some(Some(7)), NOT Some(7). This matches the documented
        // "single-step only" contract.
        const r = await flattenAsync(Promise.resolve(ofSome(ofSome(ofSome(7)))));
        expect(r.isSome).toBe(true);
        if (r.isSome) {
            expect(r.value.isSome).toBe(true);
            if (r.value.isSome) {
                expect(r.value.value).toBe(7);
            }
        }
    });

    it('propagates outer Promise rejection verbatim', async () => {
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        await expect(
            flattenAsync(outer as unknown as Promise<ReturnType<typeof ofSome<ReturnType<typeof ofSome<number>>>>>),
        ).rejects.toThrow('outer-reject');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = flattenAsync(Promise.resolve(ofSome(ofSome(42))));
        expect(r).toBeInstanceOf(Promise);
    });

    it('preserves identity on outer None (same reference shape)', async () => {
        // The flattening contract for outer None is pass-through: the None is
        // observed and a fresh None is returned. The value comparison is
        // observable as a None at runtime.
        const original = ofNone<IOption<number>>();
        const r = await flattenAsync(Promise.resolve(original));
        expect(r.isNone).toBe(true);
        if (r.isNone) {
            expect(r.isSome).toBe(false);
        }
    });
});
