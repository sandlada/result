import { describe, it, expectTypeOf } from 'vitest';
import type { IResultOfT, IResultOfTSuccess, IResultOfTFailure } from './IResultOfT.js';
import type { IResult } from './IResult.js';
import { ok, err } from '../factories/index.js';

describe('IResultOfT types', () => {
    it('IResultOfTSuccess has literal true/false flags', () => {
        expectTypeOf<IResultOfTSuccess<number>['isSuccess']>().toEqualTypeOf<true>();
        expectTypeOf<IResultOfTSuccess<number>['isFailure']>().toEqualTypeOf<false>();
    });

    it('IResultOfTFailure has literal false/true flags', () => {
        expectTypeOf<IResultOfTFailure['isSuccess']>().toEqualTypeOf<false>();
        expectTypeOf<IResultOfTFailure['isFailure']>().toEqualTypeOf<true>();
    });

    it('IResultOfTFailure carries the error', () => {
        type F = IResultOfTFailure<string>;
        const _check: F = { isSuccess: false, isFailure: true, error: 'x' };
        expectTypeOf(_check.error).toEqualTypeOf<string>();
    });

    it('IResultOfTSuccess carries the value', () => {
        type S = IResultOfTSuccess<number>;
        const _check: S = { isSuccess: true, isFailure: false, value: 42 };
        expectTypeOf(_check.value).toEqualTypeOf<number>();
    });

    it('IResultOfT defaults TError to unknown', () => {
        type R = IResultOfT<number>;
        const _check: IResultOfT<number, unknown> = null as unknown as R;
        expectTypeOf(_check).toBeObject();
    });

    it('IResultOfT is a discriminated union', () => {
        const success: IResultOfT<number, string> = ok(42);
        const failure: IResultOfT<number, string> = err('boom');
        expectTypeOf(success).toBeObject();
        expectTypeOf(failure).toBeObject();
    });

    it('ok(value) is assignable to IResultOfT<T, E>', () => {
        const r = ok(42);
        const _check: IResultOfT<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('err(error) is assignable to IResultOfT<T, E>', () => {
        const r = err('boom');
        const _check: IResultOfT<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('narrowing on success yields value', () => {
        const r = ok(42);
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });

    it('narrowing on failure yields error', () => {
        const r = err('boom');
        if (!r.isSuccess) {
            expectTypeOf(r.error).toEqualTypeOf<string>();
        }
    });

    // ---------------------------------------------------------------------
    // Union identity
    // ---------------------------------------------------------------------

    it('IResultOfT<T, E> is exactly the union of its two variants', () => {
        expectTypeOf<IResultOfT<number, string>>().toEqualTypeOf<
            IResultOfTSuccess<number> | IResultOfTFailure<string>
        >();
    });

    it('IResultOfT with one type argument is exactly IResultOfT<T, unknown>', () => {
        expectTypeOf<IResultOfT<number>>().toEqualTypeOf<IResultOfT<number, unknown>>();
        expectTypeOf<IResultOfTFailure>().toEqualTypeOf<IResultOfTFailure<unknown>>();
        expectTypeOf<IResultOfTFailure['error']>().toEqualTypeOf<unknown>();
        expectTypeOf<IResultOfTFailure['error']>().not.toExtend<Error>();
    });

    // ---------------------------------------------------------------------
    // Narrowing
    // ---------------------------------------------------------------------

    it('narrowing on isSuccess yields exactly one variant on each branch', () => {
        const r = null as unknown as IResultOfT<number, string>;
        if (r.isSuccess) {
            expectTypeOf(r).toEqualTypeOf<IResultOfTSuccess<number>>();
        } else {
            expectTypeOf(r).toEqualTypeOf<IResultOfTFailure<string>>();
        }
    });

    it('isFailure is an equally valid discriminant', () => {
        const r = null as unknown as IResultOfT<number, string>;
        if (r.isFailure) {
            expectTypeOf(r.error).toEqualTypeOf<string>();
        } else {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });

    it('the union is exhaustive: both discriminants together leave never', () => {
        const exhaustive = (r: IResultOfT<number, string>): number | string => {
            if (r.isSuccess) return r.value;
            if (r.isFailure) return r.error;
            const unreachable: never = r;
            return unreachable;
        };
        expectTypeOf(exhaustive).toEqualTypeOf<(r: IResultOfT<number, string>) => number | string>();
    });

    // ---------------------------------------------------------------------
    // Negative constraints
    // ---------------------------------------------------------------------

    it('the success variant does not expose error and the failure variant does not expose value', () => {
        const r = null as unknown as IResultOfT<number, string>;
        if (r.isSuccess) {
            // @ts-expect-error `error` only exists on the failure variant
            r.error;
        } else {
            // @ts-expect-error `value` only exists on the success variant
            r.value;
        }
        expectTypeOf<keyof IResultOfTSuccess<number>>().toEqualTypeOf<'isSuccess' | 'isFailure' | 'value'>();
        expectTypeOf<keyof IResultOfTFailure<string>>().toEqualTypeOf<'isSuccess' | 'isFailure' | 'error'>();
    });

    it('value stays a required key even when TValue includes undefined', () => {
        // @ts-expect-error `value` is required, not optional, for IResultOfTSuccess<undefined>
        const _missing: IResultOfTSuccess<undefined> = { isSuccess: true, isFailure: false };
        const _explicit: IResultOfTSuccess<undefined> = {
            isSuccess: true,
            isFailure: false,
            value: undefined,
        };
        expectTypeOf(_explicit.value).toEqualTypeOf<undefined>();
    });

    it('every field is readonly', () => {
        const success: IResultOfTSuccess<number> = { isSuccess: true, isFailure: false, value: 1 };
        // @ts-expect-error value is readonly
        success.value = 2;
        const failure: IResultOfTFailure<string> = { isSuccess: false, isFailure: true, error: 'x' };
        // @ts-expect-error error is readonly
        failure.error = 'y';
    });

    it('the two variants are not assignable to one another', () => {
        expectTypeOf<IResultOfTSuccess<number>>().not.toExtend<IResultOfTFailure<string>>();
        expectTypeOf<IResultOfTFailure<string>>().not.toExtend<IResultOfTSuccess<number>>();
    });

    // ---------------------------------------------------------------------
    // Generic flow
    // ---------------------------------------------------------------------

    it('IResultOfT is covariant in TValue and TError', () => {
        expectTypeOf<IResultOfT<number, string>>().toExtend<IResultOfT<number | boolean, string>>();
        expectTypeOf<IResultOfT<number, string>>().toExtend<IResultOfT<number, string | Error>>();
        expectTypeOf<IResultOfT<number | boolean, string>>().not.toExtend<IResultOfT<number, string>>();
        expectTypeOf<IResultOfT<number, string | Error>>().not.toExtend<IResultOfT<number, string>>();
    });

    it('literal value and error types are preserved, not widened', () => {
        expectTypeOf<IResultOfTSuccess<'a'>['value']>().toEqualTypeOf<'a'>();
        expectTypeOf<IResultOfTFailure<'boom'>['error']>().toEqualTypeOf<'boom'>();
        const literal = ok('a' as const);
        if (literal.isSuccess) {
            expectTypeOf(literal.value).toEqualTypeOf<'a'>();
        }
    });

    it('ok(value) infers TError as never and err(error) infers TValue as never', () => {
        expectTypeOf(ok(42)).toEqualTypeOf<IResultOfT<number, never>>();
        expectTypeOf(err('boom')).toEqualTypeOf<IResultOfT<never, string>>();
    });

    // ---------------------------------------------------------------------
    // Relationship with the void result
    // ---------------------------------------------------------------------

    it('IResultOfT<T, E> widens to IResult<E> but not the reverse', () => {
        expectTypeOf<IResultOfT<number, string>>().toExtend<IResult<string>>();
        expectTypeOf<IResult<string>>().not.toExtend<IResultOfT<number, string>>();
    });
});
