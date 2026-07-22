import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { tapErrAsync } from '../../src/async-result/tapErrAsync.js';

describe('AsyncResult tapErrAsync', () => {
    it('calls async fn on failure and passes original error through', async () => {
        const sideEffects: string[] = [];
        const ar = tapErrAsync(async (e: string) => {
            await Promise.resolve();
            sideEffects.push(e);
        }, fromResult(err('oops')));
        const result = await ar.run();
        expect(sideEffects).toEqual(['oops']);
        expect(result.isFailure).toBe(true);
        if(result.isFailure) expect(result.error).toBe('oops');
    });

    it('catches callback error and overrides failure', async () => {
        const ar = tapErrAsync(async () => { throw new Error('boom'); }, fromResult(err('oops')));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('boom');
    });

    it('catches sync throw and overrides failure', async () => {
        const ar = tapErrAsync((() => { throw new Error('sync'); }) as (e: string) => void, fromResult(err('oops')));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('sync');
    });

    it('does not call fn on success', async () => {
        const fn = vi.fn();
        const ar = tapErrAsync(fn, fromResult(ok(42)));
        await ar.run();
        expect(fn).not.toHaveBeenCalled();
    });

    it('curried: returns a function to apply later', async () => {
        const fn = tapErrAsync<string, string>(async () => {});
        const ar = fn(fromResult(err('curried')));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('curried');
    });
});
