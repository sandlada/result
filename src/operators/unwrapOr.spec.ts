import { describe, it, expect, expectTypeOf } from 'vitest';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { ok, err } from '../factories/index.js';
import { unwrapOr } from './index.js';

describe('unwrapOr', () => {
    it('curried: returns value on success', () => {
        const extractor = unwrapOr(0);
        expect(extractor(ok(42))).toBe(42);
    });
    it('direct: returns value on success', () => {
        expect(unwrapOr(0, ok(42))).toBe(42);
    });
    it('curried: returns default on failure', () => {
        const extractor = unwrapOr(0);
        expect(extractor(err<string>('bad'))).toBe(0);
    });
    it('direct: returns default on failure', () => {
        expect(unwrapOr(0, err('bad'))).toBe(0);
    });

    it('default value is returned as-is on failure (Group B)', () => {
        const sentinel = 'fallback' as const;
        expect(unwrapOr(sentinel, err<string>('e'))).toBe('fallback');
    });

    it('value type is shared between default and success (Group B)', () => {
        const r = ok(7) as IResultOfT<number, string>;
        const v = unwrapOr(0, r);
        expectTypeOf(v).toBeNumber();
    });
});

