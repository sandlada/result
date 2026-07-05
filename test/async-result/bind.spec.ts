import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { bind } from '../../src/async-result/bind.js';

describe('AsyncResult bind', () => {
    it('chains on success', async () => {
        const ar = bind((x: number) => fromResult(ok(x * 2)), fromResult(ok(21)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('short-circuits on failure', async () => {
        const ar = bind((x: number) => fromResult(err<string>('nested')), fromResult(err<string>('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('is curried', async () => {
        const chain = bind((x: number) => fromResult(ok(x + 1)));
        const ar = chain(fromResult(ok(41)));
        const result = await ar.run();
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('supports returning an AsyncResult from async computation', async () => {
        const ar = bind((x: number) => ({
            run: () => Promise.resolve(ok(x * 3)),
        }), fromResult(ok(14)));
        const result = await ar.run();
        if(result.isSuccess) expect(result.value).toBe(42);
    });
});
