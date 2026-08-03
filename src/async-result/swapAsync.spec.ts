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

    it('does not invoke source.run() on construction', () => {
        let called = false;
        const lazy = { run: () => { called = true; return Promise.resolve(ok(1)); } };
        swapAsync(lazy);
        expect(called).toBe(false);
    });

    it('swapping twice returns to the original Ok shape', async () => {
        const ar = swapAsync(swapAsync(fromResult(ok(99))));
        const result = await ar.run();
        if (result.isSuccess) expect(result.value).toBe(99);
    });

    it('swapping twice returns to the original Err shape', async () => {
        const ar = swapAsync(swapAsync(fromResult(err<string>('orig'))));
        const result = await ar.run();
        if (result.isFailure) expect(result.error).toBe('orig');
    });

    it('preserves structured payload through swap', async () => {
        type VErr = { code: number };
        const ar = swapAsync(fromResult(err<VErr>({ code: 7 })));
        const result = await ar.run();
        if (result.isSuccess) expect(result.value.code).toBe(7);
    });
});
