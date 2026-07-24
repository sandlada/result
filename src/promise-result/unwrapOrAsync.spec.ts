import { describe, it, expect } from 'vitest';
import { asyncOk, asyncErr, unwrapOrAsync } from '../../src/index.js';

describe('unwrapOrAsync', () => {
    it('returns value on success', async () => {
        const r = await unwrapOrAsync(0, asyncOk(42));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('returns default on failure', async () => {
        const r = await unwrapOrAsync(99, asyncErr<string>('err'));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(99);
    });

    it('awaits a Promise default on failure', async () => {
        const r = await unwrapOrAsync(Promise.resolve(7), asyncErr<string>('err'));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(7);
    });

    it('curried: returns a function to apply later', async () => {
        const fn = unwrapOrAsync<number, string>(0);
        const okResult = await fn(asyncOk(11));
        expect(okResult.isSuccess).toBe(true);
        if (okResult.isSuccess) expect(okResult.value).toBe(11);
        const fallback = await fn(asyncErr('boom'));
        expect(fallback.isSuccess).toBe(true);
        if (fallback.isSuccess) expect(fallback.value).toBe(0);
    });

    it('converts a rejected Promise default into Err', async () => {
        const r = await unwrapOrAsync(Promise.reject('boom'), asyncErr<string>('err'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('boom');
    });

    it('converts a Promise default that throws asynchronously into Err', async () => {
        const r = await unwrapOrAsync(
            (async () => { throw new Error('async-throw'); })(),
            asyncErr<string>('err'),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeInstanceOf(Error);
        if (r.isFailure && r.error instanceof Error) {
            expect(r.error.message).toBe('async-throw');
        }
    });
});