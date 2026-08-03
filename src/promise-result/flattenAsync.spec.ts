import { describe, it, expect } from 'vitest';
import { flattenAsync } from './index.js';
import { ok, err } from '../factories/index.js';

describe('flattenAsync', () => {
    it('flattens nested success', async () => {
        const r = await flattenAsync(Promise.resolve(ok(ok(42))));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('flattens inner failure', async () => {
        const r = await flattenAsync(Promise.resolve(ok(err<string>('inner'))));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('inner');
    });

    it('passes through outer failure', async () => {
        const r = await flattenAsync(Promise.resolve(err<string>('outer')));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('outer');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<ReturnType<typeof ok<ReturnType<typeof ok<number>>>>>(() => { /* never */ });
        const result = flattenAsync(pending);
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates an outer Promise rejection verbatim', async () => {
        await expect(
            flattenAsync(Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
    });

    it('only flattens one layer (single-step guarantee)', async () => {
        // The signature is `Promise<IResultOfT<IResultOfT<A, E>, E>>` — it
        // unwraps exactly one layer, leaving the deeper nest intact.
        const deep = ok(ok(ok(42)));
        const r = await flattenAsync<ReturnType<typeof ok<number>>, string>(Promise.resolve(deep));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            // The inner value is still wrapped in Ok — flattenAsync only
            // removed one layer.
            expect(r.value.isSuccess).toBe(true);
            if (r.value.isSuccess) expect(r.value.value).toBe(42);
        }
    });
});
