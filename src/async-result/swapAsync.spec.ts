import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { fromResult } from './fromResult.js';
import { swapAsync } from './swapAsync.js';

describe('AsyncResult swapAsync', () => {
    it('swaps success to failure', async () => {
        const ar = swapAsync(fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe(42);
    });

    it('swaps failure to success', async () => {
        const ar = swapAsync(fromResult(err('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe('fail');
    });

    it('is lazy', () => {
        const ar = swapAsync(fromResult(ok(7)));
        expect(ar).toBeDefined();
        expect(ar.run).toBeInstanceOf(Function);
    });
});
