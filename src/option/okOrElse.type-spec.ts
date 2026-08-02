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
});
