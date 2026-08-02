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
        // value type widens to the other branch's value (B = string)
        const _value: string = null as unknown as ReturnType<typeof fn> extends IResultOfT<infer V, unknown> ? V : never;
        void _value;
        // error widens to E | F
        const _err: TypeError | RangeError = null as unknown as Parameters<ReturnType<typeof fn>>[0] extends IResultOfT<number, infer E> ? E : never;
        void _err;
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
