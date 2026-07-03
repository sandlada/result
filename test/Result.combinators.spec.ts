import { describe, it, expect } from 'vitest';
import { ok, err } from '../src/index.js';
import type { IResultOfT } from '../src/types/IResultOfT.js';
import { flatten, and, or, contains, exists, bimap, swap, unwrap, unwrapErr } from '../src/index.js';

// ─── flatten ────────────────────────────────────────────────────────────────

describe('flatten', () => {
    it('flattens nested success', () => {
        const inner: IResultOfT<string> = ok('hi');
        const outer: IResultOfT<IResultOfT<string>> = ok(inner);
        const flat = flatten(outer);
        expect(flat.isSuccess).toBe(true);
        expect(unwrap(flat)).toBe('hi');
    });

    it('passes through outer failure', () => {
        const outerErr = new Error('nested error');
        const outer: IResultOfT<IResultOfT<number>> = err(outerErr);
        expect(unwrapErr(flatten(outer))).toBe(outerErr);
    });
});

// ─── and / or ───────────────────────────────────────────────────────────────

describe('and / or', () => {
    describe('and', () => {
        it('direct form', () => {
            const a: IResultOfT<number> = ok(1);
            const b: IResultOfT<string> = ok('ok');
            expect(unwrap(and(b, a))).toBe('ok');
        });

        it('curried form', () => {
            const andWith = and(ok('result'));
            expect(unwrap(andWith(ok(5)))).toBe('result');
            expect(andWith(err<number>(new Error('no'))).isSuccess).toBe(false);
        });
    });

    describe('or', () => {
        it('direct form', () => {
            const fallback: IResultOfT<number> = ok(7);
            const failed: IResultOfT<number> = err<number>(new Error('oops'));
            expect(unwrap(or(fallback, failed))).toBe(7);
        });

        it('success passes through', () => {
            const success: IResultOfT<number> = ok(3);
            const fallback: IResultOfT<number> = ok(99);
            expect(unwrap(or(fallback, success))).toBe(3);
        });
    });
});

// ─── contains / exists ──────────────────────────────────────────────────────

describe('contains / exists', () => {
    describe('contains', () => {
        it('curried form', () => {
            const isFortyTwo = contains(42);
            expect(isFortyTwo(ok(42))).toBe(true);
            expect(isFortyTwo(ok(7))).toBe(false);
            expect(isFortyTwo(err<number>(new Error('err')))).toBe(false);
        });
    });

    describe('exists', () => {
        it('curried form', () => {
            const isPositive = exists((n: number) => n > 0);
            expect(isPositive(ok(5))).toBe(true);
            expect(isPositive(ok(-1))).toBe(false);
            expect(isPositive(err<number>(new Error('err')))).toBe(false);
        });
    });
});

// ─── bimap ──────────────────────────────────────────────────────────────────

describe('bimap', () => {
    it('direct form', () => {
        const r: IResultOfT<number, Error> = ok(3);
        const result = bimap(
            (v: number) => String(v),
            (e: Error) => e.message,
            r,
        );
        expect(unwrap(result)).toBe('3');
    });

    it('curried form', () => {
        const transform = bimap(
            (v: number) => v + 1,
            (e: Error) => e.message,
        );
        expect(unwrap(transform(ok(1)))).toBe(2);
        expect(transform(err<number>(new Error('fail'))).isSuccess).toBe(false);
    });
});

// ─── swap ───────────────────────────────────────────────────────────────────

describe('swap', () => {
    it('success becomes failure', () => {
        const r: IResultOfT<string, number> = ok('hello');
        const swapped = swap(r);
        expect(swapped.isSuccess).toBe(false);
        expect(swapped.isFailure).toBe(true);
    });

    it('failure becomes success', () => {
        const r: IResultOfT<string, number> = err<string, number>(404);
        const swapped = swap(r);
        expect(swapped.isSuccess).toBe(true);
        expect(unwrap(swapped)).toBe(404);
    });
});

