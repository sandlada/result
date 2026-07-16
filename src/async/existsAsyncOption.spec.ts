import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, existsAsyncOption } from '../../src/index.js';

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
});
