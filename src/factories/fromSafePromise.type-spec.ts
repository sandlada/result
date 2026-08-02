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

    // ─── Non-configurable error type ───────────────────────────────────────

    it('rejects an explicit E type parameter — the error type is fixed', () => {
        // fromSafePromise does not expose an E type parameter; callers cannot
        // customise the error type. The error is always `Error`.
        // @ts-expect-error fromSafePromise takes only one type parameter (T)
        const _p = fromSafePromise<number, string>(Promise.resolve(42));
        void _p;
    });

    it('does not accept an errorFn argument — non-Error rejections are auto-wrapped', () => {
        // The signature is `(promise: Promise<T>) => Promise<IResultOfT<T, Error>>`.
        // No errorFn is part of the contract — the function auto-wraps non-Error
        // rejections in `new Error(String(e))`.
        const p = fromSafePromise(Promise.resolve(42));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, Error>>>();
        // @ts-expect-error fromSafePromise does not accept an errorFn
        fromSafePromise(Promise.resolve(42), (e) => String(e));
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