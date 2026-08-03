import { describe, it, expectTypeOf } from 'vitest';
import { map } from './map.js';
import { err, ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('map types', () => {
    it('curried form maps the success type and preserves any error type', () => {
        const fn = map((value: number) => value.toString());
        const _check: (r: IResultOfT<number, Error>) => IResultOfT<string, Error> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form maps T and preserves E', () => {
        const input = ok(42) as IResultOfT<number, Error>;
        const result = map((value: number) => value.toString(), input);
        const _check: IResultOfT<string, Error> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('supports discriminant narrowing', () => {
        const input = ok(42) as IResultOfT<number, Error>;
        const result = map((value: number) => value.toString(), input);
        if (result.isSuccess) expectTypeOf(result.value).toBeString();
        else expectTypeOf(result.error).toBeObject();
    });

    it('preserves the literal error type (Group B)', () => {
        const input = err('e' as const) as IResultOfT<number, 'e'>;
        const result = map((v: number) => v.toString(), input);
        if (result.isFailure) expectTypeOf(result.error).toEqualTypeOf<'e'>();
    });
});
