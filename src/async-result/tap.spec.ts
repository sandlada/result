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

    it('does not invoke the source.run() on construction', () => {
        let called = false;
        const lazy = { run: () => { called = true; return Promise.resolve(ok(1)); } };
        tap<number, string>(() => {}, lazy);
        expect(called).toBe(false);
    });

    it('catches eFn throw and surfaces as Err(thrown), curried form', async () => {
        const curried = tap(
            () => { throw new Error('fn-boom'); },
            () => { throw new Error('eFn-boom'); },
        );
        const result = await curried(fromResult(ok(42))).run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('eFn-boom');
    });

    it('catches errorFn throw and surfaces as Err(thrown), direct form', async () => {
        const ar = tap(
            () => { throw new Error('fn-boom'); },
            fromResult(ok(42)),
            () => { throw new Error('errorFn-boom'); },
        );
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('errorFn-boom');
    });
});
