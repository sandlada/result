import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { swap } from '../../src/async-result/swap.js';

describe('AsyncResult swap', () => {
    it('swaps success to failure', async () => {
        const ar = swap(fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe(42);
    });

    it('swaps failure to success', async () => {
        const ar = swap(fromResult(err('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe('fail');
    });

    it('is lazy', () => {
        const ar = swap(fromResult(ok(7)));
        expect(ar).toBeDefined();
        expect(ar.run).toBeInstanceOf(Function);
    });
});
