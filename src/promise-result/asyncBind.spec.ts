import { describe, it, expect, vi } from 'vitest';
import { asyncBind } from './index.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncBind', () => {
    it('chains async success (curried)', async () => {
        const chain = asyncBind(async (x: number) => ok(x * 2));
        const r = await chain(ok(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('chains async success (direct)', async () => {
        const r = await asyncBind(async (x: number) => ok(x * 2), ok(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through failure', async () => {
        const r = await asyncBind(async (x: number) => ok(x * 2), err<string>('fail'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });

    it('propagates async callback failure', async () => {
        const r = await asyncBind(async () => err<string>('inner'), ok(21));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('inner');
    });

    it('propagates async callback rejection (does not catch)', async () => {
        await expect(asyncBind(async () => { throw 'cb err'; }, ok(21))).rejects.toBe('cb err');
    });

    it('propagates sync throw from callback', async () => {
        const fn = (() => { throw new Error('sync-boom'); }) as unknown as (x: number) => Promise<never>;
        await expect(asyncBind(fn, ok(1))).rejects.toThrow('sync-boom');
    });

    it('does not invoke the callback on an Err source', async () => {
        const fn = vi.fn(async (x: number) => ok(x * 2));
        const r = await asyncBind(fn, err<string>('pre-fail'));
        expect(fn).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
    });

    it('drops the input E type on the success branch (lift error narrowing)', async () => {
        // G14 type-lie fix: the success path produces
        // `Promise<IResultOfT<B, F>>` — the input E is NOT widened into the
        // success branch. At runtime, the input E only flows through on the
        // failure short-circuit.
        type CustomErr = { kind: 'Input'; id: string };
        type BindErr = { kind: 'Bind'; reason: string };
        const r = await asyncBind(
            async (x: number) => ok<number>(x * 2) as IResultOfT<number, BindErr>,
            ok<number>(21) as IResultOfT<number, CustomErr>,
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        // The implementation uses `Promise.resolve(r.value).then(f)`. The
        // inner Promise is constructed synchronously, even though the
        // callback is async.
        const result = asyncBind(async (x: number) => ok(x), ok(21));
        expect(result).toBeInstanceOf(Promise);
    });

    it('attaches the async callback to the inner Promise on construction (eager)', () => {
        // The implementation is `Promise.resolve(r.value).then(f)` — `f` is
        // invoked asynchronously (next microtask), but the Promise chain
        // is set up synchronously. This is the eager-Promise property: the
        // helper attaches handlers without waiting for an explicit `.then`.
        const r = asyncBind(async (x: number) => ok(x * 2), ok(21));
        expect(r).toBeInstanceOf(Promise);
    });
});
