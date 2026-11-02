import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { unwrapOrElseAsync } from './unwrapOrElseAsync.js';

describe('promise-result unwrapOrElseAsync', () => {
    it('returns value on Some without calling onNone', async () => {
        const onNone = vi.fn(() => 0);
        const v = await unwrapOrElseAsync(onNone, Promise.resolve(ofSome(42)));
        expect(v).toBe(42);
        expect(onNone).not.toHaveBeenCalled();
    });

    it('calls onNone on None', async () => {
        const v = await unwrapOrElseAsync(() => 0, Promise.resolve(ofNone()));
        expect(v).toBe(0);
    });

    it('supports async onNone', async () => {
        const v = await unwrapOrElseAsync(async () => 99, Promise.resolve(ofNone()));
        expect(v).toBe(99);
    });

    it('does not invoke onNone on Some (callback short-circuit)', async () => {
        const onNone = vi.fn(() => 99);
        const v = await unwrapOrElseAsync(onNone, Promise.resolve(ofSome(7)));
        expect(onNone).not.toHaveBeenCalled();
        expect(v).toBe(7);
    });

    it('propagates sync throw from onNone verbatim (no catch — the catch+convert does NOT apply here)', async () => {
        // unwrapOrElseAsync uses bare `inner.isSome ? inner.value : await onNone()`.
        // A sync throw from the handler propagates via the outer `.then`.
        await expect(
            unwrapOrElseAsync(() => { throw new Error('onNone-boom'); }, Promise.resolve(ofNone())),
        ).rejects.toThrow('onNone-boom');
    });

    it('propagates async onNone rejection verbatim (no catch)', async () => {
        await expect(
            unwrapOrElseAsync(async () => { throw new Error('async-onNone-boom'); }, Promise.resolve(ofNone())),
        ).rejects.toThrow('async-onNone-boom');
    });

    it('propagates outer Promise rejection verbatim', async () => {
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        await expect(
            unwrapOrElseAsync(() => 0, outer),
        ).rejects.toThrow('outer-reject');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = unwrapOrElseAsync(() => 0, Promise.resolve(ofSome(5)));
        expect(r).toBeInstanceOf(Promise);
    });
});