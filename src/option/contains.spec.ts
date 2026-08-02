import { describe, it, expect, expectTypeOf } from 'vitest';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../../src/types/Option.js';
import { contains } from '../../src/option/index.js';

describe('Option — contains', () => {
    it('Some with matching value returns true', () => {
        expect(contains(42)(ofSome(42))).toBe(true);
    });

    it('Some with non-matching value returns false', () => {
        expect(contains(99)(ofSome(42))).toBe(false);
    });

    it('None returns false', () => {
        expect(contains(42)(ofNone() as IOption<number>)).toBe(false);
    });

    it('curried form', () => {
        const isFortyTwo = contains(42);
        expect(isFortyTwo(ofSome(42))).toBe(true);
        expect(isFortyTwo(ofSome(7))).toBe(false);
        expect(isFortyTwo(ofNone() as IOption<number>)).toBe(false);
    });

    it('uses strict equality — NaN never equals target', () => {
        const result = contains(NaN)(ofSome(NaN));
        // NaN !== NaN per spec, so contains always returns false for NaN
        expect(result).toBe(false);
    });

    it('target literal type is preserved — generic narrowing (Group B)', () => {
        const target = 'specific' as const;
        const isSpecific = contains(target);
        type Fn = typeof isSpecific;
        expectTypeOf<Fn>().toEqualTypeOf<(opt: IOption<'specific'>) => boolean>();
    });

    it('target identity check — same object reference returns true', () => {
        const sentinel = { id: 1 };
        expect(contains(sentinel)(ofSome(sentinel))).toBe(true);
        expect(contains(sentinel)(ofSome({ id: 1 }))).toBe(false);
    });
});
