import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { mapErr } from './mapErr.js';

describe('promise-result mapErr (sync)', () => {
    it('maps Err', async () => {
        const r = await mapErr((e: string) => e.toUpperCase(), Promise.resolve(err('boom')));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('BOOM');
    });

    it('passes through Ok', async () => {
        const r = await mapErr((e: string) => e.toUpperCase(), Promise.resolve(ok(42)));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('catches sync throws and converts to Err', async () => {
        const r = await mapErr(() => { throw new Error('boom'); }, Promise.resolve(err('x')));
        expect(r.isSuccess).toBe(false);
    });

    it('is curried', async () => {
        const r = await mapErr((e: string) => e.length)(Promise.resolve(err('boom')));
        if (!r.isSuccess) expect(r.error).toBe(4);
    });

    it('does not invoke the mapper on a resolved Ok source', async () => {
        const mapper = vi.fn((e: string) => e.toUpperCase());
        await mapErr(mapper, Promise.resolve(ok(42)));
        expect(mapper).not.toHaveBeenCalled();
    });

    it('propagates an outer Promise rejection verbatim', async () => {
        // The mapper is sync; rejection from the outer Promise is not
        // wrapped into Err — it propagates as a rejected Promise.
        const mapper = vi.fn((e: string) => e.toUpperCase());
        await expect(
            mapErr(mapper, Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
        expect(mapper).not.toHaveBeenCalled();
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<ReturnType<typeof err<string>>>(() => { /* never resolves */ });
        const result = mapErr((e: string) => e, pending);
        expect(result).toBeInstanceOf(Promise);
    });
});