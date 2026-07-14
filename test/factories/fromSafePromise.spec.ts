import { describe, it, expect } from 'vitest';
import { fromSafePromise } from '../../src/index.js';

describe('fromSafePromise', () => {
    it('wraps a resolved promise into Ok', async () => {
        const r = await fromSafePromise(Promise.resolve(42));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('error type is never', async () => {
        const r = await fromSafePromise(Promise.resolve('hello'));
        expect(r.isSuccess).toBe(true);
    });

    it('unwrap gives the correct value', async () => {
        const r = await fromSafePromise(Promise.resolve({ name: 'Alice' }));
        if (r.isSuccess) expect(r.value.name).toBe('Alice');
    });

    it('returns err when the promise rejects', async () => {
        const r = await fromSafePromise(Promise.reject(new Error('unexpected')));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect((r.error as Error).message).toBe('unexpected');
    });
});
