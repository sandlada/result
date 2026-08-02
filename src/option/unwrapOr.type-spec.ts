import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOr } from './unwrapOr.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

describe('unwrapOr types', () => {
    it('curried form returns (opt: IOption<T>) => T', () => {
        const fn = unwrapOr(0);
        const _check: (opt: IOption<number>) => number = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns T', () => {
        const r = unwrapOr(0, ofSome(42));
        expectTypeOf(r).toEqualTypeOf<number>();
    });

    it('preserves T from default argument', () => {
        const fn = unwrapOr('default');
        const _check: (opt: IOption<string>) => string = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('returns T from Some', () => {
        const r = unwrapOr(0, ofSome(42));
        expectTypeOf(r).toEqualTypeOf<number>();
    });

    it('returns T from None (default)', () => {
        const r = unwrapOr(0, ofNone());
        expectTypeOf(r).toEqualTypeOf<number>();
    });
});
