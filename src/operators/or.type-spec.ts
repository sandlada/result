import { describe, it, expectTypeOf } from 'vitest';
import { or } from './or.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('or types', () => {
    it('curried form preserves the value and widens the error type', () => {
        const other = ok(0) as IResultOfT<number, RangeError>;
        const fn = or<number, TypeError, RangeError>(other);
        const _check: (r: IResultOfT<number, TypeError>) => IResultOfT<number, TypeError | RangeError> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form preserves the shared success type', () => {
        const input = ok(42) as IResultOfT<number, TypeError>;
        const other = ok(0) as IResultOfT<number, RangeError>;
        const result = or(other, input);
        const _check: IResultOfT<number, TypeError | RangeError> = result;
        expectTypeOf(_check).toBeObject();
    });
});
