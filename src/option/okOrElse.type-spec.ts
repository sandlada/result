import { describe, it, expectTypeOf } from 'vitest';
import { okOrElse } from './okOrElse.js';
import { ofSome, ofNone } from './index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';

describe('okOrElse types', () => {
    it('returns a function from IOption<T> to IResultOfT<T, E>', () => {
        const fn = okOrElse<string>(() => 'missing');
        const _check: <T>(opt: IOption<T>) => IResultOfT<T, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves E from errorFn return', () => {
        type AppError = { kind: 'AppError'; message: string };
        const fn = okOrElse<AppError>(() => ({ kind: 'AppError', message: 'x' }));
        const _check: <T>(opt: IOption<T>) => IResultOfT<T, AppError> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('applied to Some yields IResultOfT<T, E>', () => {
        const r = okOrElse<string>(() => 'missing')(ofSome(42));
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });

    it('applied to None yields failure with E from errorFn', () => {
        const r = okOrElse<string>(() => 'missing')(ofNone());
        if (!r.isSuccess) {
            expectTypeOf(r.error).toEqualTypeOf<string>();
        }
    });

    it('E is fixed by the errorFn return type, T by the input (Group B)', () => {
        const fn = okOrElse(() => 'default');
        const r = fn(ofSome(42));
        expectTypeOf(r).toEqualTypeOf<IResultOfT<number, string>>();
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
        expectTypeOf(r).toEqualTypeOf<IResultOfT<number, Error>>();
    });
});
