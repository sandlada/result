import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { exists } from './index.js';

describe('exists', () => {
    it('curried form', () => {
        const isPositive = exists((n: number) => n > 0);
        expect(isPositive(ok(5))).toBe(true);
        expect(isPositive(ok(-1))).toBe(false);
        expect(isPositive(err<Error>(new Error('err')))).toBe(false);
    });

    it('direct form', () => {
        const isPositive = (n: number) => n > 0;
        expect(exists(isPositive, ok(5))).toBe(true);
        expect(exists(isPositive, ok(-1))).toBe(false);
        expect(exists(isPositive, err<string>('e'))).toBe(false);
    });

    it('does NOT call predicate on failure (Group C)', () => {
        const pred = vi.fn((_n: number) => true);
        exists(pred, err<string>('e'));
        expect(pred).toHaveBeenCalledTimes(0);
    });

    it('calls predicate exactly once on success (Group C)', () => {
        const pred = vi.fn((_n: number) => true);
        exists(pred, ok(5));
        expect(pred).toHaveBeenCalledTimes(1);
    });
});

