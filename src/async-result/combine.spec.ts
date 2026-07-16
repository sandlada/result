import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { combine } from '../../src/async-result/combine.js';

describe('AsyncResult combine', () => {
    it('combines all success values into an array', async () => {
        const ar = combine([fromResult(ok(1)), fromResult(ok(2)), fromResult(ok(3))]);
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toEqual([1, 2, 3]);
    });

    it('short-circuits on the first failure', async () => {
        const ar = combine([fromResult(ok(1)), fromResult(err('fail')), fromResult(ok(3))]);
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('returns an empty array for an empty input', async () => {
        const ar = combine([]);
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toEqual([]);
    });

    it('is lazy', () => {
        const ar = combine([fromResult(ok(1)), fromResult(ok(2))]);
        expect(ar).toBeDefined();
        // Should not throw — run() is not called
    });
});
