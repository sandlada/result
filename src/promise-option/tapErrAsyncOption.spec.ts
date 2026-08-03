import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { tapErrAsyncOption } from './tapErrAsyncOption.js';

describe('promise-result tapErrAsyncOption', () => {
    it('calls fn on None', async () => {
        const fn = vi.fn();
        const r = await tapErrAsyncOption(fn, Promise.resolve(ofNone()));
        expect(fn).toHaveBeenCalled();
        expect(r.isNone).toBe(true);
    });

    it('does not call fn on Some', async () => {
        const fn = vi.fn();
        const r = await tapErrAsyncOption(fn, Promise.resolve(ofSome(42)));
        expect(fn).not.toHaveBeenCalled();
        expect(r.isSome).toBe(true);
    });

    it('is curried', async () => {
        const fn = vi.fn();
        await tapErrAsyncOption(fn)(Promise.resolve(ofNone()));
        expect(fn).toHaveBeenCalled();
    });

    it('passes undefined to the callback on None (H1 fix contract)', async () => {
        // The callback's parameter is `T | undefined` because on the None
        // path there's no payload — the runtime always passes `undefined`.
        // This test pins the H1 (contract) fix committed earlier.
        const fn = vi.fn();
        await tapErrAsyncOption(fn, Promise.resolve(ofNone()));
        expect(fn).toHaveBeenCalledWith(undefined);
    });

    it('does not catch sync throws from the callback (propagates verbatim)', async () => {
        // tapErrAsyncOption intentionally does NOT wrap the await fn(...) in
        // a try/catch. A sync throw from the side-effect propagates via the
        // outer `.then`.
        const fn = vi.fn(() => { throw new Error('side-effect-boom'); });
        await expect(
            tapErrAsyncOption(fn, Promise.resolve(ofNone())),
        ).rejects.toThrow('side-effect-boom');
    });

    it('does not catch async rejection from the callback (propagates verbatim)', async () => {
        const fn = vi.fn(async () => { throw new Error('async-side-boom'); });
        await expect(
            tapErrAsyncOption(fn, Promise.resolve(ofNone())),
        ).rejects.toThrow('async-side-boom');
    });

    it('propagates outer Promise rejection verbatim', async () => {
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        const fn = vi.fn();
        await expect(tapErrAsyncOption(fn, outer)).rejects.toThrow('outer-reject');
        expect(fn).not.toHaveBeenCalled();
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = tapErrAsyncOption((v: number | undefined) => { void v; }, Promise.resolve(ofNone()));
        expect(r).toBeInstanceOf(Promise);
    });

    it('returns the original Option by reference on Some (no wrapping)', async () => {
        // tapErrAsyncOption short-circuits on Some and returns the input
        // Option directly — no wrapping occurs, so the runtime reference is
        // identical to the input.
        const original = ofSome(42);
        const r = await tapErrAsyncOption((v: number | undefined) => { void v; }, Promise.resolve(original));
        expect(r).toBe(original);
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });
});