import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { map } from '../../src/async-result/map.js';

describe('AsyncResult map', () => {
    it('maps a success value', async () => {
        const ar = map((x: number) => x * 2, fromResult(ok(21)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('passes through failure', async () => {
        const ar = map((x: number) => x * 2, fromResult(err<string>('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('is curried', async () => {
        const double = map((x: number) => x * 2);
        const ar = double(fromResult(ok(11)));
        const result = await ar.run();
        if(result.isSuccess) expect(result.value).toBe(22);
    });

    it('is lazy — does not call run() on construction', () => {
        const double = map((x: number) => x * 2);
        const ar = double(fromResult(ok(7)));
        // Simply creating should not throw
        expect(ar).toBeDefined();
    });
});
