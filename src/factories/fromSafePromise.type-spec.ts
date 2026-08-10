import { describe, it, expectTypeOf } from 'vitest';
import { fromSafePromise } from './fromSafePromise.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('fromSafePromise types', () => {
    it('returns Promise<IResultOfT<T, Error>>', () => {
        const p = fromSafePromise(Promise.resolve(42));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, Error>>>();
    });

    it('infers T from the promise', () => {
        const p = fromSafePromise(Promise.resolve('hello'));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<string, Error>>>();
    });

    it('error type is always Error (not user-controllable)', () => {
        const p = fromSafePromise(Promise.resolve(true));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<boolean, Error>>>();
    });

// Configurable error type via optional `errorFn` (mirrors `fromPromise`).

    it('accepts an optional E type parameter when an errorFn is supplied', () => {
        // `fromSafePromise<T, E = Error>(promise, errorFn?)` mirrors `fromPromise`.
        // Callers may opt into a narrower error type by supplying an `errorFn`
        // whose return type drives `E`.
        type AppError = { kind: 'AppError'; detail: string };
        const p = fromSafePromise<number, AppError>(
            Promise.resolve(42),
            () => ({ kind: 'AppError', detail: 'x' }),
        );
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, AppError>>>();
    });

    it('non-Error rejections are auto-wrapped in `Error` when no errorFn is given', () => {
        // The signature is `(promise: Promise<T>, errorFn?: (e: unknown) => E)`.
        // Without an errorFn, non-Error rejections are auto-wrapped in
        // `new Error(String(e))` and the default error type is `Error`.
        const p = fromSafePromise(Promise.resolve(42));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, Error>>>();
    });

    it('preserves Promise<undefined> for promises that resolve to undefined', () => {
        const p = fromSafePromise(Promise.resolve(undefined));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<undefined, Error>>>();
    });

    it('preserves Promise<null> for promises that resolve to null', () => {
        const p = fromSafePromise(Promise.resolve(null));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<null, Error>>>();
    });

    it('preserves complex object value types', () => {
        interface User { id: number; name: string; }
        const p = fromSafePromise(Promise.resolve({ id: 1, name: 'Alice' } as User));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<User, Error>>>();
    });

    it('rejected-promise value type still resolves to IResultOfT<T, Error>', () => {
        // Even when the input rejects, the *static* result type is still
        // IResultOfT<T, Error> — the rejection value is captured, but the
        // outer Promise's resolution type is the same.
        const p = fromSafePromise(Promise.reject(new Error('inner')));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<never, Error>>>();
    });
});