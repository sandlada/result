import { describe, it, expect } from 'vitest';
import { fromThrowable } from './index.js';
import { unwrap, unwrapErr } from '../operators/index.js';

describe('fromThrowable', () => {
    it('wraps a throwing function', () => {
        const safeParse = fromThrowable(JSON.parse);
        const r = safeParse('{"a":1}');
        expect(r.isSuccess).toBe(true);
        expect(unwrap(r)).toEqual({ a: 1 });
    });

    it('caught error becomes failure', () => {
        const safeParse = fromThrowable(JSON.parse);
        const r = safeParse('not json');
        expect(r.isSuccess).toBe(false);
        expect(unwrapErr(r)).toBeInstanceOf(SyntaxError);
    });

    it('error mapper transforms the thrown value', () => {
        const safeParse = fromThrowable(
            JSON.parse,
            (e) => ({ kind: 'ParseError' as const, message: String(e) }),
        );
        const r = safeParse('bad');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error.kind).toBe('ParseError');
        }
    });

    it('with error mapper', () => {
        const safeDiv = fromThrowable(
            (a: number, b: number) => {
                if (b === 0) throw new Error('div by zero');
                return a / b;
            },
            (e) => String(e),
        );
        const r1 = safeDiv(10, 2);
        expect(unwrap(r1)).toBe(5);
        const r2 = safeDiv(10, 0);
        expect(unwrapErr(r2)).toBe('Error: div by zero');
    });

    // ─── Lift semantics ────────────────────────────────────────────────────

    it('the inner function is not invoked by fromThrowable itself (lift, not call)', () => {
        // fromThrowable returns a new function; it does NOT call the wrapped fn.
        let invocations = 0;
        const safe = fromThrowable(() => {
            invocations += 1;
            return 42;
        });
        expect(invocations).toBe(0); // not called yet
        const r = safe();
        expect(invocations).toBe(1); // called once when the wrapper runs
        expect(r.isSuccess).toBe(true);
    });

    it('forwards all arguments to the wrapped function in order', () => {
        const safe = fromThrowable((a: number, b: number, c: number) => [a, b, c] as const);
        const r = safe(1, 2, 3);
        if (r.isSuccess) expect(r.value).toEqual([1, 2, 3]);
    });

    it('preserves zero-argument signature', () => {
        const safe = fromThrowable(() => 'fixed');
        const r = safe();
        if (r.isSuccess) expect(r.value).toBe('fixed');
    });

    it('preserves variadic (rest) argument signature', () => {
        const safe = fromThrowable((...nums: number[]) => nums.reduce((a, b) => a + b, 0));
        const r = safe(1, 2, 3, 4);
        if (r.isSuccess) expect(r.value).toBe(10);
    });

    // ─── Default-error contract ────────────────────────────────────────────

    it('default error type is `unknown` — string throws pass through', () => {
        const safe = fromThrowable((): number => {
            throw 'string err';
        });
        const r = safe();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('string err');
    });

    it('default error type is `unknown` — object throws pass through unchanged', () => {
        const thrown = { code: 500, message: 'server' };
        const safe = fromThrowable((): number => {
            throw thrown;
        });
        const r = safe();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(thrown);
    });

    it('default error type is `unknown` — null throws pass through', () => {
        const safe = fromThrowable((): number => {
            throw null;
        });
        const r = safe();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeNull();
    });

    // ─── errorFn mapping ───────────────────────────────────────────────────

    it('errorFn is not invoked when the wrapped function returns normally', () => {
        let called = 0;
        const safe = fromThrowable(
            () => 1,
            () => {
                called += 1;
                return 'should-not-be-used';
            },
        );
        const r = safe();
        expect(r.isSuccess).toBe(true);
        expect(called).toBe(0);
    });

    it('errorFn receives the thrown value and its return drives the error variant', () => {
        let captured: unknown = undefined;
        const safe = fromThrowable(
            (): number => {
                throw 'raw';
            },
            (e: unknown) => {
                captured = e;
                return { wrapped: String(e) };
            },
        );
        const r = safe();
        expect(captured).toBe('raw');
        if (r.isFailure) {
            expect(r.error).toEqual({ wrapped: 'raw' });
        }
    });

    it('errorFn maps an Error to a narrower discriminated union', () => {
        type AppErr = { kind: 'AppError'; raw: string };
        const safe = fromThrowable(
            (s: string) => JSON.parse(s),
            (e: unknown): AppErr => ({
                kind: 'AppError' as const,
                raw: e instanceof Error ? e.message : String(e),
            }),
        );
        const r = safe('not json');
        if (r.isFailure) {
            expect(r.error.kind).toBe('AppError');
            expect(typeof r.error.raw).toBe('string');
        }
    });

    // ─── Behavioural edges ─────────────────────────────────────────────────

    it('preserves falsy return values (0, false, empty string, null)', () => {
        const safeZero = fromThrowable(() => 0);
        const safeFalse = fromThrowable(() => false);
        const safeEmpty = fromThrowable(() => '');
        const safeNull = fromThrowable((): string | null => null);
        expect(unwrap(safeZero())).toBe(0);
        expect(unwrap(safeFalse())).toBe(false);
        expect(unwrap(safeEmpty())).toBe('');
        expect(unwrap(safeNull())).toBeNull();
    });

    it('returned IResult does not carry both value and error at once', () => {
        const safe = fromThrowable(() => 42);
        const r = safe();
        if (r.isSuccess) {
            expect(r).toHaveProperty('value');
            expect(r).not.toHaveProperty('error');
        }
    });

    it('the wrapper function is reentrant — call it many times with mixed outcomes', () => {
        let counter = 0;
        const safe = fromThrowable((): number => {
            counter += 1;
            if (counter % 2 === 0) throw new Error('even');
            return counter;
        });
        expect(unwrap(safe())).toBe(1);
        expect(unwrapErr(safe())).toBeInstanceOf(Error);
        expect(unwrap(safe())).toBe(3);
    });
});