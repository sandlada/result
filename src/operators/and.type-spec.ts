import { describe, it, expectTypeOf } from 'vitest';
import { and } from './and.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('and types', () => {
    it('curried form returns a function that widens the error type', () => {
        const other = ok('next') as IResultOfT<string, RangeError>;
        const fn = and(other);
        const _check: (r: IResultOfT<number, TypeError>) => IResultOfT<string, TypeError | RangeError> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form uses the other success type', () => {
        const input = err(new TypeError('boom')) as IResultOfT<number, TypeError>;
        const other = ok('next') as IResultOfT<string, RangeError>;
        const result = and(other, input);
        const _check: IResultOfT<string, TypeError | RangeError> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('curried form widens value to B and error to E | F (Group B)', () => {
        const other = ok('next') as IResultOfT<string, RangeError>;
        const fn = and(other);
        // The curried overload is `<A, E>(r: IResultOfT<A, E>) => IResultOfT<B, E | F>`,
        // so `A`/`E` are only bound at application time. Apply it to observe the
        // widening rather than probing `ReturnType` of the un-applied generic
        // (which instantiates A/E to `unknown`).
        const applied = fn(ok(1) as IResultOfT<number, TypeError>);
        expectTypeOf(applied).toEqualTypeOf<IResultOfT<string, TypeError | RangeError>>();
        expectTypeOf(fn).toBeFunction();
    });

    it('direct form on success replaces the value with B (Group B)', () => {
        const input = ok(1) as IResultOfT<number, TypeError>;
        const other = ok('next') as IResultOfT<string, RangeError>;
        const result = and(other, input);
        if (result.isSuccess) {
            const _v: string = result.value;
            expectTypeOf(_v).toBeString();
        }
    });
});
