import { describe, it, expect } from 'vitest';
import { ok, err, containsAsync } from '../../src/index.js';

describe('containsAsync', () => {
    it('returns true if success matches the value (curried)', async () => {
        const contains42 = containsAsync(42);
        const r = await contains42(Promise.resolve(ok(42)));
        expect(r).toBe(true);
    });

    it('returns true if success matches the value (direct)', async () => {
        const r = await containsAsync(42, Promise.resolve(ok(42)));
        expect(r).toBe(true);
    });

    it('returns false if success has a different value', async () => {
        const r = await containsAsync(99, Promise.resolve(ok(42)));
        expect(r).toBe(false);
    });

    it('returns false on failure', async () => {
        const r = await containsAsync(42, Promise.resolve(err<string>('fail')));
        expect(r).toBe(false);
    });

    it('checks strict equality', async () => {
        const obj = { id: 1 };
        const r1 = await containsAsync(obj, Promise.resolve(ok(obj)));
        const r2 = await containsAsync({ id: 1 }, Promise.resolve(ok(obj)));
        expect(r1).toBe(true);
        expect(r2).toBe(false);
    });
});
