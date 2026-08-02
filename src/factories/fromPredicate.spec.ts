import { describe, it, expect } from 'vitest';
import { fromPredicate } from './index.js';

describe('fromPredicate', () => {
    it('creates success when predicate is true (direct)', () => {
        const r = fromPredicate(
            (x: number) => x > 0,
            'must be positive',
            5,
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('creates failure when predicate is false (curried)', () => {
        const isPositive = fromPredicate(
            (x: number) => x > 0,
            '-1 is not positive',
        );
        const r = isPositive(-1);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('-1 is not positive');
    });

    it('creates failure when predicate is false (direct)', () => {
        const r = fromPredicate(
            (x: number) => x > 0,
            'must be positive',
            -1,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('must be positive');
    });

    it('works with discriminated union error types (direct)', () => {
        type AppErr = { kind: 'InvalidInput'; value: number };
        const errVal: AppErr = { kind: 'InvalidInput', value: 200 };
        const r = fromPredicate(
            (x: number) => x >= 0 && x <= 100,
            errVal,
            200,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error.kind).toBe('InvalidInput');
            expect(r.error.value).toBe(200);
        }
    });

    it('works with discriminated union error types (curried)', () => {
        type AppErr = { kind: 'InvalidInput'; value: number };
        const errVal: AppErr = { kind: 'InvalidInput', value: 200 };
        const validate = fromPredicate<number, AppErr>(
            (x: number) => x >= 0 && x <= 100,
            errVal,
        );
        const r = validate(200);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error.kind).toBe('InvalidInput');
        }
    });

    // ─── Curried / direct discrimination ───────────────────────────────────

    it('curried form returns a function, not an IResultOfT', () => {
        const fn = fromPredicate((x: number) => x > 0, 'must be positive');
        expect(typeof fn).toBe('function');
        // The curried form has no `.isSuccess` / `.isFailure` properties.
        expect(fn).not.toHaveProperty('isSuccess');
        expect(fn).not.toHaveProperty('isFailure');
    });

    it('direct form returns an IResultOfT (with `.isSuccess`/`.isFailure`)', () => {
        const r = fromPredicate((x: number) => x > 0, 'must be positive', 5);
        expect(typeof r).toBe('object');
        expect(r).toHaveProperty('isSuccess');
        expect(r).toHaveProperty('isFailure');
    });

    it('curried and direct forms yield the same result on a true predicate', () => {
        const fn = fromPredicate((x: number) => x > 0, 'no');
        const curried = fn(5);
        const direct = fromPredicate((x: number) => x > 0, 'no', 5);
        expect(curried.isSuccess).toBe(direct.isSuccess);
        if (curried.isSuccess && direct.isSuccess) {
            expect(curried.value).toBe(direct.value);
        }
    });

    it('curried and direct forms yield the same result on a false predicate', () => {
        const fn = fromPredicate((x: number) => x > 0, 'no');
        const curried = fn(-1);
        const direct = fromPredicate((x: number) => x > 0, 'no', -1);
        expect(curried.isFailure).toBe(direct.isFailure);
        if (curried.isFailure && direct.isFailure) {
            expect(curried.error).toBe(direct.error);
        }
    });

    it('direct form with undefined value is allowed when T includes undefined', () => {
        // arguments.length counts the third argument regardless of its value,
        // so passing `undefined` still selects the direct form.
        const r = fromPredicate(
            (v: string | undefined) => v !== undefined && v.length > 0,
            'empty',
            undefined,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('empty');
    });

    it('curried wrapper is reusable across many inputs', () => {
        const validate = fromPredicate(
            (n: number) => n >= 0 && n <= 100,
            'out-of-range',
        );
        expect(validate(50).isSuccess).toBe(true);
        expect(validate(-1).isFailure).toBe(true);
        expect(validate(101).isFailure).toBe(true);
        expect(validate(0).isSuccess).toBe(true);
        expect(validate(100).isSuccess).toBe(true);
    });

    // ─── Default-error contract ────────────────────────────────────────────

    it('E is inferred from the second argument; default error type is whatever the caller supplies', () => {
        // fromPredicate has no `errorFn` parameter — the error type is fixed by
        // the second argument (`errorOnFalse`). Verify with a complex E.
        type ValidationErr = { field: string; reason: string };
        const e: ValidationErr = { field: 'email', reason: 'invalid format' };
        const validate = fromPredicate<{ email: string }, ValidationErr>(
            (u) => u.email.includes('@'),
            e,
        );
        const r = validate({ email: 'bad' });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error.field).toBe('email');
            expect(r.error.reason).toBe('invalid format');
        }
    });

    // ─── Behavioural edges ─────────────────────────────────────────────────

    it('returns Ok when the predicate is true and the value is null', () => {
        const r = fromPredicate(
            (v: number | null) => v !== null,
            'null',
            1,
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(1);
    });

    it('returns Err when the predicate is false and the value is null', () => {
        const r = fromPredicate(
            (v: number | null) => v !== null,
            'null',
            null,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('null');
    });

    it('preserves the literal value through the success branch', () => {
        const r = fromPredicate(
            (s: string) => s.length > 0,
            'empty',
            'literal' as const,
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('literal');
    });

    it('preserves complex object values without mutation', () => {
        type User = { id: number; name: string };
        const user: User = { id: 1, name: 'Alice' };
        const r = fromPredicate(
            (u: User) => u.id > 0,
            'invalid',
            user,
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value).toBe(user);
            expect(r.value.id).toBe(1);
            expect(r.value.name).toBe('Alice');
        }
    });

    it('returned IResult does not carry both value and error at once', () => {
        const r = fromPredicate((x: number) => x > 0, 'no', 1);
        if (r.isSuccess) {
            expect(r).toHaveProperty('value');
            expect(r).not.toHaveProperty('error');
        }
    });
});