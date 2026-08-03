import { describe, it, expect, vi } from 'vitest';
import { filterOrElseAsync } from './index.js';
import { ok, err } from '../factories/index.js';

describe('filterOrElseAsync', () => {
    const isEven = async (x: number) => x % 2 === 0;
    const errorFn = async (x: number) => `${x} is odd`;

    it('returns success if predicate matches (curried)', async () => {
        const filterEven = filterOrElseAsync(isEven, errorFn);
        const r = await filterEven(Promise.resolve(ok(42)));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('returns success if predicate matches (direct)', async () => {
        const r = await filterOrElseAsync(isEven, errorFn, Promise.resolve(ok(42)));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('returns err if predicate does not match', async () => {
        const r = await filterOrElseAsync(isEven, errorFn, Promise.resolve(ok(21)));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('21 is odd');
    });

    it('passes through existing failure', async () => {
        const r = await filterOrElseAsync(isEven, errorFn, Promise.resolve(err<string>('original')));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('original');
    });

    it('works with sync predicate and sync errorFn', async () => {
        const r = await filterOrElseAsync(
            (x: number) => x > 10,
            (x: number) => `too small: ${x}`,
            Promise.resolve(ok(5)),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('too small: 5');
    });

    it('propagates sync predicate throw (does not catch)', async () => {
        await expect(filterOrElseAsync(
            () => { throw new Error('predicate boom'); },
            (x: number) => `too small: ${x}`,
            Promise.resolve(ok(5)),
        )).rejects.toThrow('predicate boom');
    });

    it('propagates async predicate rejection (does not catch)', async () => {
        await expect(filterOrElseAsync(
            async () => { throw new Error('predicate boom'); },
            (x: number) => `too small: ${x}`,
            Promise.resolve(ok(5)),
        )).rejects.toThrow('predicate boom');
    });

    it('propagates errorFn throw (does not catch)', async () => {
        await expect(filterOrElseAsync(
            (x: number) => x > 10,
            () => { throw new Error('errorFn boom'); },
            Promise.resolve(ok(5)),
        )).rejects.toThrow('errorFn boom');
    });

    it('does not invoke the predicate on an Err source', async () => {
        const pred = vi.fn(async (x: number) => x > 10);
        const eFn = vi.fn(async (x: number) => `${x} bad`);
        const r = await filterOrElseAsync(pred, eFn, Promise.resolve(err<string>('pre-fail')));
        expect(pred).not.toHaveBeenCalled();
        expect(eFn).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<ReturnType<typeof ok<number>>>(() => { /* never */ });
        const result = filterOrElseAsync(isEven, errorFn, pending);
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim', async () => {
        await expect(
            filterOrElseAsync(isEven, errorFn, Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
    });
});
