import { describe, it, expect } from 'vitest';
import { containsAsync } from './index.js';
import { ok, err } from '../factories/index.js';

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

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<ReturnType<typeof ok<number>>>(() => { /* never */ });
        const result = containsAsync(42, pending);
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim', async () => {
        await expect(
            containsAsync(42, Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
    });

    it('returns false on NaN (correct semantics)', async () => {
        // Per IEEE 754, NaN !== NaN. containsAsync uses `===`, so it returns
        // false even when the input value matches.
        const r = await containsAsync(NaN, Promise.resolve(ok(NaN)));
        expect(r).toBe(false);
    });
});
