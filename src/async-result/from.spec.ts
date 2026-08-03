import { describe, it, expect } from 'vitest';
import { from } from '../../src/async-result/from.js';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';

describe('AsyncResult from', () => {
    it('creates an AsyncResult from a thunk', async () => {
        const ar = from(() => Promise.resolve(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('propagates error from the thunk', async () => {
        const ar = from(() => Promise.resolve(err('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('is lazy — thunk is not called until run()', () => {
        let called = false;
        const ar = from(() => {
            called = true;
            return Promise.resolve(ok('done'));
        });
        expect(called).toBe(false);
    });

    it('is lazy — thunk is called on run()', async () => {
        let called = false;
        const ar = from(() => {
            called = true;
            return Promise.resolve(ok('done'));
        });
        await ar.run();
        expect(called).toBe(true);
    });

    it('wraps a Promise<IResultOfT> produced via fromResult in the same shape', async () => {
        // fromResult creates an AsyncResult<T, E>; its run() returns a
        // Promise<IResultOfT<T, E>>. Feed the equivalent Promise directly into
        // `from` and assert the result shape matches.
        const ar = from(() => Promise.resolve(ok(99)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(99);
        // Cross-check: the fromResult carrier resolves to the same shape.
        const result2 = await fromResult(ok(99)).run();
        expect(result.isSuccess).toBe(result2.isSuccess);
        if(result.isSuccess && result2.isSuccess) expect(result.value).toBe(result2.value);
    });

    it('is lazy even when the inner Promise is rejected', () => {
        let called = false;
        const ar = from(() => {
            called = true;
            return Promise.reject(new Error('rejected'));
        });
        expect(called).toBe(false);
    });

    it('captures a rejected inner Promise at run()', async () => {
        const ar = from(() => Promise.reject(new Error('rejected')));
        await expect(ar.run()).rejects.toThrow('rejected');
    });
});
