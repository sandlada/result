import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { ap } from './ap.js';

describe('promise-result ap', () => {
    it('applies fn to value when both Ok', async () => {
        const r = await ap(Promise.resolve(ok((x: number) => x * 2)), Promise.resolve(ok(21)));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('propagates fn Err', async () => {
        const r = await ap(Promise.resolve(err<string>('fn-err')), Promise.resolve(ok(21)));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('fn-err');
    });

    it('propagates value Err', async () => {
        const r = await ap(Promise.resolve(ok((x: number) => x * 2)), Promise.resolve(err<string>('val-err')));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('val-err');
    });

    it('is curried', async () => {
        const applier = ap(Promise.resolve(ok((x: number) => x * 2)));
        const r = await applier(Promise.resolve(ok(21)));
        if (r.isSuccess) expect(r.value).toBe(42);
    });
});