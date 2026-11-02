import { describe, it, expect, vi } from 'vitest';
import { tap } from './tap.js';
import { ofSome, ofNone } from '../option/index.js';

describe('tap', () => {
    it('calls side-effect on success (isSome = true) and returns original Option', async () => {
        let side = 0;
        const mockFn = vi.fn().mockImplementation(async (v: number) => {
            side = v;
        });

        const original = ofSome<number>(5);
        const r = await tap(mockFn, original);

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
        const r = await tap(mockFn, original);

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
        const tapOptionFn = tap(mockFn);
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
        const r = await tap(badFn, ofSome<number>(5));
        expect(r.isSome).toBe(false);
    });

    it('propagates a rejected Promise from the callback (promotion-family rule)', async () => {
        const rejectFn = async (_a: number) => { throw new Error('async boom'); };
        await expect(tap(rejectFn, ofSome<number>(7))).rejects.toThrow('async boom');
    });

    it('returns Option by reference on None (no wrapping)', async () => {
        // tap short-circuits on None via `Promise.resolve(opt)`,
        // returning the original input unchanged.
        const original = ofNone<number>();
        const r = await tap(async (_v: number) => { /* noop */ }, original);
        expect(r).toBe(original);
        expect(r.isNone).toBe(true);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = tap(async (_v: number) => { /* noop */ }, ofSome<number>(5));
        expect(r).toBeInstanceOf(Promise);
    });

    it('captures a sync throw as None but propagates an async rejection', async () => {
        const thrown = new Error('hide-me');
        const r1 = await tap(() => { throw thrown; }, ofSome<number>(1));
        expect(r1.isNone).toBe(true);

        await expect(tap(
            async () => { throw thrown; },
            ofSome<number>(1),
        )).rejects.toBe(thrown);
    });
});

describe('misused callback contract', () => {
    it('converts a synchronous callback into None instead of throwing synchronously', async () => {
        const r = await tap((() => undefined) as never, ofSome(21));
        expect(r.isNone).toBe(true);
    });
});