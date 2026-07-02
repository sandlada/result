import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResultOfT } from '../src/IResultOfT.js';
import { ok, err } from '../src/fp/core.js';

// ── Result.tryCatch (sync) ─────────────────────────────────────────────

describe('Result.tryCatch', () => {
    it('returns success when the function returns normally', () => {
        const result = Result.tryCatch(() => 42);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('returns failure when the function throws an Error', () => {
        const result = Result.tryCatch(() => {
            throw new Error('boom');
        });

        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe('boom');
        }
    });

    it('returns failure when the function throws a non-Error (default cast)', () => {
        const result = Result.tryCatch(() => {
            throw 'string error';
        });

        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('string error');
    });

    it('maps the caught error via errorFn to a discriminated union', () => {
        type AppErr = { kind: 'ParseError'; raw: string };

        const result = Result.tryCatch(
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
        const result = Result.tryCatch<number, number>(() => {
            throw 404;
        });

        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe(404);
    });

    it('preserves falsy return values (0, empty string, false, null)', () => {
        const zero = Result.tryCatch(() => 0);
        const emptyStr = Result.tryCatch(() => '');
        const boolFalse = Result.tryCatch(() => false);
        const nullVal = Result.tryCatch<string | null>(() => null);

        expect(zero.isSuccess).toBe(true); if (zero.isSuccess) expect(zero.value).toBe(0);
        expect(emptyStr.isSuccess).toBe(true); if (emptyStr.isSuccess) expect(emptyStr.value).toBe('');
        expect(boolFalse.isSuccess).toBe(true); if (boolFalse.isSuccess) expect(boolFalse.value).toBe(false);
        expect(nullVal.isSuccess).toBe(true); if (nullVal.isSuccess) expect(nullVal.value).toBeNull();
    });

    it('preserves complex return objects', () => {
        interface User {
            id: number;
            name: string;
            roles: string[];
        }

        const result = Result.tryCatch((): User => ({
            id: 1,
            name: 'Alice',
            roles: ['admin', 'editor'],
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

        const result = Result.tryCatch<string, InnerErr | OuterErr>(() => {
            const inner = Result.tryCatch<string, InnerErr>(() => {
                throw { inner: true as const, msg: 'inner failure' };
            });

            // inner is a Result, not thrown — so outer tryCatch sees success
            if (!inner.isSuccess) {
                return `handled: ${inner.error.msg}`;
            }
            return inner.value;
        });

        // The outer tryCatch doesn't throw; inner failure is handled explicitly
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe('handled: inner failure');
    });
});

// ── Result.combine ─────────────────────────────────────────────────────

describe('Result.combine', () => {
    it('returns success with all values when all results succeed', () => {
        const combined = Result.combine([
            Result.Success(1),
            Result.Success(2),
            Result.Success(3),
        ]);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([1, 2, 3]);
        }
    });

    it('short-circuits on the first failure and returns it', () => {
        const error = new Error('first failure');
        const combined = Result.combine([
            Result.Success(1),
            Result.Failure<number, Error>(error),
            Result.Success(3),
        ]);

        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toBe(error);
        }
    });

    it('short-circuits on a middle failure', () => {
        const middleErr = new Error('middle');
        const combined = Result.combine([
            Result.Success(1),
            Result.Failure<number, Error>(middleErr),
            Result.Failure<number, Error>(new Error('never seen')),
        ]);

        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toBe(middleErr);
            expect(combined.error.message).toBe('middle');
        }
    });

    it('returns success with empty array for empty input', () => {
        const combined = Result.combine([]);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([]);
        }
    });

    it('returns a single-element array for a single success', () => {
        const combined = Result.combine([Result.Success(42)]);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([42]);
        }
    });
});

// ── Result.all ─────────────────────────────────────────────────────────

