import { describe, it, expectTypeOf } from 'vitest';
import { map } from './map.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

describe('map types', () => {
    it('returns a function from IOption<T> to IOption<U>', () => {
        const fn = map((x: number) => x.toString());
        const _check: (opt: IOption<number>) => IOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves U from the wrapped function return', () => {
        const fn = map((s: string) => s.length);
        const _check: (opt: IOption<string>) => IOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('applied to Some preserves Some narrowing', () => {
        const opt = map((x: number) => x * 2)(ofSome(21));
        if (opt.isSome) {
            expectTypeOf(opt.value).toEqualTypeOf<number>();
        }
    });

    it('applied to None keeps None shape', () => {
        const opt = map((x: number) => x * 2)(ofNone());
        expectTypeOf(opt.isNone).toBeBoolean();
    });
});
