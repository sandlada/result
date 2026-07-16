import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/index.js';

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
});
