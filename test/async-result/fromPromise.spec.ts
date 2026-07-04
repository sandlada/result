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
});
