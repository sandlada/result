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

    // ─── Default-error and mapper contract ─────────────────────────────────

    it('default E is `unknown` when errorFn is omitted (catches any rejection)', () => {
        // Document the contract: callers may pass any rejecting Promise and
        // the error type stays `unknown` until they supply an errorFn.
        const p = fromPromise(Promise.reject('x'));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<never, unknown>>>();
    });

    it('errorFn argument is implicitly `unknown`', () => {
        // The mapper is declared as `(error: unknown) => E`.
        const p = fromPromise(
            Promise.resolve(42),
            (e) => String(e),
        );
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, string>>>();
    });

    it('rejects a mapper that returns the wrong error type when E is fixed', () => {
        type AppErr = { kind: 'App'; message: string };
        // @ts-expect-error mapper must return AppErr, not string
        fromPromise<number, AppErr>(Promise.resolve(42), (): string => 'wrong');
    });

    it('preserves Promise<undefined> for promises that resolve to undefined', () => {
        const p = fromPromise(Promise.resolve(undefined));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<undefined, unknown>>>();
    });

    it('preserves Promise<null> for promises that resolve to null', () => {
        const p = fromPromise(Promise.resolve(null));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<null, unknown>>>();
    });

    it('preserves complex object value types', () => {
        interface User { id: number; name: string; }
        const p = fromPromise(Promise.resolve({ id: 1, name: 'Alice' } as User));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<User, unknown>>>();
    });

    it('accepts an optional errorFn as the second argument', () => {
        // Pinned: `fromPromise<T, E>(promise, errorFn?: (error: unknown) => E)`
        // is a 2-arity function. The one-argument form leaves `E = unknown`;
        // supplying `errorFn` is what narrows `E`.
        const p = fromPromise(Promise.resolve(1));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, unknown>>>();
        const mapped = fromPromise(Promise.resolve(1), (e: unknown) => String(e));
        expectTypeOf(mapped).toEqualTypeOf<Promise<IResultOfT<number, string>>>();
        // A third argument is not part of the contract.
        // @ts-expect-error fromPromise takes at most two arguments
        fromPromise(Promise.resolve(1), (e: unknown) => String(e), 'extra');
    });
});