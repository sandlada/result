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
});