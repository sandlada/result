import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { tapAsync } from '../../src/async-result/tapAsync.js';

describe('AsyncResult tapAsync', () => {
    it('calls async fn on success and passes result through', async () => {
        const sideEffects: number[] = [];
        const ar = tapAsync(async (v: number) => {
            await Promise.resolve();
            sideEffects.push(v);
        }, fromResult(ok(42)));
        const result = await ar.run();
        expect(sideEffects).toEqual([42]);
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('catches callback error and turns to failure', async () => {
        const ar = tapAsync(async () => { throw new Error('boom'); }, fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('boom');
    });

    it('does not call fn on failure', async () => {
        const fn = vi.fn();
        const ar = tapAsync(fn, fromResult(err<string>('fail')));
        await ar.run();
        expect(fn).not.toHaveBeenCalled();
    });
});
