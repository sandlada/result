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

    // ─── Default-error and mapper contract ─────────────────────────────────

    it('default E is `unknown` when errorFn is omitted', () => {
        const p = tryCatchAsync(async () => 1);
        expectTypeOf(p).toExtend<Promise<IResultOfT<number, unknown>>>();
    });

    it('errorFn argument is implicitly `unknown` (matches the rejection site)', () => {
        // The mapper is declared as `(error: unknown) => E`. Callers do not
        // need to annotate `e: unknown` explicitly.
        const p = tryCatchAsync(
            async () => 1,
            (e) => String(e),
        );
        expectTypeOf(p).toExtend<Promise<IResultOfT<number, string>>>();
    });

    it('rejects a mapper that returns the wrong error type when E is fixed', () => {
        type AppErr = { kind: 'App'; message: string };
        // @ts-expect-error mapper must return AppErr, not string
        tryCatchAsync<number, AppErr>(async () => 1, (): string => 'wrong');
    });

    it('preserves complex TValue types', () => {
        interface User { id: number; name: string; }
        const p = tryCatchAsync(async (): Promise<User> => ({ id: 1, name: 'Alice' }));
        expectTypeOf(p).toExtend<Promise<IResultOfT<User, unknown>>>();
    });
});