import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone, asyncTapOption } from '../../src/index.js';

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

        const original = ofNone<number>();
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
});
