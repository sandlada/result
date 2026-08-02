import { describe, it, expectTypeOf } from 'vitest';
import { okOr } from './okOr.js';
import { ofSome, ofNone } from './index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';

describe('okOr types', () => {
    it('returns a function from IOption<T> to IResultOfT<T, E>', () => {
        const fn = okOr<string>('missing');
        const _check: <T>(opt: IOption<T>) => IResultOfT<T, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves E from error argument', () => {
        type AppError = { kind: 'AppError'; message: string };
        const fn = okOr<AppError>({ kind: 'AppError', message: 'x' });
        const _check: <T>(opt: IOption<T>) => IResultOfT<T, AppError> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('applied to Some yields IResultOfT<T, E>', () => {
        const r = okOr<string>('missing')(ofSome(42));
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });

    it('applied to None yields failure with E', () => {
        const r = okOr<string>('missing')(ofNone());
        if (!r.isSuccess) {
            expectTypeOf(r.error).toEqualTypeOf<string>();
        }
    });

    it('produces IResultOfT<T, E> where T is inferred from input and E is fixed (Group B)', () => {
        const fn = okOr('default');
        const r = fn(ofSome(42));
        expectTypeOf(r).toEqualTypeOf<IResultOfT<number, string>>();
    });
});
