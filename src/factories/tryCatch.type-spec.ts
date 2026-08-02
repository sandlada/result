import { describe, it, expectTypeOf } from 'vitest';
import { tryCatch } from './tryCatch.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('tryCatch types', () => {
    it('returns IResultOfT<T, unknown> without errorFn', () => {
        const r = tryCatch(() => 42);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, unknown>>();
    });

    it('infers T from the wrapped function return', () => {
        const r = tryCatch(() => 'hello');
        expectTypeOf(r).toMatchTypeOf<IResultOfT<string, unknown>>();
    });

    it('errorFn narrows the error type', () => {
        const r = tryCatch(
            () => JSON.parse('{}'),
            (e: unknown) => new Error(String(e)),
        );
        expectTypeOf(r).toMatchTypeOf<IResultOfT<unknown, Error>>();
    });

    it('errorFn can return any custom error type', () => {
        type AppError = { kind: 'AppError'; message: string };
        const r = tryCatch<unknown, AppError>(
            () => JSON.parse('{}'),
            (e) => ({ kind: 'AppError' as const, message: String(e) }),
        );
        expectTypeOf(r).toMatchTypeOf<IResultOfT<unknown, AppError>>();
    });

    // ─── Default error type ────────────────────────────────────────────────

    it('default E is `unknown` (the documented no-mapper contract)', () => {
        // The mapper overload is optional; when omitted, E defaults to `unknown`.
        // Callers must narrow or supply an errorFn — the library does not
        // silently coerce an unknown thrown value to a specific shape.
        const r = tryCatch(() => 1);
        type R = typeof r;
        // R extends IResultOfT<number, unknown>; verify the error type literally.
        expectTypeOf<R>().toMatchTypeOf<IResultOfT<number, unknown>>();
    });

    it('explicit errorFn widens the error to its return type', () => {
        // The mapper's return type drives the error type parameter of the result.
        const r = tryCatch(
            () => 1,
            (): 'ParseError' => 'ParseError',
        );
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, 'ParseError'>>();
    });

    it('errorFn argument is implicitly `unknown`', () => {
        // The mapper is declared as `(error: unknown) => E`. Callers do not
        // need to annotate `e: unknown` explicitly; the parameter type
        // matches the throw site.
        const r = tryCatch(
            () => 1,
            (e) => String(e), // e is implicitly unknown here
        );
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, string>>();
    });

    it('preserves complex TValue types', () => {
        interface User { id: number; name: string; }
        const r = tryCatch((): User => ({ id: 1, name: 'Alice' }));
        expectTypeOf(r).toMatchTypeOf<IResultOfT<User, unknown>>();
    });

    it('supports explicit type parameters for both T and E', () => {
        // Both type parameters can be supplied explicitly when the inference
        // context is ambiguous (e.g. empty success branch).
        const r = tryCatch<number, Error>(() => 1);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, Error>>();
    });

    it('rejects a mapper that returns the wrong error type when E is fixed', () => {
        // If E is fixed to a specific shape, the mapper must return that shape.
        type AppErr = { kind: 'App'; message: string };
        // @ts-expect-error mapper must return AppErr, not string
        tryCatch<number, AppErr>(() => 1, (): string => 'wrong');
    });
});