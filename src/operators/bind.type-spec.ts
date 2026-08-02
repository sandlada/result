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
});
