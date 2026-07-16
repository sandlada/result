import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone, tapAsyncOption } from '../../src/index.js';

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
});
