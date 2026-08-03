import { describe, it, expect, vi } from 'vitest';
import { asyncOk, asyncErr } from '../factories/index.js';
import { mapAsync } from './index.js';

describe('mapAsync', () => {
    it('maps success value (curried)', async () => {
        const double = mapAsync((x: number) => x * 2);
        const r = await double(asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('maps success value (direct)', async () => {
        const r = await mapAsync((x: number) => x * 2, asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through failure', async () => {
        const r = await mapAsync((x: number) => x * 2, asyncErr<string>('fail'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });

    it('maps with async callback (curried)', async () => {
        const doubleAsync = mapAsync(async (x: number) => x * 2);
        const r = await doubleAsync(asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('catches callback exceptions', async () => {
        const r = await mapAsync(async () => { throw 'callback err'; }, asyncOk(1));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('callback err');
    });

    it('catches synchronous throw from the mapper (callback policy)', async () => {
        // Distinct from `map` (sync): the mapper is `B | Promise<B>`, so a
        // sync throw before returning a Promise is caught and converted to
        // Err — same policy as an async rejection. This is what makes the
        // async family safe for arbitrary callback shapes.
        const mapper = (() => { throw new Error('sync-cb-boom'); }) as unknown as (x: number) => Promise<number>;
        const r = await mapAsync(mapper, asyncOk(1));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('sync-cb-boom');
    });

    it('catches rejected Promise from async mapper and converts to Err', async () => {
        // Canonical async family policy: async rejections from the mapper
        // become Err values, NOT promise rejections. This is the defining
        // difference from the sync `map` family (where outer rejection
        // propagates verbatim).
        const mapper = async () => { throw new Error('async-reject'); };
        const r = await mapAsync(mapper, asyncOk(1));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('async-reject');
    });

    it('does not invoke the mapper on a failure source', async () => {
        const mapper = vi.fn(async (x: number) => x * 2);
        const r = await mapAsync(mapper, asyncErr<string>('fail'));
        expect(mapper).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<Awaited<ReturnType<typeof asyncOk<number>>>>(() => { /* never resolves */ });
        const result = mapAsync(async (x: number) => x, pending);
        expect(result).toBeInstanceOf(Promise);
    });
});
