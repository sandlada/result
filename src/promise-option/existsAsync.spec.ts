import { describe, it, expect } from 'vitest';
import { existsAsync } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

describe('existsAsync', () => {
    const isEven = async (x: number) => x % 2 === 0;

    it('returns true if Some satisfies predicate (curried)', async () => {
        const check = existsAsync(isEven);
        const r = await check(Promise.resolve(ofSome(42)));
        expect(r).toBe(true);
    });

    it('returns true if Some satisfies predicate (direct)', async () => {
        const r = await existsAsync(isEven, Promise.resolve(ofSome(42)));
        expect(r).toBe(true);
    });

    it('returns false if Some does not satisfy predicate', async () => {
        const r = await existsAsync(isEven, Promise.resolve(ofSome(21)));
        expect(r).toBe(false);
    });

    it('returns false on None', async () => {
        const r = await existsAsync(isEven, Promise.resolve(ofNone()));
        expect(r).toBe(false);
    });

    it('works with sync predicate', async () => {
        const r = await existsAsync((x: number) => x > 10, Promise.resolve(ofSome(42)));
        expect(r).toBe(true);
    });

    it('returns false when sync predicate throws (catch+convert policy)', async () => {
        const r = await existsAsync(() => { throw new Error('boom'); }, Promise.resolve(ofSome(42)));
        expect(r).toBe(false);
    });

    it('returns false when async predicate rejects (catch+convert policy)', async () => {
        const r = await existsAsync(async () => { throw new Error('boom'); }, Promise.resolve(ofSome(42)));
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
        await expect(existsAsync(predicate, outer)).rejects.toThrow('outer-reject');
        expect(invoked).toBe(false);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = existsAsync((x: number) => x > 0, Promise.resolve(ofSome(1)));
        expect(r).toBeInstanceOf(Promise);
    });

    it('discards the rejected reason (predicate exception → false, not propagated)', async () => {
        const thrown = new Error('hide-me');
        const r1 = await existsAsync(() => { throw thrown; }, Promise.resolve(ofSome(1)));
        expect(r1).toBe(false);

        const r2 = await existsAsync(
            async () => { throw thrown; },
            Promise.resolve(ofSome(1)),
        );
        expect(r2).toBe(false);
    });
});
