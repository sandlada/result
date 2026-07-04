import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { orElse } from '../../src/async-result/orElse.js';

describe('AsyncResult orElse', () => {
    it('recovers from failure to success', async () => {
        const ar = orElse((e: string) => fromResult(ok(`recovered: ${e}`)), fromResult(err('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe('recovered: fail');
    });

    it('passes through success unchanged', async () => {
        const ar = orElse((e: string) => fromResult(ok(0)), fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('is curried', async () => {
        const recover = orElse((e: string) => fromResult(ok(0)));
        const ar = recover(fromResult(err('fail')));
        const result = await ar.run();
        if(result.isSuccess) expect(result.value).toBe(0);
    });
});
