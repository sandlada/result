import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResultOfT } from '../src/IResultOfT.js';

// FP operators
import { mapOr, mapOrElse } from '../src/fp/operators.js';
import { fromThrowable } from '../src/fp/core.js';

// ─── fromThrowable ──────────────────────────────────────────────────────────

describe('fromThrowable', () => {
    it('OOP: wraps a throwing function', () => {
        const safeParse = Result.fromThrowable(JSON.parse);
        const r = safeParse('{"a":1}');
        expect(r.isSuccess).toBe(true);
        expect(r.unwrap()).toEqual({ a: 1 });
    });

    it('OOP: caught error becomes failure', () => {
        const safeParse = Result.fromThrowable(JSON.parse);
        const r = safeParse('not json');
        expect(r.isSuccess).toBe(false);
        expect(r.unwrapErr()).toBeInstanceOf(SyntaxError);
    });

    it('OOP: error mapper transforms the thrown value', () => {
        const safeParse = Result.fromThrowable(
            JSON.parse,
            (e) => ({ kind: 'ParseError' as const, message: String(e) }),
        );
        const r = safeParse('bad');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error.kind).toBe('ParseError');
        }
    });

    it('FP: same as OOP static', () => {
        const safeDiv = fromThrowable(
            (a: number, b: number) => {
                if (b === 0) throw new Error('div by zero');
                return a / b;
            },
            (e) => String(e),
        );

        const r1 = safeDiv(10, 2);
        expect(r1.unwrap()).toBe(5);

        const r2 = safeDiv(10, 0);
        expect(r2.unwrapErr()).toBe('Error: div by zero');
    });
});

// ─── mapOr / mapOrElse ──────────────────────────────────────────────────────

describe('mapOr / mapOrElse', () => {
    describe('mapOr', () => {
        it('OOP: maps success value', () => {
            const r = Result.Success(5);
            expect(r.mapOr(0, (v) => v * 2)).toBe(10);
        });

        it('OOP: returns default on failure', () => {
            const r = Result.Failure<number>(new Error('fail'));
            expect(r.mapOr(100, (v) => v * 2)).toBe(100);
        });

        it('FP: direct form', () => {
            const r: IResultOfT<number> = Result.Success(3);
            expect(mapOr(0, (v: number) => v + 1, r)).toBe(4);
        });

        it('FP: curried form', () => {
            const doubleOrZero = mapOr(0, (v: number) => v * 2);
            expect(doubleOrZero(Result.Success(5))).toBe(10);
            expect(doubleOrZero(Result.Failure<number>(new Error('x')))).toBe(0);
        });
    });

    describe('mapOrElse', () => {
        it('OOP: maps success value', () => {
            const r = Result.Success('hello');
            expect(r.mapOrElse(
                (e) => `error: ${e.message}`,
                (v) => v.toUpperCase(),
            )).toBe('HELLO');
        });

        it('OOP: calls error handler on failure', () => {
            const r = Result.Failure<string>(new Error('not found'));
            expect(r.mapOrElse(
                (e) => `error: ${e.message}`,
                (v) => v.toUpperCase(),
            )).toBe('error: not found');
        });

        it('FP: direct form', () => {
            const r: IResultOfT<number> = Result.Failure<number>(new Error('x'));
            const result = mapOrElse(
                (e: Error) => e.message.length,
                (v: number) => v * 2,
                r,
            );
            expect(result).toBe(1); // "x".length
        });

        it('FP: curried form', () => {
            const handle = mapOrElse(
                (e: Error) => `fail: ${e.message}`,
                (v: number) => `ok: ${v}`,
            );
            expect(handle(Result.Success(42))).toBe('ok: 42');
            expect(handle(Result.Failure<number>(new Error('boom')))).toBe('fail: boom');
        });
    });
});

// ─── getOrNull / getOrUndefined ─────────────────────────────────────────────

describe('getOrNull / getOrUndefined', () => {
    describe('getOrNull', () => {
        it('returns value on success', () => {
            expect(Result.Success(42).getOrNull()).toBe(42);
        });

        it('returns null on failure', () => {
            expect(Result.Failure<number>(new Error('nope')).getOrNull()).toBeNull();
        });

        it('returns null (not undefined) on failure', () => {
            const r = Result.Failure<string>(new Error('err'));
            const val: string | null = r.getOrNull();
            expect(val).toBeNull();
        });
    });

    describe('getOrUndefined', () => {
        it('returns value on success', () => {
            expect(Result.Success('hello').getOrUndefined()).toBe('hello');
        });

        it('returns undefined on failure', () => {
            expect(Result.Failure<string>(new Error('nope')).getOrUndefined()).toBeUndefined();
        });
    });
});

// ─── tap on IResult (void result) ───────────────────────────────────────────

describe('tap on IResult (void result)', () => {
    it('calls fn on success', () => {
        let called = false;
        const r = Result.Success();
        const result = r.tap(() => { called = true; });
        expect(called).toBe(true);
        expect(result.isSuccess).toBe(true);
    });

    it('does not call fn on failure', () => {
        let called = false;
        const r = Result.Failure(new Error('nope'));
        r.tap(() => { called = true; });
        expect(called).toBe(false);
    });

    it('returns this for chaining', () => {
        const r = Result.Success();
        const r2 = r.tap(() => { /* noop */ });
        expect(r2.isSuccess).toBe(true);
    });
});

// ─── toString ───────────────────────────────────────────────────────────────

describe('toString', () => {
    it('void success: "Ok"', () => {
        expect(Result.Success().toString()).toBe('Ok');
    });

    it('void failure: "Err(error)"', () => {
        const r = Result.Failure(new Error('boom'));
        expect(r.toString()).toContain('Err(');
        expect(r.toString()).toContain('boom');
    });

    it('value success: "Ok(value)"', () => {
        expect(Result.Success(42).toString()).toBe('Ok(42)');
        expect(Result.Success('hello').toString()).toBe('Ok(hello)');
    });

    it('value failure: "Err(error)"', () => {
        const r = Result.Failure<number>(new Error('bad'));
        expect(r.toString()).toContain('Err(');
        expect(r.toString()).toContain('bad');
    });
});
