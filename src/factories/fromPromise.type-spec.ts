import { describe, it, expectTypeOf } from 'vitest';
import { fromPromise } from './fromPromise.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('fromPromise types', () => {
    it('returns Promise<IResultOfT<T, unknown>> without errorFn', () => {
        const p = fromPromise(Promise.resolve(42));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, unknown>>>();
    });

    it('infers T from the promise', () => {
        const p = fromPromise(Promise.resolve('hello'));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<string, unknown>>>();
    });

    it('errorFn narrows the error type', () => {
        const p = fromPromise(
            Promise.resolve(42),
            (e: unknown) => new Error(String(e)),
        );
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, Error>>>();
    });

    it('errorFn can return any custom error type', () => {
        type AppError = { kind: 'AppError'; message: string };
        const p = fromPromise<number, AppError>(
            Promise.resolve(42),
            (e) => ({ kind: 'AppError' as const, message: String(e) }),
        );
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, AppError>>>();
    });
});
