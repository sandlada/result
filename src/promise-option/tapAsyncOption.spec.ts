import { describe, it, expect, vi } from 'vitest';
import { tapAsyncOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

describe('tapAsyncOption', () => {
    it('calls side-effect on Some (curried)', async () => {
        const fn = vi.fn();
        const tapFn = tapAsyncOption(fn);
        const r = await tapFn(Promise.resolve(ofSome(42)));
        expect(fn).toHaveBeenCalledOnce();
        expect(fn).toHaveBeenCalledWith(42);
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('calls side-effect on Some (direct)', async () => {
        const fn = vi.fn();
        const r = await tapAsyncOption(fn, Promise.resolve(ofSome(42)));
        expect(fn).toHaveBeenCalledOnce();
        expect(fn).toHaveBeenCalledWith(42);
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('does not call side-effect on None', async () => {
        const fn = vi.fn();
        const r = await tapAsyncOption(fn, Promise.resolve(ofNone()));
        expect(fn).not.toHaveBeenCalled();
        expect(r.isNone).toBe(true);
    });

    it('returns None if side-effect throws', async () => {
        const fn = vi.fn().mockImplementation(() => { throw new Error('fail'); });
        const r = await tapAsyncOption(fn, Promise.resolve(ofSome(42)));
        expect(fn).toHaveBeenCalledOnce();
        expect(r.isNone).toBe(true);
    });

    it('returns None when the side-effect callback rejects (catch+convert policy)', async () => {
        // tapAsyncOption catches both sync throws and async rejections from
        // the side-effect and converts them to None — same shape as
        // tapAsyncResult on the success track.
        const fn = vi.fn(async () => { throw new Error('async-fail'); });
        const r = await tapAsyncOption(fn, Promise.resolve(ofSome(42)));
        expect(fn).toHaveBeenCalledOnce();
        expect(r.isNone).toBe(true);
    });

    it('does not invoke the side-effect when the outer Promise rejects', async () => {
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        const fn = vi.fn();
        await expect(tapAsyncOption(fn, outer)).rejects.toThrow('outer-reject');
        expect(fn).not.toHaveBeenCalled();
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = tapAsyncOption((v: number) => { void v; }, Promise.resolve(ofSome(5)));
        expect(r).toBeInstanceOf(Promise);
    });

    it('discards the rejected reason (callback exception → None, not propagated)', async () => {
        const thrown = new Error('hide-me');
        const r1 = await tapAsyncOption(() => { throw thrown; }, Promise.resolve(ofSome(1)));
        expect(r1.isNone).toBe(true);

        const r2 = await tapAsyncOption(
            async () => { throw thrown; },
            Promise.resolve(ofSome(1)),
        );
        expect(r2.isNone).toBe(true);
    });

    it('supports async side-effect returning Promise<void>', async () => {
        let observed = 0;
        const asyncEffect = vi.fn(async (v: number) => { observed = v; });
        const r = await tapAsyncOption(asyncEffect, Promise.resolve(ofSome(99)));
        expect(asyncEffect).toHaveBeenCalledOnce();
        expect(observed).toBe(99);
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(99);
    });
});
