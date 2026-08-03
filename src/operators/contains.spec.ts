import { describe, it, expect, expectTypeOf } from 'vitest';
import { ok, err } from '../factories/index.js';
import { contains } from './index.js';

describe('contains', () => {
    it('curried form', () => {
        const isFortyTwo = contains(42);
        expect(isFortyTwo(ok(42))).toBe(true);
        expect(isFortyTwo(ok(7))).toBe(false);
        expect(isFortyTwo(err<Error>(new Error('err')))).toBe(false);
    });

    it('direct form', () => {
        expect(contains(42, ok(42))).toBe(true);
        expect(contains(42, ok(7))).toBe(false);
        expect(contains(42, err<string>('e'))).toBe(false);
    });

    it('literal target type is preserved (Group B)', () => {
        const target = 'specific' as const;
        const isSpecific = contains(target);
        const r = ok('specific' as const);
        if (r.isSuccess) expectTypeOf(r.value).toEqualTypeOf<'specific'>();
        expect(isSpecific(r)).toBe(true);
    });

    it('returns false for failure regardless of target (Group C)', () => {
        expect(contains('x', err<string>('err'))).toBe(false);
    });
});

