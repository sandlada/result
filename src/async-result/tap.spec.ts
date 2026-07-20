import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { tap } from '../../src/async-result/tap.js';

describe('AsyncResult tap', () => {
    it('calls fn on success and passes result through', async () => {
        const sideEffects: number[] = [];
        const ar = tap((v: number) => { sideEffects.push(v); }, fromResult(ok(42)));
        const result = await ar.run();
        expect(sideEffects).toEqual([42]);
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('does not call fn on failure', async () => {
        let called = false;
        const ar = tap((_v: number) => { called = true; }, fromResult(err<string>('fail')));
        await ar.run();
        expect(called).toBe(false);
    });

    it('is curried', async () => {
        const sideEffects: string[] = [];
        const tapper = tap((v: string) => { sideEffects.push(v); });
        const ar = tapper(fromResult(ok('hello')));
        await ar.run();
        expect(sideEffects).toEqual(['hello']);
    });
    it('converts to err when fn throws', async () => {
        const ar = tap(() => { throw new Error('side-effect failed'); }, fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('side-effect failed');
    });
});
