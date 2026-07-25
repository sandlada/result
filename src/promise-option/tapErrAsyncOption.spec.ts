import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { tapErrAsyncOption } from './tapErrAsyncOption.js';

describe('promise-result tapErrAsyncOption', () => {
    it('calls fn on None', async () => {
        const fn = vi.fn();
        const r = await tapErrAsyncOption(fn, Promise.resolve(ofNone<number>()));
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
        await tapErrAsyncOption(fn)(Promise.resolve(ofNone<number>()));
        expect(fn).toHaveBeenCalled();
    });
});