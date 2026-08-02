import { describe, it, expectTypeOf } from 'vitest';
import { zipWith } from './zipWith.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

describe('zipWith types', () => {
    it('returns a function from (IOption<A>, IOption<B>) to IOption<C>', () => {
        const fn = zipWith((a: number, b: string) => `${a}-${b}`);
        type Fn = typeof fn;
        expectTypeOf<Fn>().toEqualTypeOf<(a: IOption<number>, b: IOption<string>) => IOption<string>>();
    });

    it('preserves A, B, C from signature', () => {
        const fn = zipWith((a: string, b: number) => a.repeat(b));
        const _check: (a: IOption<string>, b: IOption<number>) => IOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('applied to two Some returns Some<C>', () => {
        const r = zipWith((a: number, b: number) => a + b)(ofSome(1), ofSome(2));
        if (r.isSome) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });

    it('applied to None returns None', () => {
        const r = zipWith((a: number, b: number) => a + b)(ofNone(), ofSome(2));
        expectTypeOf(r.isNone).toBeBoolean();
    });
});
