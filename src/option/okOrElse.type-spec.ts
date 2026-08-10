import { describe, it, expectTypeOf } from 'vitest';
import { okOrElse } from './okOrElse.js';
import { ofSome, ofNone } from './index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';

describe('okOrElse types', () => {
    it('returns a function from IOption<T> to IResultOfT<T, E | Error>', () => {
        // The return type is widened to `E | Error` to reflect the catch-block's
        // honest runtime payload when `errorFn` throws — see the implementation
        // JSDoc for the contract rationale.
        const fn = okOrElse<string>(() => 'missing');
        const _check: <T>(opt: IOption<T>) => IResultOfT<T, string | Error> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves E from errorFn return (widened with Error)', () => {
        type AppError = { kind: 'AppError'; message: string };
        const fn = okOrElse<AppError>(() => ({ kind: 'AppError', message: 'x' }));
        const _check: <T>(opt: IOption<T>) => IResultOfT<T, AppError | Error> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('applied to Some yields IResultOfT<T, E>', () => {
        const r = okOrElse<string>(() => 'missing')(ofSome(42));
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });

    it('applied to None yields failure with E from errorFn (widened with Error)', () => {
        // Pin the input as `IOption<number>` so `T` is not widened to `unknown`
        // (which would absorb the error type).
        const r = okOrElse<string>(() => 'missing')(ofNone() as IOption<number>);
        if (!r.isSuccess) {
            expectTypeOf(r.error).toEqualTypeOf<string | Error>();
        }
    });

    it('E is fixed by the errorFn return type, T by the input (Group B, widened with Error)', () => {
        const fn = okOrElse(() => 'default');
        const r = fn(ofSome(42));
        expectTypeOf(r).toEqualTypeOf<IResultOfT<number, string | Error>>();
    });

    it('return type is widened to IResultOfT<T, E | Error> for honest catch payload', () => {
        const fn = okOrElse(() => 'default');
        const r = fn(ofSome(42));
        // The widened error type is the contract: the catch-block may surface an
        // arbitrary Error even when the user's E is something narrower.
        expectTypeOf(r).toEqualTypeOf<IResultOfT<number, string | Error>>();
    });

    it('widened error still admits Error-only when E = never', () => {
        const fn = okOrElse(() => 'x' as never);
        const r = fn(ofSome(42));
        // `E = never` + `Error` collapses to `Error`.
        expectTypeOf(r).toEqualTypeOf<IResultOfT<number, Error>>();
    });
});
