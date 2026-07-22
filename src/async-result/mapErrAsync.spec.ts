import { describe, it, expect } from 'vitest';
import { err, ok } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { mapErrAsync } from '../../src/async-result/mapErrAsync.js';

describe('AsyncResult mapErrAsync', () => {
    it('calls async fn on failure and transforms error', async () => {
        const ar = mapErrAsync(async (e: string) => {
            await Promise.resolve();
            return e.toUpperCase();
        }, fromResult(err('oops')));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if(result.isFailure) expect(result.error).toBe('OOPS');
    });

    it('passes through success unchanged', async () => {
        const ar = mapErrAsync(async () => 'never-called', fromResult(ok(7)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(7);
    });

    it('catches async callback rejection', async () => {
        const ar = mapErrAsync(async () => { throw new Error('boom'); }, fromResult(err('oops')));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('boom');
    });

    it('catches sync throw inside the callback', async () => {
        const ar = mapErrAsync((() => { throw new Error('sync-boom'); }) as (e: string) => string, fromResult(err('oops')));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('sync-boom');
    });

    it('curried: returns a function to apply later', async () => {
        const fn = mapErrAsync(async (e: string) => e.toUpperCase());
        const ar = fn(fromResult(err('curried')));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('CURRIED');
    });
});