describe('Result.all', () => {
    it('combines a heterogeneous tuple preserving each element type', () => {
        const all = Result.all([
            Result.Success<number>(1),
            Result.Success<string>('hello'),
            Result.Success<boolean>(true),
        ] as const);

        expect(all.isSuccess).toBe(true);
        if (all.isSuccess) {
            const [num, str, bool] = all.value;
            expect(num).toBe(1);
            expect(str).toBe('hello');
            expect(bool).toBe(true);
        }
    });

    it('short-circuits on the first failure in a tuple', () => {
        const error = new Error('failed');
        const all = Result.all([
            Result.Success<number>(1),
            Result.Failure<string, Error>(error),
            Result.Success<boolean>(true),
        ] as const);

        expect(all.isSuccess).toBe(false);
        if (!all.isSuccess) {
            expect(all.error).toBe(error);
        }
    });

    it('works with a single-element tuple', () => {
        const all = Result.all([Result.Success(42)] as const);

        expect(all.isSuccess).toBe(true);
        if (all.isSuccess) {
            const [val] = all.value;
            expect(val).toBe(42);
        }
    });

    it('preserves types when using as const on a tuple', () => {
        const all = Result.all([
            Result.Success(10),
            Result.Success('world'),
        ] as const);

        expect(all.isSuccess).toBe(true);
        if (all.isSuccess) {
            // Type inference: first is number, second is string
            const [a, b] = all.value;
            expect(typeof a).toBe('number');
            expect(typeof b).toBe('string');
        }
    });
});

// ── Result.combineWithAllErrors ────────────────────────────────────────

describe('Result.combineWithAllErrors', () => {
    it('returns success with all values when all results succeed', () => {
        const combined = Result.combineWithAllErrors([
            Result.Success(1),
            Result.Success(2),
            Result.Success(3),
        ]);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([1, 2, 3]);
        }
    });

    it('collects all errors when some results fail (no short-circuit)', () => {
        type VErr = { field: string; message: string };

        const combined = Result.combineWithAllErrors<string, VErr>([
            Result.Success<string>('valid') as unknown as IResultOfT<string, VErr>,
            Result.Failure<string, VErr>({ field: 'name', message: 'required' }),
            Result.Failure<string, VErr>({ field: 'email', message: 'invalid' }),
        ]);

        expect(combined.isFailure).toBe(true);
        if (combined.isFailure) {
            expect(combined.error).toHaveLength(2);
            expect(combined.error[0]!.field).toBe('name');
            expect(combined.error[1]!.field).toBe('email');
        }
    });

    it('collects all errors when every result fails', () => {
        const err1 = new Error('err1');
        const err2 = new Error('err2');
        const err3 = new Error('err3');

        const combined = Result.combineWithAllErrors([
            Result.Failure<number, Error>(err1),
            Result.Failure<number, Error>(err2),
            Result.Failure<number, Error>(err3),
        ]);

        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toHaveLength(3);
            expect(combined.error).toEqual([err1, err2, err3]);
        }
    });

    it('returns success with empty array for empty input', () => {
        const combined = Result.combineWithAllErrors([]);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([]);
        }
    });

    it('returns a single-error array for a single failure', () => {
        const error = new Error('only error');
        const combined = Result.combineWithAllErrors([
            Result.Failure<number, Error>(error),
        ]);

        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toEqual([error]);
        }
    });
});

// ── OOP / FP interop ───────────────────────────────────────────────────

describe('OOP → FP interop on static combinators', () => {
    it('Result.combine accepts ok()-created results', () => {
        const combined = Result.combine([
            ok(1),
            ok(2),
            ok(3),
        ]);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([1, 2, 3]);
        }
    });

    it('Result.all accepts ok()-created tuple elements', () => {
        const all = Result.all([
            ok<number>(42),
            ok<string>('hello'),
        ] as const);

        expect(all.isSuccess).toBe(true);
        if (all.isSuccess) {
            expect(all.value).toEqual([42, 'hello']);
        }
    });

    it('Result.combineWithAllErrors accepts mixed ok() / err() elements', () => {
        type AppErr = string;

        const combined = Result.combineWithAllErrors([
            ok<number>(1),
            err<AppErr>('bad'),
            ok<number>(3),
            err<AppErr>('also bad'),
        ]);

        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toEqual(['bad', 'also bad']);
        }
    });
});
