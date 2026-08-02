import { describe, it, expectTypeOf } from 'vitest';
import { bind } from './bind.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('bind types', () => {
    it('curried form replaces the value and widens the error type', () => {
        const fn = bind((value: number) => ok(value > 0) as IResultOfT<boolean, RangeError>);
        const _check: (r: IResultOfT<number, TypeError>) => IResultOfT<boolean, TypeError | RangeError> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns the callback result value type', () => {
        const input = ok(42) as IResultOfT<number, TypeError>;
        const result = bind(
            (value: number) => ok(value > 0) as IResultOfT<boolean, RangeError>,
            input,
        );
        const _check: IResultOfT<boolean, TypeError | RangeError> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves the input success error when fn returns the same error (Group B)', () => {
        const input = err('original') as IResultOfT<number, string>;
        const result = bind(
            (_x: number) => err('inner') as IResultOfT<never, string>,
            input,
        );
        // input error wins — bind short-circuits
        if (result.isFailure) expectTypeOf(result.error).toBeString();
    });

    it('error widens to E | F when fn has a distinct error type (Group B)', () => {
        const input = ok(1) as IResultOfT<number, TypeError>;
        const result = bind(
            (x: number) => err('fail') as IResultOfT<never, string>,
            input,
        );
        if (result.isFailure) expectTypeOf(result.error).toEqualTypeOf<TypeError | string>();
    });
});
