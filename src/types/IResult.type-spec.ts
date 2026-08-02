import { describe, it, expectTypeOf } from 'vitest';
import type { IResult, IResultSuccess, IResultFailure } from './IResult.js';
import { ok, err } from '../factories/index.js';

describe('IResult types', () => {
    it('IResultSuccess has literal true/false flags', () => {
        expectTypeOf<IResultSuccess['isSuccess']>().toEqualTypeOf<true>();
        expectTypeOf<IResultSuccess['isFailure']>().toEqualTypeOf<false>();
    });

    it('IResultFailure has literal false/true flags', () => {
        expectTypeOf<IResultFailure['isSuccess']>().toEqualTypeOf<false>();
        expectTypeOf<IResultFailure['isFailure']>().toEqualTypeOf<true>();
    });

    it('IResultFailure carries the error', () => {
        type F = IResultFailure<string>;
        const _check: F = { isSuccess: false, isFailure: true, error: 'x' };
        expectTypeOf(_check.error).toEqualTypeOf<string>();
    });

    it('IResult defaults TError to unknown', () => {
        type R = IResult;
        // Should be assignable to IResult<unknown>
        const _check: IResult<unknown> = null as unknown as R;
        expectTypeOf(_check).toBeObject();
    });

    it('IResult is the discriminated union of success and failure', () => {
        const success: IResult = ok();
        const failure: IResult = err('boom');
        expectTypeOf(success).toBeObject();
        expectTypeOf(failure).toBeObject();
    });

    it('ok() produces IResultSuccess and is assignable to IResult', () => {
        const r = ok();
        const _check: IResult = r;
        expectTypeOf(_check).toBeObject();
    });

    it('err(error) produces IResultFailure<E> and is assignable to IResult<E>', () => {
        const r = err('boom');
        const _check: IResult<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('narrowing yields the failure variant exposing error', () => {
        const r: IResult<string> = err('boom');
        if (!r.isSuccess) {
            expectTypeOf(r.error).toEqualTypeOf<string>();
        }
    });

    // ---------------------------------------------------------------------
    // Union identity
    // ---------------------------------------------------------------------

    it('IResult<E> is exactly the union of its two variants', () => {
        expectTypeOf<IResult<string>>().toEqualTypeOf<IResultSuccess | IResultFailure<string>>();
    });

    it('IResult with no type argument is exactly IResult<unknown>', () => {
        expectTypeOf<IResult>().toEqualTypeOf<IResult<unknown>>();
        expectTypeOf<IResultFailure>().toEqualTypeOf<IResultFailure<unknown>>();
        expectTypeOf<IResultFailure['error']>().toEqualTypeOf<unknown>();
    });

    it('the default TError is unknown rather than Error or any', () => {
        expectTypeOf<IResultFailure['error']>().not.toEqualTypeOf<Error>();
        // `unknown` is not assignable to `Error`: the caller must narrow.
        expectTypeOf<IResultFailure['error']>().not.toExtend<Error>();
    });

    // ---------------------------------------------------------------------
    // Narrowing
    // ---------------------------------------------------------------------

    it('narrowing on isSuccess yields exactly one variant on each branch', () => {
        const r = null as unknown as IResult<string>;
        if (r.isSuccess) {
            expectTypeOf(r).toEqualTypeOf<IResultSuccess>();
        } else {
            expectTypeOf(r).toEqualTypeOf<IResultFailure<string>>();
        }
    });

    it('isFailure is an equally valid discriminant', () => {
        const r = null as unknown as IResult<string>;
        if (r.isFailure) {
            expectTypeOf(r).toEqualTypeOf<IResultFailure<string>>();
            expectTypeOf(r.error).toEqualTypeOf<string>();
        } else {
            expectTypeOf(r).toEqualTypeOf<IResultSuccess>();
        }
    });

    it('the union is exhaustive: both discriminants together leave never', () => {
        const exhaustive = (r: IResult<string>): string => {
            if (r.isSuccess) return 'ok';
            if (r.isFailure) return r.error;
            const unreachable: never = r;
            return unreachable;
        };
        expectTypeOf(exhaustive).toEqualTypeOf<(r: IResult<string>) => string>();
    });

    // ---------------------------------------------------------------------
    // Negative constraints
    // ---------------------------------------------------------------------

    it('the success variant does not expose error', () => {
        const r = null as unknown as IResult<string>;
        if (r.isSuccess) {
            // @ts-expect-error `error` only exists on the failure variant
            r.error;
        }
        expectTypeOf<keyof IResultSuccess>().toEqualTypeOf<'isSuccess' | 'isFailure'>();
    });

    it('the failure variant requires error to be present', () => {
        // @ts-expect-error `error` is required on IResultFailure
        const _bad: IResultFailure<string> = { isSuccess: false, isFailure: true };
        expectTypeOf<keyof IResultFailure<string>>().toEqualTypeOf<'isSuccess' | 'isFailure' | 'error'>();
    });

    it('the discriminant flags may not disagree', () => {
        // @ts-expect-error isFailure must be false on the success variant
        const _bad: IResultSuccess = { isSuccess: true, isFailure: true };
        expectTypeOf<IResultSuccess>().toBeObject();
    });

    it('every field is readonly', () => {
        const success: IResultSuccess = { isSuccess: true, isFailure: false };
        // @ts-expect-error isSuccess is readonly
        success.isSuccess = true;
        const failure: IResultFailure<string> = { isSuccess: false, isFailure: true, error: 'x' };
        // @ts-expect-error error is readonly
        failure.error = 'y';
    });

    it('the two variants are not assignable to one another', () => {
        expectTypeOf<IResultSuccess>().not.toExtend<IResultFailure<string>>();
        expectTypeOf<IResultFailure<string>>().not.toExtend<IResultSuccess>();
    });

    // ---------------------------------------------------------------------
    // Variance
    // ---------------------------------------------------------------------

    it('IResult is covariant in TError', () => {
        expectTypeOf<IResult<string>>().toExtend<IResult<string | number>>();
        expectTypeOf<IResult<string | number>>().not.toExtend<IResult<string>>();
        expectTypeOf<IResult<never>>().toExtend<IResult<string>>();
        expectTypeOf<IResult<string>>().toExtend<IResult<unknown>>();
    });

    it('the success variant is assignable to IResult of any error type', () => {
        expectTypeOf<IResultSuccess>().toExtend<IResult<string>>();
        expectTypeOf<IResultSuccess>().toExtend<IResult<never>>();
    });

    it('ok() widens to IResult of any error type', () => {
        const _widened: IResult<Error> = ok();
        expectTypeOf(_widened).toEqualTypeOf<IResult<Error>>();
    });
});
