import { describe, it, expectTypeOf } from 'vitest';
import { tryCatchAsync } from './tryCatchAsync.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('tryCatchAsync types', () => {
    it('returns Promise<IResultOfT<T, unknown>> without errorFn', async () => {
        const p = tryCatchAsync(async () => 42);
        expectTypeOf(p).toExtend<Promise<IResultOfT<number, unknown>>>();
    });

    it('infers T from the async function return', async () => {
        const p = tryCatchAsync(async () => 'hello');
        expectTypeOf(p).toExtend<Promise<IResultOfT<string, unknown>>>();
    });

    it('errorFn narrows the error type', () => {
        const p = tryCatchAsync(
            async () => JSON.parse('{}'),
            (e: unknown) => new Error(String(e)),
        );
        expectTypeOf(p).toExtend<Promise<IResultOfT<unknown, Error>>>();
    });

    it('errorFn can return any custom error type', () => {
        type AppError = { kind: 'AppError'; message: string };
        const p = tryCatchAsync<unknown, AppError>(
            async () => JSON.parse('{}'),
            (e) => ({ kind: 'AppError' as const, message: String(e) }),
        );
        expectTypeOf(p).toExtend<Promise<IResultOfT<unknown, AppError>>>();
    });
});
