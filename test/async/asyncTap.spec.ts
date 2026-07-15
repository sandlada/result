import { describe, it, expect, vi } from 'vitest';
import { ok, err, asyncTap } from '../../src/index.js';

describe('asyncTap', () => {
    it('calls side-effect on success and returns original Result', async () => {
        let side = 0;
        const mockFn = vi.fn().mockImplementation(async (v: number) => {
            side = v;
        });

        const original = ok<number, string>(5);
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

        const original = ok<number, string>(5);
        const tapFn = asyncTap(mockFn);
        const r = await tapFn(original);

        expect(mockFn).toHaveBeenCalledOnce();
        expect(mockFn).toHaveBeenCalledWith(5);
        expect(side).toBe(5);
        expect(r).toBe(original);
    });

    it('catches synchronous throw from callback and returns Err', async () => {
        const error = new Error('sync fail');
        const throwingFn = vi.fn().mockImplementation(async (_v: number) => {
            throw error;
        });

        const original = ok<number, Error>(5);
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

        const original = ok<number, Error>(5);
        const r = await asyncTap(rejectingFn, original);

        expect(rejectingFn).toHaveBeenCalledOnce();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error).toBe(error);
        }
    });
});
