import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { tapErr } from '../../src/async-result/tapErr.js';

describe('AsyncResult tapErr', () => {
    it('calls fn on failure and passes result through', async () => {
        const sideEffects: string[] = [];
        const ar = tapErr((e: string) => { sideEffects.push(e); }, fromResult(err('fail')));
        const result = await ar.run();
        expect(sideEffects).toEqual(['fail']);
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('does not call fn on success', async () => {
        let called = false;
        const ar = tapErr((_e: string) => { called = true; }, fromResult(ok(42)));
        await ar.run();
        expect(called).toBe(false);
    });

    it('is curried', async () => {
        const sideEffects: string[] = [];
        const tapper = tapErr((e: string) => { sideEffects.push(e); });
        const ar = tapper(fromResult(err('oops')));
        await ar.run();
        expect(sideEffects).toEqual(['oops']);
    });
});
