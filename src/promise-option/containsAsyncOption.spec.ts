import { describe, it, expect } from 'vitest';
import { containsAsyncOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

describe('containsAsyncOption', () => {
    it('returns true if Some matches the value (curried)', async () => {
        const contains42 = containsAsyncOption(42);
        const r = await contains42(Promise.resolve(ofSome(42)));
        expect(r).toBe(true);
    });

    it('returns true if Some matches the value (direct)', async () => {
        const r = await containsAsyncOption(42, Promise.resolve(ofSome(42)));
        expect(r).toBe(true);
    });

    it('returns false if Some has a different value', async () => {
        const r = await containsAsyncOption(99, Promise.resolve(ofSome(42)));
        expect(r).toBe(false);
    });

    it('returns false on None', async () => {
        const r = await containsAsyncOption(42, Promise.resolve(ofNone()));
        expect(r).toBe(false);
    });

    it('checks strict equality', async () => {
        const obj = { id: 1 };
        const r1 = await containsAsyncOption(obj, Promise.resolve(ofSome(obj)));
        const r2 = await containsAsyncOption({ id: 1 }, Promise.resolve(ofSome(obj)));
        expect(r1).toBe(true);
        expect(r2).toBe(false);
    });

    it('returns false for NaN compared to NaN (IEEE-754 strict equality)', async () => {
        // NaN === NaN is false per IEEE-754. containsAsyncOption uses strict
        // equality, so even when both sides are NaN, the answer is false.
        const r = await containsAsyncOption(Number.NaN, Promise.resolve(ofSome(Number.NaN)));
        expect(r).toBe(false);
    });

    it('propagates outer Promise rejection verbatim (no callback to swallow it)', async () => {
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        await expect(containsAsyncOption(0, outer)).rejects.toThrow('outer-reject');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = containsAsyncOption(42, Promise.resolve(ofSome(42)));
        expect(r).toBeInstanceOf(Promise);
    });

    it('curried form wraps the value eagerly', () => {
        const r = containsAsyncOption(42);
        expect(r).toBeInstanceOf(Function);
    });
});
