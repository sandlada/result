import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { unwrapOr } from './unwrapOr.js';

describe('promise-result unwrapOr (sync)', () => {
    it('returns value on Ok', async () => {
        const v = await unwrapOr(0, Promise.resolve(ok(42)));
        expect(v).toBe(42);
    });

    it('returns default on Err', async () => {
        const v = await unwrapOr(0, Promise.resolve(err<string>('x')));
        expect(v).toBe(0);
    });

    it('awaits Promise defaults', async () => {
        const v = await unwrapOr(Promise.resolve(99), Promise.resolve(err<string>('x')));
        expect(v).toBe(99);
    });

    it('is curried', async () => {
        const v = await unwrapOr(0)(Promise.resolve(err<string>('x')));
        expect(v).toBe(0);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<ReturnType<typeof ok<number>>>(() => { /* never */ });
        const result = unwrapOr(0, pending);
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim (does not catch)', async () => {
        await expect(
            unwrapOr(0, Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
    });

    it('propagates a rejected Promise default as a thrown error', async () => {
        // `r.then(async inner => ... await defaultValue)` — a rejected
        // Promise default propagates verbatim.
        await expect(
            unwrapOr(Promise.reject('boom'), Promise.resolve(err<string>('x'))),
        ).rejects.toBe('boom');
    });
});