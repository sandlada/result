import { describe, it, expect } from 'vitest';
import { tryCatch } from './index.js';

describe('tryCatch', () => {
    it('returns success when the function returns normally', () => {
        const result = tryCatch(() => 42);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('returns failure when the function throws an Error', () => {
        const result = tryCatch(() => {
            throw new Error('boom');
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe('boom');
        }
    });

    it('returns failure when the function throws a non-Error (default cast)', () => {
        const result = tryCatch(() => {
            throw 'string error';
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('string error');
    });

    it('maps the caught error via errorFn to a discriminated union', () => {
        type AppErr = { kind: 'ParseError'; raw: string };
        const result = tryCatch(
            () => JSON.parse('invalid'),
            (e: unknown) =>
                ({ kind: 'ParseError', raw: String(e) }) satisfies AppErr,
        );
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error.kind).toBe('ParseError');
            expect(result.error.raw).toContain('JSON');
        }
    });

    it('uses direct cast when errorFn is omitted with explicit TError type param', () => {
        const result = tryCatch<number, number>(() => {
            throw 404;
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe(404);
    });

    it('preserves falsy return values (0, empty string, false, null)', () => {
        const zero = tryCatch(() => 0);
        const emptyStr = tryCatch(() => '');
        const boolFalse = tryCatch(() => false);
        const nullVal = tryCatch<string | null>(() => null);
        expect(zero.isSuccess).toBe(true); if (zero.isSuccess) expect(zero.value).toBe(0);
        expect(emptyStr.isSuccess).toBe(true); if (emptyStr.isSuccess) expect(emptyStr.value).toBe('');
        expect(boolFalse.isSuccess).toBe(true); if (boolFalse.isSuccess) expect(boolFalse.value).toBe(false);
        expect(nullVal.isSuccess).toBe(true); if (nullVal.isSuccess) expect(nullVal.value).toBeNull();
    });

    it('preserves complex return objects', () => {
        interface User { id: number; name: string; roles: string[]; }
        const result = tryCatch((): User => ({
            id: 1, name: 'Alice', roles: ['admin', 'editor'],
        }));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
            expect(result.value.id).toBe(1);
            expect(result.value.name).toBe('Alice');
            expect(result.value.roles).toEqual(['admin', 'editor']);
        }
    });

    it('does not swallow inner tryCatch failures', () => {
        type InnerErr = { inner: true; msg: string };
        type OuterErr = { outer: true };
        const result = tryCatch<string, InnerErr | OuterErr>(() => {
            const inner = tryCatch<string, InnerErr>(() => {
                throw { inner: true as const, msg: 'inner failure' };
            });
            if (!inner.isSuccess) {
                return `handled: ${inner.error.msg}`;
            }
            return inner.value;
        });
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe('handled: inner failure');
    });

    // ─── Default-error contract ────────────────────────────────────────────

    it('default error type is `unknown` — non-Error throws pass through unchanged', () => {
        // Without an errorFn, the thrown value is passed through (cast to `unknown`).
        // Verify a thrown object survives without wrapping.
        const thrown = { code: 500, message: 'server' };
        const result = tryCatch((): number => {
            throw thrown;
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe(thrown);
    });

    it('default error type is `unknown` — null throws pass through', () => {
        const result = tryCatch((): number => {
            throw null;
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBeNull();
    });

    it('default error type is `unknown` — undefined throws pass through', () => {
        const result = tryCatch((): number => {
            throw undefined;
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBeUndefined();
    });

    it('default error type is `unknown` — number throws pass through', () => {
        const result = tryCatch((): number => {
            throw 42;
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe(42);
    });

    // ─── errorFn mapping ───────────────────────────────────────────────────

    it('errorFn receives the thrown value and its return drives the error variant', () => {
        // The mapper contract: it accepts `unknown` and returns the configured E.
        let captured: unknown = undefined;
        const result = tryCatch(
            () => {
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

    it('errorFn is not invoked when the function returns normally', () => {
        let called = 0;
        const result = tryCatch(
            () => 1,
            () => {
                called += 1;
                return 'should-not-be-used';
            },
        );
        expect(result.isSuccess).toBe(true);
        expect(called).toBe(0);
    });

    it('errorFn maps Error instances to a narrower discriminated union', () => {
        type AppErr = { kind: 'AppError'; raw: string };
        const result = tryCatch(
            () => JSON.parse('not json'),
            (e: unknown): AppErr => ({
                kind: 'AppError' as const,
                raw: e instanceof Error ? e.message : String(e),
            }),
        );
        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error.kind).toBe('AppError');
            expect(typeof result.error.raw).toBe('string');
        }
    });

    it('errorFn mapping returns the mapped error verbatim', () => {
        // The errorFn result is wrapped in `err(...)` directly. The mapper's
        // output must be the exact value placed into the failure variant.
        const result = tryCatch(
            (): never => {
                throw new Error('original');
            },
            () => 'mapped',
        );
        if (result.isFailure) {
            expect(result.error).toBe('mapped');
        }
    });

    // ─── Behavioural edges ─────────────────────────────────────────────────

    it('does not invoke the wrapped function on import / definition (eager)', () => {
        // The signature is `tryCatch(fn: () => T)` — `fn` is the callback. The
        // factory invokes it eagerly when called. Verify by counting invocations.
        let invocations = 0;
        const result = tryCatch(() => {
            invocations += 1;
            return 'ok';
        });
        expect(invocations).toBe(1);
        expect(result.isSuccess).toBe(true);
    });

    it('returned IResult does not carry both value and error at once', () => {
        // Mutually exclusive discriminator — at most one of value/error exists.
        const result = tryCatch(() => 42);
        if (result.isSuccess) {
            expect(result).toHaveProperty('value');
            expect(result).not.toHaveProperty('error');
        }
    });

    it('synchronous throw inside an arrow body is caught', () => {
        const result = tryCatch((): number => {
            throw new RangeError('out of bounds');
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error).toBeInstanceOf(RangeError);
        }
    });
});