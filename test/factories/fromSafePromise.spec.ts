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

    it('rejects if the promise rejects (does not catch)', async () => {
        await expect(fromSafePromise(Promise.reject(new Error('unexpected'))))
            .rejects.toThrow('unexpected');
    });
});
