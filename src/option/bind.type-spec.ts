import { describe, it, expectTypeOf } from 'vitest';
import { bind } from './bind.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

describe('bind types', () => {
    it('returns a function from IOption<T> to IOption<U>', () => {
        const fn = bind((x: number) => ofSome(x.toString()));
        const _check: (opt: IOption<number>) => IOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves U from the wrapped function', () => {
        const fn = bind((s: string) => ofSome(s.length));
        const _check: (opt: IOption<string>) => IOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('chained bind yields IOption<U> at the end', () => {
        const r = bind((n: number) => ofSome(n * 2))(ofSome(21));
        if (r.isSome) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });

    it('handles IOption<never> source', () => {
        const fn = bind((n: never) => ofSome(n));
        const _check: (opt: IOption<never>) => IOption<never> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('keeps the value type in the canonical shape when the None branch is typed', () => {
        // `ofNone()` defaults its type parameter to `unknown`, which would
        // widen the whole pipeline to `IOption<unknown>`. The canonical
        // example therefore annotates the None branch.
        const r = bind((n: number) => (n > 0 ? ofSome(n * 2) : ofNone<number>()))(ofSome(21));
        expectTypeOf(r).toEqualTypeOf<IOption<number>>();
    });
});
