import { describe, it, expectTypeOf } from 'vitest';
import { filter } from './filter.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

describe('filter types', () => {
    it('returns a function from IOption<T> to IOption<T>', () => {
        const fn = filter((x: number) => x > 0);
        const _check: (opt: IOption<number>) => IOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T from predicate', () => {
        const fn = filter((s: string) => s.length > 0);
        const _check: (opt: IOption<string>) => IOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('does not change the wrapped value type', () => {
        const opt = filter((x: number) => x > 0)(ofSome(42));
        if (opt.isSome) {
            expectTypeOf(opt.value).toEqualTypeOf<number>();
        }
    });

    it('applied to None keeps None shape', () => {
        const opt = filter((x: number) => x > 0)(ofNone());
        expectTypeOf(opt.isNone).toBeBoolean();
    });
});
