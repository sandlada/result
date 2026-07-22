import { describe, it, expect } from 'vitest';
import { asyncOk, asyncErr, unwrapOrAsync } from '../../src/index.js';

describe('unwrapOrAsync', () => {
    it('returns value on success', async () => {
        const v = await unwrapOrAsync(0, asyncOk(42));
        expect(v).toBe(42);
    });

    it('returns default on failure', async () => {
        const v = await unwrapOrAsync(99, asyncErr<string>('err'));
        expect(v).toBe(99);
    });

    it('awaits a Promise default on failure', async () => {
        const v = await unwrapOrAsync(Promise.resolve(7), asyncErr<string>('err'));
        expect(v).toBe(7);
    });

    it('curried: returns a function to apply later', async () => {
        const fn = unwrapOrAsync<number, string>(0);
        expect(await fn(asyncOk(11))).toBe(11);
        expect(await fn(asyncErr('boom'))).toBe(0);
    });
});
