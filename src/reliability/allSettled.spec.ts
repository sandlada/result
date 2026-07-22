import { describe, it, expect } from 'vitest';
import { allSettled } from './index.js';
import { ok, err } from '../index.js';

describe('allSettled', () => {
    it('collects every outcome in input order', async () => {
        const ar1 = { run: () => Promise.resolve(ok(1)) };
        const ar2 = { run: () => Promise.resolve(err<string>('a')) };
        const ar3 = { run: () => Promise.resolve(ok(3)) };
        const r = await allSettled([ar1, ar2, ar3]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value).toEqual([
                { ok: true, value: 1 },
                { ok: false, error: 'a' },
                { ok: true, value: 3 },
            ]);
        }
    });

    it('always succeeds', async () => {
        const ar1 = { run: () => Promise.resolve(err<string>('a')) };
        const ar2 = { run: () => Promise.resolve(err<string>('b')) };
        const r = await allSettled([ar1, ar2]).run();
        expect(r.isSuccess).toBe(true);
    });

    it('Ok([]) on empty input', async () => {
        const r = await allSettled([]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('captures rejections as failures', async () => {
        const ar1 = { run: () => Promise.reject(new Error('boom')) };
        const ar2 = { run: () => Promise.resolve(ok(2)) };
        const r = await allSettled([ar1, ar2]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value[0]!.ok).toBe(false);
            expect((r.value[0] as { ok: false; error: unknown }).error).toBeInstanceOf(Error);
            expect(r.value[1]!.ok).toBe(true);
        }
    });
});