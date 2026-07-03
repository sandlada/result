import { describe, it, expect } from 'vitest';
import { ok, err } from '../src/index.js';
import type { IResultOfT } from '../src/types/IResultOfT.js';
import {
    fromThrowable,
    mapOr,
    mapOrElse,
    tap,
    unwrap,
    unwrapErr,
} from '../src/index.js';

// ─── fromThrowable ──────────────────────────────────────────────────────────

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
});

// ─── mapOr / mapOrElse ──────────────────────────────────────────────────────

describe('mapOr / mapOrElse', () => {
    describe('mapOr', () => {
        it('direct form', () => {
            const r: IResultOfT<number> = ok(3);
            expect(mapOr(0, (v: number) => v + 1, r)).toBe(4);
        });

        it('curried form', () => {
            const doubleOrZero = mapOr(0, (v: number) => v * 2);
            expect(doubleOrZero(ok(5))).toBe(10);
            expect(doubleOrZero(err<number>(new Error('x')))).toBe(0);
        });
    });

    describe('mapOrElse', () => {
        it('direct form', () => {
            const r: IResultOfT<number> = err<number>(new Error('x'));
            const result = mapOrElse(
                (e: Error) => e.message.length,
                (v: number) => v * 2,
                r,
            );
            expect(result).toBe(1); // "x".length
        });

        it('curried form', () => {
            const handle = mapOrElse(
                (e: Error) => `fail: ${e.message}`,
                (v: number) => `ok: ${v}`,
            );
            expect(handle(ok(42))).toBe('ok: 42');
            expect(handle(err<number>(new Error('boom')))).toBe('fail: boom');
        });
    });
});

// ─── tap ────────────────────────────────────────────────────────────────────

describe('tap', () => {
    it('calls fn on success', () => {
        let called = false;
        const result = tap(() => { called = true; }, ok());
        expect(called).toBe(true);
        expect(result.isSuccess).toBe(true);
    });

    it('does not call fn on failure', () => {
        let called = false;
        tap(() => { called = true; }, err(new Error('nope')));
        expect(called).toBe(false);
    });
});

