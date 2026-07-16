import { describe, it, expect } from 'vitest';
import { ok, err, existsAsync } from '../../src/index.js';

describe('existsAsync', () => {
    const isEven = async (x: number) => x % 2 === 0;

    it('returns true if success satisfies predicate (curried)', async () => {
        const check = existsAsync(isEven);
        const r = await check(Promise.resolve(ok(42)));
        expect(r).toBe(true);
    });

    it('returns true if success satisfies predicate (direct)', async () => {
        const r = await existsAsync(isEven, Promise.resolve(ok(42)));
        expect(r).toBe(true);
    });

    it('returns false if success does not satisfy predicate', async () => {
        const r = await existsAsync(isEven, Promise.resolve(ok(21)));
        expect(r).toBe(false);
    });

    it('returns false on failure', async () => {
        const r = await existsAsync(isEven, Promise.resolve(err<string>('fail')));
        expect(r).toBe(false);
    });

    it('works with sync predicate', async () => {
        const r = await existsAsync((x: number) => x > 10, Promise.resolve(ok(42)));
        expect(r).toBe(true);
    });
});
