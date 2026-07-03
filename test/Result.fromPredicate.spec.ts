import { describe, it, expect } from 'vitest';
import { ok, err } from '../src/index.js';
import type { IResultOfT } from '../src/types/IResultOfT.js';
import { fromPredicate, unwrap, unwrapErr } from '../src/index.js';

// ─── fromPredicate ────────────────────────────────────────────────────

describe('fromPredicate', () => {
    it('direct form: returns Ok when predicate passes', () => {
        const r = fromPredicate((s: string) => s.length >= 3, 'too-short', 'hello');
        expect(r.isSuccess).toBe(true);
        expect(unwrap(r)).toBe('hello');
    });

    it('direct form: returns Err when predicate fails', () => {
        const r = fromPredicate((s: string) => s.length >= 3, 'too-short', 'ab');
        expect(r.isSuccess).toBe(false);
        expect(unwrapErr(r)).toBe('too-short');
    });

    it('direct form: works with complex objects', () => {
        type User = { name: string; age: number };
        const user: User = { name: 'Alice', age: 17 };
        const r = fromPredicate(
            (u: User) => u.age >= 18,
            { kind: 'Underage' as const, age: user.age },
            user,
        );
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error.kind).toBe('Underage');
            expect(r.error.age).toBe(17);
        }
    });

    it('direct form: works with string-based validation', () => {
        const r = fromPredicate(
            (s: string) => s.includes('@'),
            { kind: 'InvalidEmail' as const },
            'hello@world.com',
        );
        expect(r.isSuccess).toBe(true);
        expect(unwrap(r)).toBe('hello@world.com');
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
        expect(r2.isSuccess).toBe(false);
        expect(unwrapErr(r2)).toBeInstanceOf(Error);
    });
});

