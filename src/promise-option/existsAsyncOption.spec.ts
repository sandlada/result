import { describe, it, expect } from 'vitest';
import { existsAsyncOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

describe('existsAsyncOption', () => {
    const isEven = async (x: number) => x % 2 === 0;

    it('returns true if Some satisfies predicate (curried)', async () => {
        const check = existsAsyncOption(isEven);
        const r = await check(Promise.resolve(ofSome(42)));
        expect(r).toBe(true);
    });

    it('returns true if Some satisfies predicate (direct)', async () => {
        const r = await existsAsyncOption(isEven, Promise.resolve(ofSome(42)));
        expect(r).toBe(true);
    });

    it('returns false if Some does not satisfy predicate', async () => {
        const r = await existsAsyncOption(isEven, Promise.resolve(ofSome(21)));
        expect(r).toBe(false);
    });

    it('returns false on None', async () => {
        const r = await existsAsyncOption(isEven, Promise.resolve(ofNone()));
        expect(r).toBe(false);
    });

    it('works with sync predicate', async () => {
        const r = await existsAsyncOption((x: number) => x > 10, Promise.resolve(ofSome(42)));
        expect(r).toBe(true);
    });

    it('returns false when sync predicate throws (catch+convert policy)', async () => {
        const r = await existsAsyncOption(() => { throw new Error('boom'); }, Promise.resolve(ofSome(42)));
        expect(r).toBe(false);
    });

    it('returns false when async predicate rejects (catch+convert policy)', async () => {
        const r = await existsAsyncOption(async () => { throw new Error('boom'); }, Promise.resolve(ofSome(42)));
        expect(r).toBe(false);
    });

    it('does not invoke the predicate when the outer Promise rejects', async () => {
        // The outer Promise rejection short-circuits before the inner Some is
        // even observed; the predicate is never invoked. (Outer rejection
        // itself propagates — the catch+convert policy applies only to the
        // predicate's own rejection, not to the source.)
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        let invoked = false;
        const predicate = () => {
            invoked = true;
            return Promise.resolve(true);
        };
        await expect(existsAsyncOption(predicate, outer)).rejects.toThrow('outer-reject');
        expect(invoked).toBe(false);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = existsAsyncOption((x: number) => x > 0, Promise.resolve(ofSome(1)));
        expect(r).toBeInstanceOf(Promise);
    });

    it('discards the rejected reason (predicate exception → false, not propagated)', async () => {
        const thrown = new Error('hide-me');
        const r1 = await existsAsyncOption(() => { throw thrown; }, Promise.resolve(ofSome(1)));
        expect(r1).toBe(false);

        const r2 = await existsAsyncOption(
            async () => { throw thrown; },
            Promise.resolve(ofSome(1)),
        );
        expect(r2).toBe(false);
    });
});
