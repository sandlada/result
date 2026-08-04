import { describe, it, expectTypeOf } from 'vitest';
import { ofNone } from './ofNone.js';
import type { IOption, IOptionNone } from '../types/Option.js';

describe('ofNone types', () => {
    it('returns IOption<never> by default', () => {
        const opt = ofNone();
        expectTypeOf(opt).toEqualTypeOf<IOption<never>>();
    });

    it('returns IOption<T> with explicit type parameter', () => {
        const optNum = ofNone<number>();
        const optStr = ofNone<string>();
        const optUser = ofNone<{ name: string }>();
        expectTypeOf(optNum).toEqualTypeOf<IOption<number>>();
        expectTypeOf(optStr).toEqualTypeOf<IOption<string>>();
        expectTypeOf(optUser).toEqualTypeOf<IOption<{ name: string }>>();
    });

    it('widens via explicit type parameter to any IOption<T>', () => {
        // The default IOption<never> is the *bottom* of IOption's lattice —
        // it does not auto-widen to IOption<X>. The only way to assign
        // ofNone() to a slot typed as IOption<T> is via explicit generic.
        const optNum: IOption<number> = ofNone<number>();
        const optStr: IOption<string> = ofNone<string>();
        expectTypeOf(optNum).toEqualTypeOf<IOption<number>>();
        expectTypeOf(optStr).toEqualTypeOf<IOption<string>>();
    });

    it('narrows to IOptionNone', () => {
        const opt = ofNone();
        if (opt.isNone) {
            const _check: IOptionNone = opt;
            expectTypeOf(_check).toEqualTypeOf<IOptionNone>();
        }
    });

    it('discriminants are boolean before narrowing — ofNone returns the IOption union', () => {
        // CONTRACT GAP (pinned): `ofNone<T>(): IOption<T>` returns the *union*
        // `IOptionSome<T> | IOptionNone`, not the `IOptionNone` variant. So
        // at the call site `isNone`/`isSome` are `boolean`, not the literals
        // `true`/`false` — callers must narrow first. Pinned rather than
        // "fixed" because tightening the return type would change the public API.
        const opt = ofNone();
        expectTypeOf(opt.isNone).toEqualTypeOf<boolean>();
        expectTypeOf(opt.isSome).toEqualTypeOf<boolean>();
        // After narrowing, the literal discriminants are visible.
        if (opt.isNone) {
            expectTypeOf(opt.isNone).toEqualTypeOf<true>();
            expectTypeOf(opt.isSome).toEqualTypeOf<false>();
        }
    });

    it('does NOT have a value field — narrowing excludes value', () => {
        const opt = ofNone();
        // @ts-expect-error — None has no `value` field
        const _noValue: never = opt.value;
    });

    it('explicit generic preserves the type parameter through the call', () => {
        // Common pattern in map/bind/filter: a closure returns ofNone<U>()
        // where U is the surrounding function's type parameter. The generic
        // here ensures type inference doesn't degrade to IOption<never>.
        function expectNone<U>(): IOption<U> {
            return ofNone<U>();
        }
        expectTypeOf(expectNone<number>).returns.toEqualTypeOf<IOption<number>>();
        expectTypeOf(expectNone<string>).returns.toEqualTypeOf<IOption<string>>();
    });
});
