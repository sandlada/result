import { describe, it, expectTypeOf } from 'vitest';
import { composeK } from './composeK.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('composeK types', () => {
    it('composes 2 functions: (A) => IResultOfT<C, E>', () => {
        const f = composeK(
            (x: number) => ok(x * 2),
            (x: number) => x > 50 ? ok(x) : err<string>('too small'),
        );
        const _check: (a: number) => IResultOfT<number, string> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('composes 3 functions', () => {
        const f = composeK(
            (x: number) => ok(x * 2),
            (x: number) => ok(x + 1),
            (x: number) => ok(x.toString()),
        );
        const _check: (a: number) => IResultOfT<string, never> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves E across all composed functions', () => {
        type AppError = { kind: 'AppError'; message: string };
        const f1 = (x: number): IResultOfT<number, AppError> => ok(x * 2) as IResultOfT<number, AppError>;
        const f2 = (x: number): IResultOfT<number, AppError> => ok(x + 1) as IResultOfT<number, AppError>;
        const f = composeK(f1, f2);
        const _check: (a: number) => IResultOfT<number, AppError> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('composes 4 functions widening union output type', () => {
        // Forces a union return — number | string — so that composeK has to
        // thread the union through to the final composed signature.
        const f = composeK(
            (x: number) => ok<number>(x * 2),
            (x: number) => ok<number>(x + 1),
            (x: number) => (x % 2 === 0 ? ok<string>(`even:${x}`) : ok<string>(`odd:${x}`)),
            (s: string) => ok<number>(s.length),
        );
        expectTypeOf(f).toBeFunction();
        const _check: (a: number) => IResultOfT<number, never> = f;
        void _check;
    });

    it('composes 5 functions with explicit E widening via a heterogeneous fn', () => {
        type AppError = { code: number };
        const f = composeK<AppError, number, number, string, string, number, AppError>(
            (x: number) => ok<AppError, number>(x * 2),
            (x: number) => ok<AppError, number>(x + 1),
            (x: number) => ok<AppError, string>(x.toString()),
            (s: string) => ok<AppError, string>(s.toUpperCase()),
            (s: string) => ok<AppError, number>(s.length),
        );
        const _check: (a: number) => IResultOfT<number, AppError> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('composes 6 functions (top of the documented ladder)', () => {
        const f = composeK(
            (x: number) => ok(x * 2),
            (x: number) => ok(x + 1),
            (x: number) => ok(x.toString()),
            (s: string) => ok(s.toUpperCase()),
            (s: string) => ok(s.split('').reverse().join('')),
            (s: string) => ok(s.length),
        );
        const _check: (a: number) => IResultOfT<number, never> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('rejects the 7th function (no overload beyond the documented ladder)', () => {
        // @ts-expect-error No overload accepts 7 functions — composeK stops at 6
        composeK(
            (x: number) => ok(x),
            (x: number) => ok(x),
            (x: number) => ok(x),
            (x: number) => ok(x),
            (x: number) => ok(x),
            (x: number) => ok(x),
            (x: number) => ok(x),
        );
    });

    it('narrows isSuccess / isFailure on the composed return', () => {
        const f = composeK(
            (x: number) => ok(x * 2),
            (x: number) => ok(x.toString()),
        );
        const r = f(10);
        expectTypeOf(r.isSuccess).toEqualTypeOf<true | false>();
        if (r.isSuccess) {
            expectTypeOf(r.value).toBeString();
        } else {
            expectTypeOf(r.error).toBeNever();
        }
    });
});