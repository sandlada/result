import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { unwrapOrElseAsyncOption } from './unwrapOrElseAsyncOption.js';

describe('promise-result unwrapOrElseAsyncOption', () => {
    it('returns value on Some without calling onNone', async () => {
        const onNone = vi.fn(() => 0);
        const v = await unwrapOrElseAsyncOption(onNone, Promise.resolve(ofSome(42)));
        expect(v).toBe(42);
        expect(onNone).not.toHaveBeenCalled();
    });

    it('calls onNone on None', async () => {
        const v = await unwrapOrElseAsyncOption(() => 0, Promise.resolve(ofNone<number>()));
        expect(v).toBe(0);
    });

    it('supports async onNone', async () => {
        const v = await unwrapOrElseAsyncOption(async () => 99, Promise.resolve(ofNone<number>()));
        expect(v).toBe(99);
    });

    it('does not invoke onNone on Some (callback short-circuit)', async () => {
        const onNone = vi.fn(() => 99);
        const v = await unwrapOrElseAsyncOption(onNone, Promise.resolve(ofSome(7)));
        expect(onNone).not.toHaveBeenCalled();
        expect(v).toBe(7);
    });

    it('propagates sync throw from onNone verbatim (no catch — the catch+convert does NOT apply here)', async () => {
        // unwrapOrElseAsyncOption uses bare `inner.isSome ? inner.value : await onNone()`.
        // A sync throw from the handler propagates via the outer `.then`.
        await expect(
            unwrapOrElseAsyncOption(() => { throw new Error('onNone-boom'); }, Promise.resolve(ofNone<number>())),
        ).rejects.toThrow('onNone-boom');
    });

    it('propagates async onNone rejection verbatim (no catch)', async () => {
        await expect(
            unwrapOrElseAsyncOption(async () => { throw new Error('async-onNone-boom'); }, Promise.resolve(ofNone<number>())),
        ).rejects.toThrow('async-onNone-boom');
    });

    it('propagates outer Promise rejection verbatim', async () => {
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        await expect(
            unwrapOrElseAsyncOption(() => 0, outer),
        ).rejects.toThrow('outer-reject');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = unwrapOrElseAsyncOption(() => 0, Promise.resolve(ofSome(5)));
        expect(r).toBeInstanceOf(Promise);
    });
});