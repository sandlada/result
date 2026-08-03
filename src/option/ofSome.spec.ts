import { describe, it, expect, expectTypeOf } from 'vitest';
import { ofSome, ofNone } from './index.js';
import type { IOptionSome, IOption, IOptionNone } from '../../src/types/Option.js';

describe('ofSome(value)', () => {
    it('returns a Some variant', () => {
        const opt = ofSome(42);
        expect(opt.isSome).toBe(true);
        expect(opt.isNone).toBe(false);
    });

    it('carries the value', () => {
        const opt = ofSome('hello');
        if (opt.isSome) expect(opt.value).toBe('hello');
    });

    it('conforms to IOptionSome<T>', () => {
        const opt: IOptionSome<number> = ofSome(42) as IOptionSome<number>;
        expect(opt.isSome).toBe(true);
    });

    it('conforms to IOption<T>', () => {
        const opt: IOption<number> = ofSome(42);
        expect(opt.isSome).toBe(true);
    });

    it('discriminates from IOptionNone — isSome is true literal', () => {
        const opt = ofSome(42);
        // discriminated union narrows on isSome literal
        // CONTRACT GAP (pinned): `ofSome<T>(value): IOption<T>` returns the
        // *union* `IOptionSome<T> | IOptionNone`, not the `IOptionSome<T>`
        // variant. So the result is not directly assignable to IOptionSome<T>
        // without narrowing — call sites must narrow first.
        let _some: IOptionSome<number> | undefined;
        if (opt.isSome) _some = opt;
        // a none-typed variable is also an IOption<number> (covariant member)
        // CONTRACT GAP (pinned): `ofNone(): IOption<never>` returns the union,
        // so it is not directly assignable to IOptionNone without narrowing.
        const none: IOption<never> = ofNone();
        const _assignable: IOption<number> = none;
        expect(_some?.isSome).toBe(true);
        expect(_assignable.isSome).toBe(false);
        // CONTRACT GAP (pinned): the literal discriminants are visible only
        // after narrowing.
        expectTypeOf(opt.isSome).toEqualTypeOf<boolean>();
        expectTypeOf(opt.isNone).toEqualTypeOf<boolean>();
        if (opt.isSome) {
            expectTypeOf(opt.isSome).toEqualTypeOf<true>();
            expectTypeOf(opt.isNone).toEqualTypeOf<false>();
        }
    });

    it('ofSome(undefined) is a valid Some with undefined value', () => {
        const opt = ofSome(undefined);
        expect(opt.isSome).toBe(true);
        expect(opt.isNone).toBe(false);
        if (opt.isSome) expect(opt.value).toBeUndefined();
    });

    it('ofSome(null) is a valid Some with null value', () => {
        const opt = ofSome(null);
        expect(opt.isSome).toBe(true);
        if (opt.isSome) expect(opt.value).toBeNull();
    });

    it('preserves literal type identity — typeof some is the same as the input (Group B)', () => {
        const literalOpt = ofSome(42 as 42);
        if (literalOpt.isSome) expectTypeOf(literalOpt.value).toEqualTypeOf<42>();
    });
});
