import { describe, it, expect } from 'vitest';
import { fromPromise } from '../../src/async-result/fromPromise.js';

describe('AsyncResult fromPromise', () => {
    it('wraps a resolved promise', async () => {
        const ar = fromPromise(() => Promise.resolve(42));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('catches a rejected promise', async () => {
        const ar = fromPromise(() => Promise.reject(new Error('boom')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBeInstanceOf(Error);
    });

    it('uses errorFn to transform rejection', async () => {
        const ar = fromPromise(
            () => Promise.reject('fail'),
            (e: unknown) => `mapped: ${String(e)}`,
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('mapped: fail');
    });

    it('is lazy — thunk not called until run()', () => {
        let called = false;
        const ar = fromPromise(() => {
            called = true;
            return Promise.resolve(42);
        });
        expect(called).toBe(false);
    });

    it('passes through raw rejection when errorFn is omitted (default E=unknown)', async () => {
        const ar = fromPromise(() => Promise.reject(new Error('raw')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect((result.error as Error).message).toBe('raw');
    });

    it('does not call errorFn on success', async () => {
        let errorFnCalled = false;
        const ar = fromPromise(
            () => Promise.resolve(42),
            () => { errorFnCalled = true; return 'never' as const; },
        );
        await ar.run();
        expect(errorFnCalled).toBe(false);
    });

    it('supports a factory thunk that captures a fresh Promise per run()', async () => {
        let counter = 0;
        const ar = fromPromise(() => Promise.resolve(++counter));
        const v1 = await ar.run();
        const v2 = await ar.run();
        expect(v1.isSuccess && v2.isSuccess).toBe(true);
        if(v1.isSuccess && v2.isSuccess) {
            expect(v1.value).toBe(1);
            expect(v2.value).toBe(2);
        }
    });
});
