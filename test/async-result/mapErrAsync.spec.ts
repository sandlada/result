import { describe, it, expect, vi } from 'vitest';
import { err } from '../../src/factories/index.js';
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

    it('catches callback error', async () => {
        const ar = mapErrAsync(async () => { throw new Error('boom'); }, fromResult(err('oops')));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('boom');
    });
});
