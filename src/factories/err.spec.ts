import { describe, it, expect } from 'vitest';
import { ok, err } from './index.js';

// ─── err(error) — void failure ─────────────────────────────────────────────

describe('err(error)', () => {
    it('returns a failure result', () => {
        const r = err('oops');
        expect(r.isSuccess).toBe(false);
        expect(r.isFailure).toBe(true);
    });

    it('carries the error value', () => {
        const r = err('something went wrong');
        if (r.isFailure) expect(r.error).toBe('something went wrong');
    });

    it('works with Error objects', () => {
        const e = new Error('boom');
        const r = err<Error>(e);
        if (r.isFailure) expect(r.error).toBe(e);
    });

    it('works with discriminated unions', () => {
        type AppErr = { code: number; message: string };
        const e: AppErr = { code: 404, message: 'Not Found' };
        const r = err<AppErr>(e);
        if (r.isFailure) {
            expect(r.error.code).toBe(404);
            expect(r.error.message).toBe('Not Found');
        }
    });

    it('works with numeric error codes', () => {
        const r = err(500);
        if (r.isFailure) expect(r.error).toBe(500);
    });

    it('err<never>(...) creates a typed failure', () => {
        const r = err<string>('fail');
        expect(r.isFailure).toBe(true);
    });

    it('returns a result whose success branch has no `value` key', () => {
        // err() always returns the failure variant. The runtime keys reflect
        // the failure-only shape (no `value`).
        const r = err('fail');
        expect(r).not.toHaveProperty('value');
        expect(Object.keys(r).sort()).toEqual(['error', 'isFailure', 'isSuccess']);
    });

    it('preserves primitive error values without wrapping', () => {
        // Numeric, boolean, and string errors must pass through as-is.
        expect((err(0) as { error: unknown }).error).toBe(0);
        expect((err(false) as { error: unknown }).error).toBe(false);
        expect((err('') as { error: unknown }).error).toBe('');
    });
});

// ─── err<E>(error) — typed error ───────────────────────────────────────────

describe('err<E>(error) typed', () => {
    it('accepts a custom error type parameter', () => {
        const r = err<string>('custom error');
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('custom error');
    });

    it('works with complex error types', () => {
        type ValidationError = { field: string; message: string };
        const r = err<ValidationError>({ field: 'email', message: 'invalid' });
        if (r.isFailure) {
            expect(r.error.field).toBe('email');
            expect(r.error.message).toBe('invalid');
        }
    });

    it('infers error type from argument', () => {
        const r = err(42);
        if (r.isFailure) expect(r.error).toBe(42);
    });

    it('preserves Symbol-keyed structured errors', () => {
        // Class instances (with prototypes) must be passed through unchanged.
        class DomainError extends Error {
            public readonly code = 'E_DOMAIN';
            constructor(public readonly detail: string) {
                super(detail);
            }
        }
        const e = new DomainError('bad');
        const r = err(e);
        if (r.isFailure) {
            expect(r.error).toBe(e);
            expect(r.error.code).toBe('E_DOMAIN');
            expect(r.error.detail).toBe('bad');
            expect(r.error).toBeInstanceOf(DomainError);
        }
    });

    it('preserves exact literal error values', () => {
        // `as const` errors must be preserved bit-for-bit.
        const r = err('boom' as const);
        if (r.isFailure) expect(r.error).toBe('boom');
    });
});

// ─── Factory consistency ───────────────────────────────────────────────────

describe('Factory consistency', () => {
    it('err produces isSuccess: false, isFailure: true', () => {
        const r = err('fail');
        expect(r.isSuccess).toBe(false);
        expect(r.isFailure).toBe(true);
    });

    it('ok and err are different variants', () => {
        const s = ok(42);
        const f = err('fail');
        expect(s.isSuccess).toBe(true);
        expect(f.isSuccess).toBe(false);
        expect(s.isFailure).toBe(false);
        expect(f.isFailure).toBe(true);
    });

    it('FP operator form: err(error) is a failure', () => {
        expect(err('fail').isFailure).toBe(true);
    });

    it('many err() invocations produce independent objects', () => {
        const a = err('x');
        const b = err('x');
        expect(a).not.toBe(b);
        if (!a.isSuccess) expect(a.error).toBe('x');
        if (!b.isSuccess) expect(b.error).toBe('x');
    });
});