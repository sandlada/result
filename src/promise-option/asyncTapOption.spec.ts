import { describe, it, expect, vi } from 'vitest';
import { asyncTapOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

describe('asyncTapOption', () => {
    it('calls side-effect on success (isSome = true) and returns original Option', async () => {
        let side = 0;
        const mockFn = vi.fn().mockImplementation(async (v: number) => {
            side = v;
        });

        const original = ofSome<number>(5);
        const r = await asyncTapOption(mockFn, original);

        expect(mockFn).toHaveBeenCalledOnce();
        expect(mockFn).toHaveBeenCalledWith(5);
        expect(side).toBe(5);
        expect(r).toBe(original);
        expect(r.isSome).toBe(true);
        if (r.isSome) {
            expect(r.value).toBe(5);
        }
    });

    it('does not call side-effect on failure (isSome = false) and returns original Option', async () => {
        let side = 0;
        const mockFn = vi.fn().mockImplementation(async (v: number) => {
            side = v;
        });

        const original = ofNone();
        const r = await asyncTapOption(mockFn, original);

        expect(mockFn).not.toHaveBeenCalled();
        expect(side).toBe(0);
        expect(r).toBe(original);
        expect(r.isSome).toBe(false);
    });

    it('works in curried form', async () => {
        let side = 0;
        const mockFn = vi.fn().mockImplementation(async (v: number) => {
            side = v;
        });

        const original = ofSome<number>(10);
        const tapOptionFn = asyncTapOption(mockFn);
        const r = await tapOptionFn(original);

        expect(mockFn).toHaveBeenCalledOnce();
        expect(mockFn).toHaveBeenCalledWith(10);
        expect(side).toBe(10);
        expect(r).toBe(original);
        expect(r.isSome).toBe(true);
        if (r.isSome) {
            expect(r.value).toBe(10);
        }
    });

    it('converts to None when the callback throws synchronously', async () => {
        const badFn: (a: number) => Promise<void | unknown> = () => {
            throw new Error('sync boom');
        };
        const r = await asyncTapOption(badFn, ofSome<number>(5));
        expect(r.isSome).toBe(false);
    });

    it('propagates a rejected Promise from the callback (promotion-family rule)', async () => {
        const rejectFn = async (_a: number) => { throw new Error('async boom'); };
        await expect(asyncTapOption(rejectFn, ofSome<number>(7))).rejects.toThrow('async boom');
    });

    it('returns Option by reference on None (no wrapping)', async () => {
        // asyncTapOption short-circuits on None via `Promise.resolve(opt)`,
        // returning the original input unchanged.
        const original = ofNone();
        const r = await asyncTapOption(async (_v: number) => { /* noop */ }, original);
        expect(r).toBe(original);
        expect(r.isNone).toBe(true);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = asyncTapOption(async (_v: number) => { /* noop */ }, ofSome<number>(5));
        expect(r).toBeInstanceOf(Promise);
    });

    it('captures a sync throw as None but propagates an async rejection', async () => {
        const thrown = new Error('hide-me');
        const r1 = await asyncTapOption(() => { throw thrown; }, ofSome<number>(1));
        expect(r1.isNone).toBe(true);

        await expect(asyncTapOption(
            async () => { throw thrown; },
            ofSome<number>(1),
        )).rejects.toBe(thrown);
    });
});
