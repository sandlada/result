import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { mapAsync } from '../../src/async-result/mapAsync.js';

describe('AsyncResult mapAsync', () => {
    it('maps with an async function', async () => {
        const ar = mapAsync(async (x: number) => x * 2, fromResult(ok(21)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('passes through failure', async () => {
        const ar = mapAsync(async (x: number) => x * 2, fromResult(err<string>('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('propagates a thrown exception in the async function as a rejection', async () => {
        const ar = mapAsync(async (_: number) => { throw new Error('async err'); }, fromResult(ok(1)));
        await expect(ar.run()).rejects.toThrow('async err');
    });

    it('is curried', async () => {
        const double = mapAsync(async (x: number) => x * 2);
        const ar = double(fromResult(ok(11)));
        const result = await ar.run();
        if(result.isSuccess) expect(result.value).toBe(22);
    });

    it('is lazy', () => {
        const ar = mapAsync(async (x: number) => x * 2, fromResult(ok(5)));
        expect(ar).toBeDefined();
    });
});
