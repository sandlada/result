import { describe, it, expect, vi } from 'vitest';
import { filterAsyncOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

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

    it('does not invoke the predicate when the outer Promise is rejected', async () => {
        // Outer Promise rejection short-circuits before the inner Some is
        // observed — the predicate is never called. The outer rejection
        // itself propagates verbatim.
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        const predicate = vi.fn(async () => true);
        await expect(filterAsyncOption(predicate, outer)).rejects.toThrow('outer-reject');
        expect(predicate).not.toHaveBeenCalled();
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = filterAsyncOption((x: number) => x > 0, Promise.resolve(ofSome(1)));
        expect(r).toBeInstanceOf(Promise);
    });

    it('discards the rejected reason (predicate exception → None, not propagated)', async () => {
        const thrown = new Error('hide-me');
        const r1 = await filterAsyncOption(() => { throw thrown; }, Promise.resolve(ofSome(1)));
        expect(r1.isNone).toBe(true);

        const r2 = await filterAsyncOption(
            async () => { throw thrown; },
            Promise.resolve(ofSome(1)),
        );
        expect(r2.isNone).toBe(true);
    });
});
