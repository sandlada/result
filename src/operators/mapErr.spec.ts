import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { mapErr } from './index.js';

describe('mapErr', () => {
    const toUpper = (e: string) => e.toUpperCase();

    it('curried: mapErr(fn) transforms failure error', () => {
        const upperErr = mapErr(toUpper);
        const result = upperErr(err('bad'));
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('BAD');
    });

    it('direct: mapErr(fn, failure) transforms error', () => {
        const result = mapErr(toUpper, err('bad'));
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('BAD');
    });

    it('success passes through unchanged (curried)', () => {
        const upperErr = mapErr(toUpper);
        const result = upperErr(ok(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('success passes through unchanged (direct)', () => {
        const result = mapErr(toUpper, ok(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('propagates fn throw (does not catch)', () => {
        expect(() => mapErr<string, string, never>(
            () => { throw new Error('fn-boom'); },
            err('original'),
        )).toThrow('fn-boom');
    });

    it('does NOT call fn on success (Group C)', () => {
        const fn = vi.fn((_e: string) => 'x');
        mapErr(fn, ok(42));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('calls fn exactly once on failure (Group C)', () => {
        const fn = vi.fn((_e: string) => 'x');
        mapErr(fn, err('e'));
        expect(fn).toHaveBeenCalledTimes(1);
    });
});
