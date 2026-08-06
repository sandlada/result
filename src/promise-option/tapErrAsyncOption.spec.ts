import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { tapErrAsyncOption } from './tapErrAsyncOption.js';

describe('promise-result tapErrAsyncOption', () => {
    it('calls fnNone on None', async () => {
        const fn = vi.fn();
        const fnNone = vi.fn();
        const r = await tapErrAsyncOption(fn, Promise.resolve(ofNone()), fnNone);
        expect(fn).not.toHaveBeenCalled();
        expect(fnNone).toHaveBeenCalled();
        expect(r.isNone).toBe(true);
    });

    it('calls fn on Some with the inner value', async () => {
        const fn = vi.fn();
        const r = await tapErrAsyncOption(fn, Promise.resolve(ofSome(42)));
        expect(fn).toHaveBeenCalledWith(42);
        expect(r.isSome).toBe(true);
    });

    it('does not call fn on None', async () => {
        const fn = vi.fn();
        const r = await tapErrAsyncOption(fn, Promise.resolve(ofNone()));
        expect(fn).not.toHaveBeenCalled();
        expect(r.isNone).toBe(true);
    });

    it('is curried', async () => {
        const fn = vi.fn();
        const fnNone = vi.fn();
        const tapper = tapErrAsyncOption(fn, fnNone);
        await tapper(Promise.resolve(ofNone()));
        expect(fnNone).toHaveBeenCalled();
    });

    it('treats absent fnNone as no-op (callback not required)', async () => {
        const fn = vi.fn();
        const r = await tapErrAsyncOption(fn, Promise.resolve(ofNone()));
        expect(fn).not.toHaveBeenCalled();
        expect(r.isNone).toBe(true);
    });

    it('does not catch async rejection from fn (propagates verbatim)', async () => {
        const fn = vi.fn(async () => { throw new Error('async-side-boom'); });
        await expect(
            tapErrAsyncOption(fn, Promise.resolve(ofSome(42))),
        ).rejects.toThrow('async-side-boom');
    });

    it('does not catch async rejection from fnNone (propagates verbatim)', async () => {
        const fn = vi.fn();
        const fnNone = vi.fn(async () => { throw new Error('async-none-boom'); });
        await expect(
            tapErrAsyncOption(fn, Promise.resolve(ofNone()), fnNone),
        ).rejects.toThrow('async-none-boom');
    });

    it('propagates outer Promise rejection verbatim', async () => {
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        const fn = vi.fn();
        const fnNone = vi.fn();
        await expect(tapErrAsyncOption(fn, outer, fnNone)).rejects.toThrow('outer-reject');
        expect(fn).not.toHaveBeenCalled();
        expect(fnNone).not.toHaveBeenCalled();
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = tapErrAsyncOption((v: number) => { void v; }, Promise.resolve(ofNone()));
        expect(r).toBeInstanceOf(Promise);
    });

    it('returns the original Option by reference on Some (no wrapping)', async () => {
        const original = ofSome(42);
        const r = await tapErrAsyncOption((v: number) => { void v; }, Promise.resolve(original));
        expect(r).toBe(original);
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });
});