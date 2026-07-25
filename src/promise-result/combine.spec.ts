import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { combine } from './combine.js';

describe('promise-result combine', () => {
    it('combines all Ok into an array', async () => {
        const r = await combine([Promise.resolve(ok(1)), Promise.resolve(ok(2)), Promise.resolve(ok(3))]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 2, 3]);
    });

    it('short-circuits on first Err', async () => {
        const r = await combine([Promise.resolve(ok(1)), Promise.resolve(err<string>('fail')), Promise.resolve(ok(3))]);
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('fail');
    });

    it('returns Ok([]) for empty input', async () => {
        const r = await combine([]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });
});