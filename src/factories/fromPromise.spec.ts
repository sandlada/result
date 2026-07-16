import { describe, it, expect } from 'vitest';
import { fromPromise } from '../../src/index.js';

describe('fromPromise', () => {
    it('wraps a resolved promise into Ok', async () => {
        const r = await fromPromise(Promise.resolve(42));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('wraps a rejected promise into Err', async () => {
        const r = await fromPromise(Promise.reject('oops'));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('oops');
    });

    it('defaults error type to Error for Error rejections', async () => {
        const r = await fromPromise(Promise.reject(new Error('network error')));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBeInstanceOf(Error);
        if (!r.isSuccess && r.error instanceof Error) expect(r.error.message).toBe('network error');
    });

    it('uses custom errorFn to transform rejection', async () => {
        const r = await fromPromise(
            Promise.reject(new Error('not found')),
            (e) => `custom: ${(e as Error).message}`,
        );
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('custom: not found');
    });

    it('uses custom errorFn on string rejection', async () => {
        const r = await fromPromise(
            Promise.reject('fail'),
            (e) => `mapped: ${e}`,
        );
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('mapped: fail');
    });
});
