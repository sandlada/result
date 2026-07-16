import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { mapErr } from '../../src/async-result/mapErr.js';

describe('AsyncResult mapErr', () => {
    it('maps an error value', async () => {
        const ar = mapErr((e: string) => e.toUpperCase(), fromResult(err('oops')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('OOPS');
    });

    it('passes through success', async () => {
        const ar = mapErr((e: string) => e.toUpperCase(), fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('is curried', async () => {
        const upper = mapErr((e: string) => e.toUpperCase());
        const ar = upper(fromResult(err('fail')));
        const result = await ar.run();
        if(!result.isSuccess) expect(result.error).toBe('FAIL');
    });
});
