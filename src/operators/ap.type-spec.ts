import { describe, it, expectTypeOf } from 'vitest';
import { ap } from './ap.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('ap types', () => {
    it('curried form applies the wrapped function type', () => {
        const wrappedFn = ok((value: number) => value.toString()) as IResultOfT<(value: number) => string, Error>;
        const fn = ap(wrappedFn);
        const _check: (r: IResultOfT<number, Error>) => IResultOfT<string, Error> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns the wrapped function output type', () => {
        const wrappedFn = ok((value: number) => value.toString()) as IResultOfT<(value: number) => string, Error>;
        const input = ok(42) as IResultOfT<number, Error>;
        const result = ap(wrappedFn, input);
        const _check: IResultOfT<string, Error> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('shares a single E across fn-result and value-result (Group B)', () => {
        type E = { code: number };
        const wrappedFn = ok((_x: number) => 'x') as IResultOfT<(x: number) => string, E>;
        const input = ok(1) as IResultOfT<number, E>;
        const result = ap(wrappedFn, input);
        if (result.isFailure) expectTypeOf(result.error).toEqualTypeOf<E>();
    });
});
