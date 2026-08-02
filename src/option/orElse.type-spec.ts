import { describe, it, expectTypeOf } from 'vitest';
import { orElse } from './orElse.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

describe('orElse types', () => {
    it('returns a function from IOption<T> to IOption<T>', () => {
        const fn = orElse<number>(() => ofSome(0));
        const _check: (opt: IOption<number>) => IOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T from the fallback', () => {
        const fn = orElse<string>(() => ofSome('default'));
        const _check: (opt: IOption<string>) => IOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('applied to Some passes through Some', () => {
        const r = orElse<number>(() => ofSome(0))(ofSome(42));
        if (r.isSome) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });

    it('applied to None falls back to T from fn', () => {
        const r = orElse<number>(() => ofSome(0))(ofNone());
        if (r.isSome) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });
});
