import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { combineWithAllErrors } from './combineWithAllErrors.js';

describe('promise-result combineWithAllErrors', () => {
    it('combines all Ok into an array', async () => {
        const r = await combineWithAllErrors([Promise.resolve(ok(1)), Promise.resolve(ok(2))]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 2]);
    });

    it('aggregates all errors', async () => {
        const r = await combineWithAllErrors([
            Promise.resolve(ok(1)),
            Promise.resolve(err<string>('a')),
            Promise.resolve(err<string>('b')),
        ]);
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toEqual(['a', 'b']);
    });
});