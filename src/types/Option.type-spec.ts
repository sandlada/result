import { describe, it, expectTypeOf } from 'vitest';
import type { IOption, IOptionSome, IOptionNone } from './Option.js';
import { ofSome, ofNone } from '../option/index.js';

describe('Option types', () => {
    it('IOptionSome has literal true/false flags', () => {
        expectTypeOf<IOptionSome<number>['isSome']>().toEqualTypeOf<true>();
        expectTypeOf<IOptionSome<number>['isNone']>().toEqualTypeOf<false>();
    });

    it('IOptionNone has literal false/true flags', () => {
        expectTypeOf<IOptionNone['isSome']>().toEqualTypeOf<false>();
        expectTypeOf<IOptionNone['isNone']>().toEqualTypeOf<true>();
    });

    it('IOptionSome carries the value', () => {
        type S = IOptionSome<number>;
        const _check: S = { isSome: true, isNone: false, value: 42 };
        expectTypeOf(_check.value).toEqualTypeOf<number>();
    });

    it('IOption is the discriminated union of Some and None', () => {
        const some: IOption<number> = ofSome(42);
        const none: IOption<number> = ofNone();
        expectTypeOf(some).toBeObject();
        expectTypeOf(none).toBeObject();
    });

    it('ofSome(value) is assignable to IOption<T>', () => {
        const opt = ofSome(42);
        const _check: IOption<number> = opt;
        expectTypeOf(_check).toBeObject();
    });

    it('ofNone() is assignable to IOption<T>', () => {
        const opt = ofNone();
        const _check: IOption<number> = opt;
        expectTypeOf(_check).toBeObject();
    });

    it('narrowing on Some yields value', () => {
        const opt = ofSome(42);
        if (opt.isSome) {
            expectTypeOf(opt.value).toEqualTypeOf<number>();
        }
    });

    it('narrowing on None exposes no value (compile-time absence)', () => {
        const opt = ofNone();
        if (opt.isNone) {
            expectTypeOf<keyof IOptionNone>().toEqualTypeOf<'isSome' | 'isNone'>();
        }
    });

    // ---------------------------------------------------------------------
    // Union identity
    // ---------------------------------------------------------------------

    it('IOption<T> is exactly the union of its two variants', () => {
        expectTypeOf<IOption<number>>().toEqualTypeOf<IOptionSome<number> | IOptionNone>();
    });

    it('IOptionNone is not generic and is shared by every IOption<T>', () => {
        expectTypeOf<IOptionNone>().toExtend<IOption<number>>();
        expectTypeOf<IOptionNone>().toExtend<IOption<string>>();
        expectTypeOf<IOptionNone>().toExtend<IOption<never>>();
    });

    // ---------------------------------------------------------------------
    // Narrowing
    // ---------------------------------------------------------------------

    it('narrowing on isSome yields exactly one variant on each branch', () => {
        const opt = null as unknown as IOption<number>;
        if (opt.isSome) {
            expectTypeOf(opt).toEqualTypeOf<IOptionSome<number>>();
        } else {
            expectTypeOf(opt).toEqualTypeOf<IOptionNone>();
        }
    });

    it('isNone is an equally valid discriminant', () => {
        const opt = null as unknown as IOption<number>;
        if (opt.isNone) {
            expectTypeOf(opt).toEqualTypeOf<IOptionNone>();
        } else {
            expectTypeOf(opt.value).toEqualTypeOf<number>();
        }
    });

    it('the union is exhaustive: both discriminants together leave never', () => {
        const exhaustive = (opt: IOption<number>): number => {
            if (opt.isSome) return opt.value;
            if (opt.isNone) return -1;
            const unreachable: never = opt;
            return unreachable;
        };
        expectTypeOf(exhaustive).toEqualTypeOf<(opt: IOption<number>) => number>();
    });

    // ---------------------------------------------------------------------
    // Negative constraints
    // ---------------------------------------------------------------------

    it('the None variant does not expose value', () => {
        const opt = null as unknown as IOption<number>;
        if (opt.isNone) {
            // @ts-expect-error `value` only exists on the Some variant
            opt.value;
        }
    });

    it('the Some variant requires value to be present', () => {
        // @ts-expect-error `value` is required on IOptionSome
        const _bad: IOptionSome<number> = { isSome: true, isNone: false };
        expectTypeOf<keyof IOptionSome<number>>().toEqualTypeOf<'isSome' | 'isNone' | 'value'>();
    });

    it('value stays a required key even when T includes undefined', () => {
        // @ts-expect-error `value` is required, not optional, for IOptionSome<undefined>
        const _missing: IOptionSome<undefined> = { isSome: true, isNone: false };
        const _explicit: IOptionSome<undefined> = { isSome: true, isNone: false, value: undefined };
        expectTypeOf(_explicit.value).toEqualTypeOf<undefined>();
    });

    it('the discriminant flags may not disagree', () => {
        // @ts-expect-error isNone must be true on the None variant
        const _bad: IOptionNone = { isSome: false, isNone: false };
        expectTypeOf<IOptionNone>().toBeObject();
    });

    it('every field is readonly', () => {
        const some: IOptionSome<number> = { isSome: true, isNone: false, value: 1 };
        // @ts-expect-error value is readonly
        some.value = 2;
        const none: IOptionNone = { isSome: false, isNone: true };
        // @ts-expect-error isNone is readonly
        none.isNone = true;
    });

    it('the two variants are not assignable to one another', () => {
        expectTypeOf<IOptionSome<number>>().not.toExtend<IOptionNone>();
        expectTypeOf<IOptionNone>().not.toExtend<IOptionSome<number>>();
    });

    // ---------------------------------------------------------------------
    // Generic flow
    // ---------------------------------------------------------------------

    it('IOption is covariant in T', () => {
        expectTypeOf<IOption<number>>().toExtend<IOption<number | string>>();
        expectTypeOf<IOption<number | string>>().not.toExtend<IOption<number>>();
        expectTypeOf<IOption<never>>().toExtend<IOption<number>>();
    });

    it('literal value types are preserved, not widened', () => {
        expectTypeOf<IOptionSome<'a'>['value']>().toEqualTypeOf<'a'>();
        const literal = ofSome('a' as const);
        expectTypeOf(literal).toEqualTypeOf<IOption<'a'>>();
    });

    it('ofSome returns the full union, so isSome must still be checked', () => {
        expectTypeOf(ofSome(42)).toEqualTypeOf<IOption<number>>();
        const opt = ofSome(42);
        // @ts-expect-error the declared return type is the union; `value` needs narrowing
        opt.value;
    });

    it('ofNone() infers IOption<never> and widens to any IOption<T>', () => {
        expectTypeOf(ofNone()).toEqualTypeOf<IOption<never>>();
        const _widened: IOption<string> = ofNone();
        expectTypeOf(_widened).toEqualTypeOf<IOption<string>>();
    });
});
