import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, filterAsyncOption } from '../../src/index.js';

describe('filterAsyncOption', () => {
    const isEven = async (x: number) => x % 2 === 0;

    it('returns the same Some if predicate matches (curried)', async () => {
        const filterEven = filterAsyncOption(isEven);
        const r = await filterEven(Promise.resolve(ofSome(42)));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('returns the same Some if predicate matches (direct)', async () => {
        const r = await filterAsyncOption(isEven, Promise.resolve(ofSome(42)));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('returns None if predicate does not match', async () => {
        const r = await filterAsyncOption(isEven, Promise.resolve(ofSome(21)));
        expect(r.isNone).toBe(true);
    });

    it('passes through None', async () => {
        const r = await filterAsyncOption(isEven, Promise.resolve(ofNone()));
        expect(r.isNone).toBe(true);
    });

    it('works with sync predicate', async () => {
        const r = await filterAsyncOption((x: number) => x > 10, Promise.resolve(ofSome(42)));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('converts sync throw to None (catch+convert policy)', async () => {
        const r = await filterAsyncOption(() => { throw new Error('boom'); }, Promise.resolve(ofSome(42)));
        expect(r.isNone).toBe(true);
    });

    it('converts async rejection to None (catch+convert policy)', async () => {
        const r = await filterAsyncOption(async () => { throw new Error('boom'); }, Promise.resolve(ofSome(42)));
        expect(r.isNone).toBe(true);
    });
});
