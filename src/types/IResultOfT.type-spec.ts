import { describe, it, expectTypeOf } from 'vitest';
import type { IResultOfT, IResultOfTSuccess, IResultOfTFailure } from './IResultOfT.js';
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
});
