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
});
