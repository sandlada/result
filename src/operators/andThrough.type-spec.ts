import { describe, it, expectTypeOf } from 'vitest';
import { andThrough } from './andThrough.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('andThrough types', () => {
    it('curried form preserves the value and widens the error type', () => {
        const fn = andThrough((value: string) => ok(value.length) as IResultOfT<number, RangeError>);
        const _check: (r: IResultOfT<string, TypeError>) => IResultOfT<string, TypeError | RangeError> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form preserves the original success type', () => {
        const input = ok('value') as IResultOfT<string, TypeError>;
        const result = andThrough(
            (value: string) => ok(value.length) as IResultOfT<number, RangeError>,
            input,
        );
        const _check: IResultOfT<string, TypeError | RangeError> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves the original success value type on success (Group B)', () => {
        const result = andThrough(
            (_v: number) => ok('replaced') as IResultOfT<string, never>,
            ok(42) as IResultOfT<number, Error>,
        );
        if (result.isSuccess) expectTypeOf(result.value).toBeNumber();
    });

    it('error widens to E | F (Group B)', () => {
        const result = andThrough(
            (_v: number) => err('inner') as IResultOfT<never, string>,
            err<number>(new Error('outer')),
        );
        if (result.isFailure) expectTypeOf(result.error).toEqualTypeOf<string | Error>();
    });
});
