import { describe, it, expect } from 'vitest';
import { any } from './index.js';
import { ok, err } from '../index.js';

describe('any', () => {
    it('collects all successes when at least one Ok', async () => {
        const ar1 = { run: () => Promise.resolve(ok(1)) };
        const ar2 = { run: () => Promise.resolve(err<string>('a')) };
        const ar3 = { run: () => Promise.resolve(ok(2)) };
        const r = await any([ar1, ar2, ar3]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value.sort()).toEqual([1, 2]);
    });

    it('returns Err(errors[]) when every thunk fails', async () => {
        const ar1 = { run: () => Promise.resolve(err('a')) };
        const ar2 = { run: () => Promise.resolve(err('b')) };
        const ar3 = { run: () => Promise.resolve(err('c')) };
        const r = await any([ar1, ar2, ar3]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error.sort()).toEqual(['a', 'b', 'c']);
    });

    it('Ok([]) on empty input', async () => {
        const r = await any([]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('does not run until .run()', () => {
        const ar = { run: () => Promise.resolve(ok(1)) };
        const wrapped = any([ar]);
        expect(typeof wrapped.run).toBe('function');
    });
});