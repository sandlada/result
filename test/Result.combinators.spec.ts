import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResultOfT } from '../src/IResultOfT.js';

// FP operators
import {
    flatten, and, or, contains, exists, bimap, swap,
} from '../src/fp/operators.js';

// ─── flatten ────────────────────────────────────────────────────────────────

describe('flatten', () => {
    it('OOP: flattens nested success', () => {
        const inner: IResultOfT<number> = Result.Success(42);
        const outer: IResultOfT<IResultOfT<number>> = Result.Success(inner);
        const flat = outer.flatten();
        expect(flat.isSuccess).toBe(true);
        expect(flat.unwrap()).toBe(42);
    });

    it('OOP: passes through outer failure', () => {
        const err = new Error('outer fail');
        const outer: IResultOfT<IResultOfT<number>> = Result.Failure(err);
        const flat = outer.flatten();
        expect(flat.isSuccess).toBe(false);
        expect(flat.unwrapErr()).toBe(err);
    });

    it('FP: flattens nested success', () => {
        const inner: IResultOfT<string> = Result.Success('hi');
        const outer: IResultOfT<IResultOfT<string>> = Result.Success(inner);
        const flat = flatten(outer);
        expect(flat.isSuccess).toBe(true);
        expect(flat.unwrap()).toBe('hi');
    });

    it('FP: passes through outer failure', () => {
        const err = new Error('nested error');
        const outer: IResultOfT<IResultOfT<number>> = Result.Failure(err);
        expect(flatten(outer).unwrapErr()).toBe(err);
    });
});

// ─── and / or ───────────────────────────────────────────────────────────────

describe('and / or', () => {
    describe('and', () => {
        it('OOP: success returns other', () => {
            const a = Result.Success(1);
            const b = Result.Success('two');
            expect(a.and(b).unwrap()).toBe('two');
        });

        it('OOP: failure returns this', () => {
            const err = new Error('first fail');
            const a: IResultOfT<number> = Result.Failure(err);
            const b: IResultOfT<string> = Result.Success('ignored');
            expect(a.and(b).isSuccess).toBe(false);
            expect(a.and(b).unwrapErr()).toBe(err);
        });

        it('FP: direct form', () => {
            const a: IResultOfT<number> = Result.Success(1);
            const b: IResultOfT<string> = Result.Success('ok');
            expect(and(b, a).unwrap()).toBe('ok');
        });

        it('FP: curried form', () => {
            const andWith = and(Result.Success('result'));
            expect(andWith(Result.Success(5)).unwrap()).toBe('result');
            expect(andWith(Result.Failure<number>(new Error('no'))).isSuccess).toBe(false);
        });
    });

    describe('or', () => {
        it('OOP: failure returns other', () => {
            const a: IResultOfT<number> = Result.Failure(new Error('fail'));
            const b: IResultOfT<number> = Result.Success(99);
            expect(a.or(b).unwrap()).toBe(99);
        });

        it('OOP: success returns this', () => {
            const a = Result.Success(1);
            const b = Result.Success(99); // ignored
            expect(a.or(b).unwrap()).toBe(1);
        });

        it('FP: direct form', () => {
            const fallback: IResultOfT<number> = Result.Success(7);
            const failed: IResultOfT<number> = Result.Failure<number>(new Error('oops'));
            expect(or(fallback, failed).unwrap()).toBe(7);
        });

        it('FP: success passes through', () => {
            const ok: IResultOfT<number> = Result.Success(3);
            const fallback: IResultOfT<number> = Result.Success(99);
            expect(or(fallback, ok).unwrap()).toBe(3);
        });
    });
});

// ─── contains / exists ──────────────────────────────────────────────────────

