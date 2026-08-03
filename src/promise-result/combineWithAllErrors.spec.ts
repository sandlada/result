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

    it('returns Ok([]) for empty input', async () => {
        const r = await combineWithAllErrors([]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('preserves the order of errors as encountered in iteration order', async () => {
        const r = await combineWithAllErrors([
            Promise.resolve(err<string>('first')),
            Promise.resolve(err<string>('second')),
            Promise.resolve(err<string>('third')),
        ]);
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toEqual(['first', 'second', 'third']);
    });

    it('combines Ok values even when some inputs are Err (aggregation)', async () => {
        // Mixed case: the Ok values are still collected, and the errors
        // are accumulated. This is the validation-aggregation semantic.
        const r = await combineWithAllErrors([
            Promise.resolve(ok(1)),
            Promise.resolve(err<string>('a')),
            Promise.resolve(ok(2)),
            Promise.resolve(err<string>('b')),
            Promise.resolve(ok(3)),
        ]);
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toEqual(['a', 'b']);
    });

    it('returns Ok with full array when all inputs are Ok', async () => {
        const r = await combineWithAllErrors([
            Promise.resolve(ok(1)),
            Promise.resolve(ok(2)),
            Promise.resolve(ok(3)),
        ]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 2, 3]);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = [new Promise<ReturnType<typeof ok<number>>>(() => { /* never */ })];
        const result = combineWithAllErrors(pending);
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates an outer Promise rejection from any input as a rejection', async () => {
        // Same as `combine`: outer rejection from an input is not an Err
        // and propagates verbatim. `Promise.all` rejects the aggregated
        // chain before any IResultOfT classification.
        await expect(combineWithAllErrors([
            Promise.resolve(ok(1)),
            Promise.reject(new Error('outer-reject')),
        ])).rejects.toThrow('outer-reject');
    });
});