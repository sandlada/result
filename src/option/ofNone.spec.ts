import { describe, it, expect, expectTypeOf } from 'vitest';
import { ofNone, ofSome } from './index.js';
import type { IOptionNone, IOption } from '../../src/types/Option.js';

describe('ofNone()', () => {
    it('returns a None variant', () => {
        const opt = ofNone();
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
    });

    it('conforms to IOptionNone', () => {
        const opt: IOptionNone = ofNone() as unknown as IOptionNone;
        expect(opt.isSome).toBe(false);
    });

    it('conforms to IOption<never>', () => {
        const opt: IOption<never> = ofNone();
        expect(opt.isSome).toBe(false);
    });

    it('isNone and isSome are true/false literals (literal discrimination)', () => {
        const opt = ofNone();
        expectTypeOf(opt.isNone).toEqualTypeOf<true>();
        expectTypeOf(opt.isSome).toEqualTypeOf<false>();
    });

    it('forms a discriminated union with ofSome at the same call-site', () => {
        const some: IOption<number> = ofSome(1);
        const none: IOption<number> = ofNone();
        // discriminated union narrowing
        if (some.isSome) {
            expectTypeOf(some.value).toEqualTypeOf<number>();
        }
        if (none.isNone) {
            // value is not accessible on None variant
            expectTypeOf(none.isSome).toEqualTypeOf<false>();
        }
    });

    it('ofNone() returns an object with no value field (structural discrimination)', () => {
        const opt = ofNone();
        expect('value' in opt).toBe(false);
        expect(Object.keys(opt)).toEqual(['isSome', 'isNone']);
    });
});
