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
});
