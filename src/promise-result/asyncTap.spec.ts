import { describe, it, expect, vi } from 'vitest';
import { asyncTap } from './index.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncTap', () => {
    it('calls side-effect on success and returns original Result', async () => {
        let side = 0;
        const mockFn = vi.fn().mockImplementation(async (v: number) => {
            side = v;
        });

        const original = ok<number>(5) as IResultOfT<number, string>;
        const r = await asyncTap(mockFn, original);

        expect(mockFn).toHaveBeenCalledOnce();
        expect(mockFn).toHaveBeenCalledWith(5);
        expect(side).toBe(5);
        expect(r).toBe(original);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value).toBe(5);
        }
    });

    it('does not call side-effect on failure and returns original Result', async () => {
        let side = 0;
        const mockFn = vi.fn().mockImplementation(async (v: number) => {
            side = v;
        });

        const original = err<string>('oops');
        const r = await asyncTap(mockFn, original);

        expect(mockFn).not.toHaveBeenCalled();
        expect(side).toBe(0);
        expect(r).toBe(original);
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error).toBe('oops');
        }
    });

    it('works in curried form', async () => {
        let side = 0;
        const mockFn = vi.fn().mockImplementation(async (v: number) => {
            side = v;
        });

        const original = ok<number>(5) as IResultOfT<number, string>;
        const tapFn = asyncTap(mockFn);
        const r = await tapFn(original);

        expect(mockFn).toHaveBeenCalledOnce();
        expect(mockFn).toHaveBeenCalledWith(5);
        expect(side).toBe(5);
        expect(r).toBe(original);
    });

    it('catches async throw from callback and returns Err', async () => {
        const error = new Error('async fail');
        const throwingFn = vi.fn().mockImplementation(async (_v: number) => {
            throw error;
        });

        const original = ok<number>(5) as IResultOfT<number, Error>;
        const r = await asyncTap(throwingFn, original);

        expect(throwingFn).toHaveBeenCalledOnce();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error).toBe(error);
        }
    });

    it('catches rejected promise from callback and returns Err', async () => {
        const error = new Error('async fail');
        const rejectingFn = vi.fn().mockImplementation(async (_v: number) => {
            return Promise.reject(error);
        });

        const original = ok<number>(5) as IResultOfT<number, Error>;
        const r = await asyncTap(rejectingFn, original);

        expect(rejectingFn).toHaveBeenCalledOnce();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error).toBe(error);
        }
    });

    it('catches sync throw from callback', async () => {
        const fn = (() => { throw new Error('sync-boom'); }) as unknown as (v: number) => Promise<void>;
        const r = await asyncTap(fn, ok<number>(5) as IResultOfT<number, Error>);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('sync-boom');
    });

    it('starts the async callback synchronously on construction (eager)', () => {
        let invokedSync = false;
        const r = asyncTap(async (_v: number) => {
            invokedSync = true;
        }, ok<number>(5) as IResultOfT<number, string>);
        expect(invokedSync).toBe(true);
        expect(r).toBeInstanceOf(Promise);
    });

    it('returns the *original* Result object by reference on success', async () => {
        // tap is identity on success — the input Result must be returned
        // verbatim. Any object identity check passes iff the implementation
        // is `Promise.resolve(r)` rather than a clone.
        const original = ok<number>(42) as IResultOfT<number, string>;
        const r = await asyncTap(async (_x: number) => { /* noop */ }, original);
        expect(r).toBe(original);
    });

    it('returns the *original* Result object by reference on failure', async () => {
        // tap does not invoke the callback on Err, and returns the input
        // Result verbatim.
        const original = err<string>('boom');
        const r = await asyncTap(async (_x: number) => { /* noop */ }, original);
        expect(r).toBe(original);
    });

    it('preserves the input E type on Err short-circuit (lift family — no widening)', async () => {
        // asyncTap is `Promise<IResultOfT<A, E>>` — the input E flows
        // through unchanged. No widening applies because the callback's
        // return value is discarded on the success branch and never
        // observed on the failure branch.
        type CustomErr = { kind: 'TapBoom'; id: number };
        const r = await asyncTap(async (_x: number) => { /* noop */ }, err<CustomErr>({ kind: 'TapBoom', id: 7 }));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            const e = r.error as CustomErr;
            expect(e.kind).toBe('TapBoom');
            expect(e.id).toBe(7);
        }
    });
});
