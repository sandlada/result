import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResultOfT } from '../src/IResultOfT.js';

// ── tryCatchAsync ──────────────────────────────────────────────────────

describe('Result.tryCatchAsync', () => {
    it('resolves to success when the async function fulfills', async () => {
        const result = await Result.tryCatchAsync(async () => 42);

        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(42);
    });

    it('resolves to failure when the async function rejects', async () => {
        const result = await Result.tryCatchAsync(async () => {
            throw new Error('async boom');
        });

        expect(result.isSuccess).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe('async boom');
    });

    it('resolves to failure when the async function throws synchronously', async () => {
        const result = await Result.tryCatchAsync(() => {
            throw new Error('sync throw in async context');
        });

        expect(result.isSuccess).toBe(false);
        expect(result.error.message).toBe('sync throw in async context');
    });

    it('maps the error with errorFn on rejection', async () => {
        type AppErr = { kind: 'NetworkError'; status: number };

        const result = await Result.tryCatchAsync(
            async () => {
                const resp = { status: 500 } as Response;
                throw resp;
            },
            (e: unknown) =>
                ({ kind: 'NetworkError', status: (e as Response).status }) satisfies AppErr,
        );

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error.kind).toBe('NetworkError');
            expect(result.error.status).toBe(500);
        }
    });

    it('uses direct cast when errorFn is omitted (default TError = Error)', async () => {
        const result = await Result.tryCatchAsync(async () => {
            throw 'string error';
        });

        expect(result.isSuccess).toBe(false);
        // With default Error type, the thrown string is cast — it's structural
        expect(result.error).toBe('string error');
    });

    it('infers TError from errorFn return type', async () => {
        const result = await Result.tryCatchAsync(
            async () => 1,
            () => 404 as const,
        );

        // Type test: result should be IResultOfT<number, 404>
        if (!result.isSuccess) {
            const code: 404 = result.error;
            expect(code).toBe(404);
        }
    });

    it('preserves complex value types', async () => {
        interface User { id: number; name: string }

        const result = await Result.tryCatchAsync<User>(async () => ({
            id: 1,
            name: 'Alice',
        }));

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
            expect(result.value.id).toBe(1);
            expect(result.value.name).toBe('Alice');
        }
    });

    it('handles Promise rejection (not throw)', async () => {
        const result = await Result.tryCatchAsync(() =>
            Promise.reject(new Error('rejected promise')),
        );

        expect(result.isSuccess).toBe(false);
        expect(result.error.message).toBe('rejected promise');
    });
});

// ── fromPromise ─────────────────────────────────────────────────────────

describe('Result.fromPromise', () => {
    it('resolves to success when the promise fulfills', async () => {
        const promise = Promise.resolve('hello');
        const result = await Result.fromPromise(promise);

        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('resolves to failure when the promise rejects', async () => {
        const promise = Promise.reject(new Error('rejected'));
        const result = await Result.fromPromise(promise);

        expect(result.isSuccess).toBe(false);
        expect(result.error.message).toBe('rejected');
    });

    it('maps the error with errorFn on rejection', async () => {
        const promise = Promise.reject('raw string');
        const result = await Result.fromPromise(promise, (e) => ({
            wrapped: String(e),
        }));

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error.wrapped).toBe('raw string');
        }
    });

    it('preserves generic value type', async () => {
        const promise: Promise<{ a: number }> = Promise.resolve({ a: 1 });
        const result = await Result.fromPromise(promise);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
            expect(result.value.a).toBe(1);
        }
    });

    it('delegates to tryCatchAsync (same behavior for errorFn omitted)', async () => {
        // Both should produce identical results for the same rejected promise
        const promise = Promise.reject(new Error('same'));
        const [a, b] = await Promise.all([
            Result.tryCatchAsync(() => promise),
            Result.fromPromise(promise),
        ]);

        expect(a.isSuccess).toBe(false);
        expect(b.isSuccess).toBe(false);
        expect((a as IResultOfT<unknown, Error>).error.message).toBe(
            (b as IResultOfT<unknown, Error>).error.message,
        );
    });
});
