import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResultOfT } from '../src/IResultOfT.js';

// FP constructor
import { fromPredicate } from '../src/fp/core.js';

// ─── Result.fromPredicate() — OOP static ────────────────────────────────────

describe('Result.fromPredicate() — OOP static', () => {
    it('returns Success(value) when predicate returns true', () => {
        const r = Result.fromPredicate(5, (n) => n > 0, new Error('non-positive'));
        expect(r.isSuccess).toBe(true);
        expect(r.unwrap()).toBe(5);
    });

    it('returns Failure(errorOnFalse) when predicate returns false', () => {
        const err = new Error('must be positive');
        const r = Result.fromPredicate(-3, (n) => n > 0, err);
        expect(r.isSuccess).toBe(false);
        expect(r.unwrapErr()).toBe(err);
    });

    it('works with complex objects', () => {
        type User = { name: string; age: number };
        const user: User = { name: 'Alice', age: 17 };
        const r = Result.fromPredicate(
            user,
            (u) => u.age >= 18,
            { kind: 'Underage' as const, age: user.age },
        );
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error.kind).toBe('Underage');
            expect(r.error.age).toBe(17);
        }
    });

    it('works with string-based validation', () => {
        const r = Result.fromPredicate(
            'hello@world.com',
            (s) => s.includes('@'),
            { kind: 'InvalidEmail' as const },
        );
        expect(r.isSuccess).toBe(true);
        expect(r.unwrap()).toBe('hello@world.com');
    });
});

// ─── FP fromPredicate ───────────────────────────────────────────────────────

describe('FP fromPredicate', () => {
    it('direct form: returns Ok when predicate passes', () => {
        const r = fromPredicate((s: string) => s.length >= 3, 'too-short', 'hello');
        expect(r.isSuccess).toBe(true);
        expect(r.unwrap()).toBe('hello');
    });

    it('direct form: returns Err when predicate fails', () => {
        const r = fromPredicate((s: string) => s.length >= 3, 'too-short', 'ab');
        expect(r.isSuccess).toBe(false);
        expect(r.unwrapErr()).toBe('too-short');
    });

    it('curried form: creates reusable validator', () => {
        const validateEmail = fromPredicate(
            (s: string) => s.includes('@'),
            { kind: 'InvalidEmail' as const },
        );

        const r1 = validateEmail('a@b.com');
        expect(r1.isSuccess).toBe(true);

        const r2 = validateEmail('not-an-email');
        expect(r2.isSuccess).toBe(false);
        if (!r2.isSuccess) {
            expect(r2.error.kind).toBe('InvalidEmail');
        }
    });

    it('curried form: composes with other FP operators', () => {
        const positiveOrDie = fromPredicate(
            (n: number) => n > 0,
            new Error('non-positive'),
        );

        const r1: IResultOfT<number, Error> = positiveOrDie(42);
        expect(r1.isSuccess).toBe(true);

        const r2: IResultOfT<number, Error> = positiveOrDie(-1);
        expect(r2.unwrapErr()).toBeInstanceOf(Error);
    });
});