describe('contains / exists', () => {
    describe('contains', () => {
        it('OOP: true when success and value matches', () => {
            expect(Result.Success(42).contains(42)).toBe(true);
        });

        it('OOP: false when success and value does not match', () => {
            expect(Result.Success(42).contains(99)).toBe(false);
        });

        it('OOP: false when failure', () => {
            expect(Result.Failure<number>(new Error('nope')).contains(42)).toBe(false);
        });

        it('FP: curried form', () => {
            const isFortyTwo = contains(42);
            expect(isFortyTwo(Result.Success(42))).toBe(true);
            expect(isFortyTwo(Result.Success(7))).toBe(false);
            expect(isFortyTwo(Result.Failure<number>(new Error('err')))).toBe(false);
        });
    });

    describe('exists', () => {
        it('OOP: true when success and predicate matches', () => {
            expect(Result.Success(10).exists((n) => n > 5)).toBe(true);
        });

        it('OOP: false when success and predicate fails', () => {
            expect(Result.Success(3).exists((n) => n > 5)).toBe(false);
        });

        it('OOP: false when failure', () => {
            expect(Result.Failure<number>(new Error('no value')).exists((n) => n > 5)).toBe(false);
        });

        it('FP: curried form', () => {
            const isPositive = exists((n: number) => n > 0);
            expect(isPositive(Result.Success(5))).toBe(true);
            expect(isPositive(Result.Success(-1))).toBe(false);
            expect(isPositive(Result.Failure<number>(new Error('err')))).toBe(false);
        });
    });
});

// ─── bimap ──────────────────────────────────────────────────────────────────

describe('bimap', () => {
    it('OOP: maps both success and failure', () => {
        const ok = Result.Success(2);
        const doubled = ok.bimap(
            (v) => v * 2,
            (e) => new Error(`wrapped: ${e.message}`),
        );
        expect(doubled.unwrap()).toBe(4);

        const err = Result.Failure<number>(new Error('bad'));
        const wrapped = err.bimap(
            (v) => v * 2,
            (e) => new Error(`wrapped: ${e.message}`),
        );
        expect(wrapped.unwrapErr().message).toBe('wrapped: bad');
    });

    it('FP: direct form', () => {
        const r: IResultOfT<number, Error> = Result.Success(3);
        const result = bimap(
            (v: number) => String(v),
            (e: Error) => e.message,
            r,
        );
        expect(result.unwrap()).toBe('3');
    });

    it('FP: curried form', () => {
        const transform = bimap(
            (v: number) => v + 1,
            (e: Error) => e.message,
        );
        expect(transform(Result.Success(1)).unwrap()).toBe(2);
        expect(transform(Result.Failure<number>(new Error('fail'))).unwrapErr()).toBe('fail');
    });

    it('can change both types', () => {
        const r: IResultOfT<number, string> = Result.Success(5);
        const transformed = r.bimap(
            (n) => n.toString(),
            (s) => s.length,
        );
        // Type: IResultOfT<string, number>
        expect(transformed.unwrap()).toBe('5');
    });
});

// ─── swap ───────────────────────────────────────────────────────────────────

describe('swap', () => {
    it('OOP: success becomes failure with value as error', () => {
        const r = Result.Success(42);
        const swapped = r.swap();
        expect(swapped.isSuccess).toBe(false);
        expect(swapped.unwrapErr()).toBe(42);
    });

    it('OOP: failure becomes success with error as value', () => {
        const err = new Error('oops');
        const r: IResultOfT<number> = Result.Failure(err);
        const swapped = r.swap();
        expect(swapped.isSuccess).toBe(true);
        expect(swapped.unwrap()).toBe(err);
    });

    it('FP: success becomes failure', () => {
        const r: IResultOfT<string, number> = Result.Success('hello');
        const swapped = swap(r);
        expect(swapped.isSuccess).toBe(false);
        expect(swapped.unwrapErr()).toBe('hello');
    });

    it('FP: failure becomes success', () => {
        const r: IResultOfT<string, number> = Result.Failure<string, number>(404);
        const swapped = swap(r);
        expect(swapped.isSuccess).toBe(true);
        expect(swapped.unwrap()).toBe(404);
    });
});
