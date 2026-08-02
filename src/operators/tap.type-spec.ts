import { describe, it, expectTypeOf } from 'vitest';
import { tap } from './tap.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('tap types', () => {
    it('curried form preserves any input error type', () => {
        const fn = tap((value: number): void => { void value; });
        const _check: (r: IResultOfT<number, Error>) => IResultOfT<number, Error> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form preserves T and E', () => {
        const input = ok(42) as IResultOfT<number, Error>;
        const result = tap((value: number): void => { void value; }, input);
        const _check: IResultOfT<number, Error> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves the literal error type (Group B)', () => {
        const input = err('boom' as const) as IResultOfT<number, 'boom'>;
        const result = tap((v: number): void => { void v; }, input);
        if (result.isFailure) expectTypeOf(result.error).toEqualTypeOf<'boom'>();
    });
});
