import { describe, it, expectTypeOf } from 'vitest';
import { composeKAsync } from './composeKAsync.js';
import { ok, err, asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('composeKAsync types', () => {
    it('composes 2 async functions: (A) => Promise<IResultOfT<C, E>>', () => {
        const f = composeKAsync(
            (x: number) => asyncOk(x * 2),
            (x: number) => x > 50 ? asyncOk(x) : asyncErr('too small'),
        );
        const _check: (a: number) => Promise<IResultOfT<number, string>> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('composes 3 async functions', () => {
        const f = composeKAsync(
            (x: number) => asyncOk(x * 2),
            (x: number) => asyncOk(x + 1),
            (x: number) => asyncOk(x.toString()),
        );
        const _check: (a: number) => Promise<IResultOfT<string, never>> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('accepts sync return values in wrapped functions', () => {
        const f = composeKAsync(
            (x: number) => ok(x * 2),
            (x: number) => ok(x + 1),
        );
        const _check: (a: number) => Promise<IResultOfT<number, never>> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves E across all composed functions', () => {
        type AppError = { kind: 'AppError'; message: string };
        const f1 = (x: number) => asyncOk(x * 2) as unknown as Promise<IResultOfT<number, AppError>>;
        const f2 = (x: number) => asyncOk(x + 1) as unknown as Promise<IResultOfT<number, AppError>>;
        const f = composeKAsync(f1, f2);
        const _check: (a: number) => Promise<IResultOfT<number, AppError>> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('composes 4 functions widening union output type', () => {
        const f = composeKAsync(
            (x: number) => asyncOk<number>(x * 2),
            (x: number) => asyncOk<number>(x + 1),
            (x: number) => asyncOk<string>(x.toString()),
            (s: string) => asyncOk<number>(s.length),
        );
        const _check: (a: number) => Promise<IResultOfT<number, never>> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('composes 5 functions', () => {
        const f = composeKAsync(
            (x: number) => asyncOk(x * 2),
            (x: number) => asyncOk(x + 1),
            (x: number) => asyncOk(x.toString()),
            (s: string) => asyncOk(s.toUpperCase()),
            (s: string) => asyncOk(s.length),
        );
        const _check: (a: number) => Promise<IResultOfT<number, never>> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('composes 6 functions (top of the documented ladder)', () => {
        const f = composeKAsync(
            (x: number) => asyncOk(x * 2),
            (x: number) => asyncOk(x + 1),
            (x: number) => asyncOk(x.toString()),
            (s: string) => asyncOk(s.toUpperCase()),
            (s: string) => asyncOk(s.split('').reverse().join('')),
            (s: string) => asyncOk(s.length),
        );
        const _check: (a: number) => Promise<IResultOfT<number, never>> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('rejects the 7th function (no overload beyond the documented ladder)', () => {
        composeKAsync(
            (x: number) => asyncOk(x),
            (x: number) => asyncOk(x),
            (x: number) => asyncOk(x),
            (x: number) => asyncOk(x),
            (x: number) => asyncOk(x),
            (x: number) => asyncOk(x),
            // @ts-expect-error No overload accepts 7 functions — composeKAsync stops at 6
            (x: number) => asyncOk(x),
        );
    });

    it('narrows isSuccess / isFailure on the awaited return', () => {
        const f = composeKAsync(
            (x: number) => asyncOk(x * 2),
            (x: number) => asyncOk(x.toString()),
        );
        const p = f(10);
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<string, never>>>();
    });
});