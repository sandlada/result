import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { map } from './map.js';

describe('promise-result map (sync)', () => {
    it('maps Ok', async () => {
        const r = await map((x: number) => x * 2, Promise.resolve(ok(21)));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through Err', async () => {
        const r = await map((x: number) => x * 2, Promise.resolve(err<string>('x')));
        expect(r.isSuccess).toBe(false);
    });

    it('catches sync throws and converts to Err', async () => {
        const r = await map(() => { throw new Error('boom'); }, Promise.resolve(ok(1)));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect((r.error as Error).message).toBe('boom');
    });

    it('is curried', async () => {
        const r = await map((x: number) => x * 2)(Promise.resolve(ok(11)));
        if (r.isSuccess) expect(r.value).toBe(22);
    });

    it('does not invoke the mapper when the source rejects', async () => {
        // The outer Promise rejects — the mapper must never run. Policy:
        // the `.then` callback never fires on a rejected promise, so the
        // mapper is skipped entirely.
        const mapper = vi.fn((x: number) => x * 2);
        await expect(
            map(mapper, Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
        expect(mapper).not.toHaveBeenCalled();
    });

    it('preserves the outer rejection reason verbatim', async () => {
        // The mapper is sync; rejection from the outer Promise propagates as
        // a rejection from the chained result — no Err wrapping.
        await expect(
            map((x: number) => x * 2, Promise.reject('boom')),
        ).rejects.toBe('boom');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        // The implementation is `r.then(...)`; calling `map(...)` already
        // attaches a `.then` handler to the source Promise, so the work
        // pipeline is in place synchronously.
        const pending = new Promise<ReturnType<typeof ok<number>>>(() => { /* never resolves */ });
        const result = map((x: number) => x, pending);
        expect(result).toBeInstanceOf(Promise);
        // Sanity check: still pending, no synchronous resolution.
        let settled = false;
        void result.then(() => { settled = true; }, () => { settled = true; });
        expect(settled).toBe(false);
    });

    it('preserves a rejected source via promise rejection (not via Err wrapping)', async () => {
        // Outer-level rejection (not a value-level Err) propagates as a
        // rejected Promise — different from `mapAsync`, which catches a
        // rejected Promise from the *callback* and converts it to Err.
        const r = map((x: number) => x, Promise.reject(new Error('outer-reject')));
        await expect(r).rejects.toThrow('outer-reject');
    });
});