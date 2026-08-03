import { describe, it, expect, vi } from 'vitest';
import { asyncTapErr } from './index.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncTapErr', () => {
    it('calls side-effect on failure and returns original Result', async () => {
        let side = '';
        const mockFn = vi.fn().mockImplementation(async (e: string) => {
            side = e;
        });

        const original = err<string>('oops');
        const r = await asyncTapErr(mockFn, original);

        expect(mockFn).toHaveBeenCalledOnce();
        expect(mockFn).toHaveBeenCalledWith('oops');
        expect(side).toBe('oops');
        expect(r).toBe(original);
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error).toBe('oops');
        }
    });

    it('does not call side-effect on success and returns original Result', async () => {
        let side = '';
        const mockFn = vi.fn().mockImplementation(async (e: string) => {
            side = e;
        });

        const original = ok<number>(5) as IResultOfT<number, string>;
        const r = await asyncTapErr(mockFn, original);

        expect(mockFn).not.toHaveBeenCalled();
        expect(side).toBe('');
        expect(r).toBe(original);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value).toBe(5);
        }
    });

    it('works in curried form', async () => {
        let side = '';
        const mockFn = vi.fn().mockImplementation(async (e: string) => {
            side = e;
        });

        const original = err<string>('oops');
        const tapErrFn = asyncTapErr(mockFn);
        const r = await tapErrFn(original);

        expect(mockFn).toHaveBeenCalledOnce();
        expect(mockFn).toHaveBeenCalledWith('oops');
        expect(side).toBe('oops');
        expect(r).toBe(original);
    });

    it('catches async throw from callback and returns Err', async () => {
        const error = new Error('async fail');
        const throwingFn = vi.fn().mockImplementation(async (_e: string) => {
            throw error;
        });

        const original = err<string>('oops') as IResultOfT<string, Error>;
        const r = await asyncTapErr(throwingFn, original);

        expect(throwingFn).toHaveBeenCalledOnce();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error).toBe(error);
        }
    });

    it('catches rejected promise from callback and returns Err', async () => {
        const error = new Error('async fail');
        const rejectingFn = vi.fn().mockImplementation(async (_e: string) => {
            return Promise.reject(error);
        });

        const original = err<string>('oops') as IResultOfT<string, Error>;
        const r = await asyncTapErr(rejectingFn, original);

        expect(rejectingFn).toHaveBeenCalledOnce();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error).toBe(error);
        }
    });

    it('catches sync throw from callback', async () => {
        const fn = (() => { throw new Error('sync-boom'); }) as unknown as (e: string) => Promise<void>;
        const r = await asyncTapErr(fn, err<string>('oops'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as unknown as Error).message).toBe('sync-boom');
    });

    it('starts the async callback synchronously on construction (eager)', () => {
        let invokedSync = false;
        const r = asyncTapErr(async (_e: string) => {
            invokedSync = true;
        }, err<string>('boom'));
        expect(invokedSync).toBe(true);
        expect(r).toBeInstanceOf(Promise);
    });

    it('returns the *original* Result object by reference on both branches', async () => {
        // tapErr is identity — the input Result must be returned verbatim.
        const onOk = ok<number>(42) as IResultOfT<number, string>;
        const onErr = err<string>('boom');
        const rOk = await asyncTapErr(async (_e: string) => { /* noop */ }, onOk);
        const rErr = await asyncTapErr(async (_e: string) => { /* noop */ }, onErr);
        expect(rOk).toBe(onOk);
        expect(rErr).toBe(onErr);
    });

    it('passes the original error value to the callback (lifting from sync)', async () => {
        let captured: unknown = undefined;
        const f = vi.fn(async (e: { code: number; msg: string }) => {
            captured = e;
        });
        await asyncTapErr(f, err<{ code: number; msg: string }>({ code: 5, msg: 'tap' }));
        expect(captured).toEqual({ code: 5, msg: 'tap' });
    });
});
