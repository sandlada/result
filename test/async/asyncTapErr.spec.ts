import { describe, it, expect, vi } from 'vitest';
import { ok, err, asyncTapErr } from '../../src/index.js';

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

        const original = ok<number, string>(5);
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
});
