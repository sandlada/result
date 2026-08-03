import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { swap, unwrap } from './index.js';

describe('swap', () => {
    it('success becomes failure', () => {
        const r: IResultOfT<string, number> = ok('hello');
        const swapped = swap(r);
        expect(swapped.isSuccess).toBe(false);
        expect(swapped.isFailure).toBe(true);
    });
    it('failure becomes success', () => {
        const r: IResultOfT<string, number> = err<number>(404) as unknown as IResultOfT<string, number>;
        const swapped = swap(r);
        expect(swapped.isSuccess).toBe(true);
        expect(unwrap(swapped)).toBe(404);
    });

    it('swap twice is identity on track shape (Group B)', () => {
        const r: IResultOfT<string, number> = ok('hello');
        const once = swap(r);
        const twice = swap(once);
        expect(twice.isSuccess).toBe(true);
        if (twice.isSuccess) expect(twice.value).toBe('hello');
    });

    it('preserves the value on success-flip and error on failure-flip (Group B)', () => {
        const r1: IResultOfT<string, number> = ok('hello');
        const s1 = swap(r1);
        if (s1.isFailure) expect(s1.error).toBe('hello');

        const r2: IResultOfT<string, number> = err<number>(404) as unknown as IResultOfT<string, number>;
        const s2 = swap(r2);
        if (s2.isSuccess) expect(s2.value).toBe(404);
    });
});

