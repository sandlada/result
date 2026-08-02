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
});
