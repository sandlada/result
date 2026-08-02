import { describe, it, expect } from 'vitest';
import { tryCatchAsync } from './index.js';
import { unwrap } from '../operators/index.js';

describe('tryCatchAsync', () => {
    it('returns success when the async function resolves', async () => {
        const result = await tryCatchAsync(async () => 42);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('returns failure when the async function throws', async () => {
        const result = await tryCatchAsync(async () => {
            throw new Error('boom');
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe('boom');
        }
    });

    it('preserves falsy return values', async () => {
        const result = await tryCatchAsync(async () => 0);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(0);
    });

    it('maps error via errorFn', async () => {
        const result = await tryCatchAsync(
            async () => { throw 'raw error'; },
            (e: unknown) => String(e),
        );
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('raw error');
    });

    // ─── Default-error contract ────────────────────────────────────────────

    it('default error type is `unknown` — non-Error rejections pass through unchanged', async () => {
        const thrown = { code: 500, message: 'server' };
        const result = await tryCatchAsync(async (): Promise<number> => {
            throw thrown;
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe(thrown);
    });

    it('default error type is `unknown` — string rejections pass through', async () => {
        const result = await tryCatchAsync(async (): Promise<number> => {
            throw 'plain';
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('plain');
    });

    it('default error type is `unknown` — null rejections pass through', async () => {
        const result = await tryCatchAsync(async (): Promise<number> => {
            throw null;
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBeNull();
    });

    it('default error type is `unknown` — undefined rejections pass through', async () => {
        const result = await tryCatchAsync(async (): Promise<number> => {
            throw undefined;
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBeUndefined();
    });

    // ─── errorFn mapping ───────────────────────────────────────────────────

    it('errorFn receives the rejection value and its return drives the error variant', async () => {
        let captured: unknown = undefined;
        const result = await tryCatchAsync(
            async (): Promise<number> => {
                throw 'raw';
            },
            (e: unknown) => {
                captured = e;
                return { wrapped: String(e) };
            },
        );
        expect(captured).toBe('raw');
        if (result.isFailure) {
            expect(result.error).toEqual({ wrapped: 'raw' });
        }
    });

    it('errorFn is not invoked when the async function resolves normally', async () => {
        let called = 0;
        const result = await tryCatchAsync(
            async () => 1,
            () => {
                called += 1;
                return 'should-not-be-used';
            },
        );
        expect(result.isSuccess).toBe(true);
        expect(called).toBe(0);
    });

    it('errorFn maps an Error rejection to a discriminated union', async () => {
        type AppErr = { kind: 'AppError'; raw: string };
        const result = await tryCatchAsync(
            async () => {
                throw new Error('boom');
            },
            (e: unknown): AppErr => ({
                kind: 'AppError' as const,
                raw: e instanceof Error ? e.message : String(e),
            }),
        );
        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error.kind).toBe('AppError');
            expect(result.error.raw).toBe('boom');
        }
    });

    it('errorFn is invoked exactly once per rejection (no double-mapping)', async () => {
        let called = 0;
        const result = await tryCatchAsync(
            async (): Promise<number> => {
                throw 'x';
            },
            () => {
                called += 1;
                return 'mapped';
            },
        );
        expect(called).toBe(1);
        if (result.isFailure) expect(result.error).toBe('mapped');
    });

    // ─── Behavioural edges ─────────────────────────────────────────────────

    it('returned Promise resolves to an IResultOfT<T, E>', async () => {
        const result = await tryCatchAsync(async () => 'ok');
        // The result should be unwrappable.
        expect(unwrap(result)).toBe('ok');
    });

    it('preserves complex return objects', async () => {
        interface User { id: number; name: string; }
        const result = await tryCatchAsync(async (): Promise<User> => ({
            id: 1, name: 'Alice',
        }));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
            expect(result.value.id).toBe(1);
            expect(result.value.name).toBe('Alice');
        }
    });

    it('returned IResult does not carry both value and error at once', async () => {
        const result = await tryCatchAsync(async () => 42);
        if (result.isSuccess) {
            expect(result).toHaveProperty('value');
            expect(result).not.toHaveProperty('error');
        }
    });

    it('rejection after partial await is still caught (Promise rejection, not throw)', async () => {
        const result = await tryCatchAsync(async () => {
            await Promise.resolve();
            throw new Error('after-await');
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe('after-await');
        }
    });
});