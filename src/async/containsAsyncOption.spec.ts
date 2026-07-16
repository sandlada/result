import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, containsAsyncOption } from '../../src/index.js';

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
});
