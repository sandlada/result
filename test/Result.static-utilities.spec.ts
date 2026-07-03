import { describe, it, expect } from 'vitest';
import { ok, err } from '../src/index.js';
import { tryCatch, fromThrowable, fromPredicate } from '../src/index.js';
import type { IResultOfT } from '../src/types/IResultOfT.js';
import { combine, all, combineWithAllErrors } from '../src/index.js';

// ── Result.tryCatch (sync) ─────────────────────────────────────────────

describe('Result.tryCatch', () => {
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
        interface User {
            id: number;
            name: string;
            roles: string[];
        }

        const result = tryCatch((): User => ({
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

        const result = tryCatch<string, InnerErr | OuterErr>(() => {
            const inner = tryCatch<string, InnerErr>(() => {
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

describe('combine', () => {
    it('returns success with all values when all results succeed', () => {
        const combined = combine([
            ok(1),
            ok(2),
            ok(3),
        ]);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([1, 2, 3]);
        }
    });

    it('short-circuits on the first failure and returns it', () => {
        const error = new Error('first failure');
        const combined = combine([
            ok(1),
            err<number, Error>(error),
            ok(3),
        ]);

        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toBe(error);
        }
    });

    it('short-circuits on a middle failure', () => {
        const middleErr = new Error('middle');
        const combined = combine([
            ok(1),
            err<number, Error>(middleErr),
            err<number, Error>(new Error('never seen')),
        ]);

        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toBe(middleErr);
            expect(combined.error.message).toBe('middle');
        }
    });

    it('returns success with empty array for empty input', () => {
        const combined = combine([]);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([]);
        }
    });

    it('returns a single-element array for a single success', () => {
        const combined = combine([ok(42)]);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([42]);
        }
    });
});

// ── Result.all ─────────────────────────────────────────────────────────

describe('all', () => {
    it('combines a heterogeneous tuple preserving each element type', () => {
        const combined = all([
            ok<number>(1),
            ok<string>('hello'),
            ok<boolean>(true),
        ] as const);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            const [num, str, bool] = combined.value;
            expect(num).toBe(1);
            expect(str).toBe('hello');
            expect(bool).toBe(true);
        }
    });

    it('short-circuits on the first failure in a tuple', () => {
        const error = new Error('failed');
        const combined = all([
            ok<number>(1),
            err<string, Error>(error),
            ok<boolean>(true),
        ] as const);

        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toBe(error);
        }
    });

    it('works with a single-element tuple', () => {
        const combined = all([ok(42)] as const);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            const [val] = combined.value;
            expect(val).toBe(42);
        }
    });

    it('preserves types when using as const on a tuple', () => {
        const combined = all([
            ok(10),
            ok('world'),
        ] as const);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            const [a, b] = combined.value;
            expect(typeof a).toBe('number');
            expect(typeof b).toBe('string');
        }
    });
});

// ── Result.combineWithAllErrors ────────────────────────────────────────

describe('combineWithAllErrors', () => {
    it('returns success with all values when all results succeed', () => {
        const combined = combineWithAllErrors([
            ok(1),
            ok(2),
            ok(3),
        ]);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([1, 2, 3]);
        }
    });

    it('collects all errors when some results fail (no short-circuit)', () => {
        type VErr = { field: string; message: string };

        const combined = combineWithAllErrors<string, VErr>([
            ok<string>('valid') as unknown as IResultOfT<string, VErr>,
            err<string, VErr>({ field: 'name', message: 'required' }),
            err<string, VErr>({ field: 'email', message: 'invalid' }),
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

        const combined = combineWithAllErrors([
            err<number, Error>(err1),
            err<number, Error>(err2),
            err<number, Error>(err3),
        ]);

        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toHaveLength(3);
            expect(combined.error).toEqual([err1, err2, err3]);
        }
    });

    it('returns success with empty array for empty input', () => {
        const combined = combineWithAllErrors([]);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([]);
        }
    });

    it('returns a single-error array for a single failure', () => {
        const error = new Error('only error');
        const combined = combineWithAllErrors([
            err<number, Error>(error),
        ]);

        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toEqual([error]);
        }
    });
});



