import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';

describe('AsyncResult fromResult', () => {
    it('wraps a success result', async () => {
        const ar = fromResult(ok(42));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('wraps a failure result', async () => {
        const ar = fromResult(err('fail'));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('resolves immediately to the same result', async () => {
        const input = ok('hello');
        const ar = fromResult(input);
        const result = await ar.run();
        expect(result).toBe(input);
    });

    it('is lazy — does not block', () => {
        const ar = fromResult(ok(99));
        // Simply creating it should not throw or require await
        expect(ar).toBeDefined();
    });
});
