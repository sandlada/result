import { describe, it, expectTypeOf } from 'vitest';
import { mapErr } from './mapErr.js';
import { err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('mapErr types', () => {
    it('curried form maps the error and preserves any success type', () => {
        const fn = mapErr((error: Error) => error.message);
        const _check: (r: IResultOfT<number, Error>) => IResultOfT<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form preserves T and maps E', () => {
        const input = err(new Error('boom')) as IResultOfT<number, Error>;
        const result = mapErr((error: Error) => error.message, input);
        const _check: IResultOfT<number, string> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('supports discriminant narrowing', () => {
        const input = err(new Error('boom')) as IResultOfT<number, Error>;
        const result = mapErr((error: Error) => error.message, input);
        if (result.isSuccess) expectTypeOf(result.value).toBeNumber();
        else expectTypeOf(result.error).toBeString();
    });

    it('preserves the literal success type (Group B)', () => {
        const input = ok(42 as const) as IResultOfT<42, string>;
        const result = mapErr((e: string) => e.length, input);
        if (result.isSuccess) expectTypeOf(result.value).toEqualTypeOf<42>();
    });
});
