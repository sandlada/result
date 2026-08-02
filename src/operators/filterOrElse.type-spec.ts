import { describe, it, expectTypeOf } from 'vitest';
import { filterOrElse } from './filterOrElse.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('filterOrElse types', () => {
    it('curried form preserves the result types', () => {
        const fn = filterOrElse(
            (value: number) => value > 0,
            (value: number) => `invalid: ${value}`,
        );
        const _check: (r: IResultOfT<number, string>) => IResultOfT<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form preserves the success and error types', () => {
        const input = ok(42) as IResultOfT<number, string>;
        const result = filterOrElse(
            (value: number) => value > 0,
            (value: number) => `invalid: ${value}`,
            input,
        );
        const _check: IResultOfT<number, string> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('errorFn can widen the error type (Group B)', () => {
        const input = ok(0) as IResultOfT<number, string>;
        const result = filterOrElse(
            (_x: number) => false,
            (x: number): { code: number; value: number } => ({ code: 1, value: x }),
            input,
        );
        if (result.isFailure) expectTypeOf(result.error).toEqualTypeOf<{ code: number; value: number }>();
    });
});
