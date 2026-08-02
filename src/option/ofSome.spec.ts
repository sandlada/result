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
        const _some: IOptionSome<number> = opt;
        // a none-typed variable is also an IOption<number> (covariant member)
        const none: IOptionNone = ofNone();
        const _assignable: IOption<number> = none;
        expect(_some.isSome).toBe(true);
        expect(_assignable.isSome).toBe(false);
        expectTypeOf(opt.isSome).toEqualTypeOf<true>();
        expectTypeOf(opt.isNone).toEqualTypeOf<false>();
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
