import { describe, it, expect, vi } from 'vitest';
import { asyncOk, asyncErr } from '../factories/index.js';
import { mapErrAsync } from './index.js';

describe('mapErrAsync', () => {
    it('maps error (curried)', async () => {
        const wrap = mapErrAsync((e: string) => `wrapped: ${e}`);
        const r = await wrap(asyncErr<string>('raw'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('wrapped: raw');
    });

    it('passes through success', async () => {
        const r = await mapErrAsync((e: string) => `wrapped: ${e}`, asyncOk(42));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('maps error asynchronously', async () => {
        const r = await mapErrAsync(
            async (code: number) => `HTTP ${code}`,
            asyncErr<number>(500),
        );
        if (!r.isSuccess) {
            expect(r.error).toBe('HTTP 500');
        }
    });

    it('catches callback exceptions', async () => {
        const r = await mapErrAsync(
            async () => { throw 'mapping failed'; },
            asyncErr<string>('original'),
        );
        if (!r.isSuccess) {
            expect(r.error).toBe('mapping failed');
        }
    });

    it('catches synchronous throw from the async mapper', async () => {
        // The mapper signature is `(e: E) => F | Promise<F>` — a sync throw
        // before returning a Promise is also caught and converted to Err.
        const mapper = (() => { throw new Error('sync-mapper-boom'); }) as unknown as (e: string) => Promise<never>;
        const r = await mapErrAsync(mapper, asyncErr<string>('original'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('sync-mapper-boom');
    });

    it('does not invoke the mapper on an Ok source', async () => {
        const mapper = vi.fn(async (e: string) => `wrapped: ${e}`);
        const r = await mapErrAsync(mapper, asyncOk(42));
        expect(mapper).not.toHaveBeenCalled();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('propagates outer Promise rejection verbatim (async family)', async () => {
        // Unlike `mapErr` (which also propagates outer rejection), this is the
        // async family's behavior on a rejected source Promise. The async
        // *mapper* failures are caught and converted to Err — outer rejection
        // is NOT.
        const mapper = vi.fn(async (e: string) => `wrapped: ${e}`);
        await expect(
            mapErrAsync(mapper, Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
        expect(mapper).not.toHaveBeenCalled();
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<Awaited<ReturnType<typeof asyncErr<string>>>>(() => { /* never resolves */ });
        const result = mapErrAsync(async (e: string) => e, pending);
        expect(result).toBeInstanceOf(Promise);
    });
});
