import { describe, it, expect } from 'vitest';
import { asyncOk, asyncErr } from '../../src/index.js';

// ─── asyncErr(error) — void failure ────────────────────────────────────────

describe('asyncErr(error)', () => {
    it('returns a resolved Promise with a failure result', async () => {
        const r = await asyncErr('oops');
        expect(r.isSuccess).toBe(false);
        expect(r.isFailure).toBe(true);
    });

    it('carries the error value', async () => {
        const r = await asyncErr('something went wrong');
        if (r.isFailure) expect(r.error).toBe('something went wrong');
    });

    it('works with Error objects', async () => {
        const e = new Error('boom');
        const r = await asyncErr<Error>(e);
        if (r.isFailure) expect(r.error).toBe(e);
    });

    it('works with discriminated unions', async () => {
        type AppErr = { code: number; message: string };
        const e: AppErr = { code: 404, message: 'Not Found' };
        const r = await asyncErr<AppErr>(e);
        if (r.isFailure) {
            expect(r.error.code).toBe(404);
            expect(r.error.message).toBe('Not Found');
        }
    });

    it('works with numeric error codes', async () => {
        const r = await asyncErr(500);
        if (r.isFailure) expect(r.error).toBe(500);
    });

    it('asyncErr<never>(...) creates a typed failure', async () => {
        const r = await asyncErr<string>('fail');
        expect(r.isFailure).toBe(true);
    });
});

// ─── asyncErr<E>(error) — typed error ──────────────────────────────────────

describe('asyncErr<E>(error) typed', () => {
    it('accepts a custom error type parameter', async () => {
        const r = await asyncErr<string>('custom error');
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('custom error');
    });

    it('works with complex error types', async () => {
        type ValidationError = { field: string; message: string };
        const r = await asyncErr<ValidationError>({ field: 'email', message: 'invalid' });
        if (r.isFailure) {
            expect(r.error.field).toBe('email');
            expect(r.error.message).toBe('invalid');
        }
    });

    it('infers error type from argument', async () => {
        const r = await asyncErr(42);
        if (r.isFailure) expect(r.error).toBe(42);
    });
});

// ─── Factory consistency ───────────────────────────────────────────────────

describe('Factory consistency', () => {
    it('asyncErr produces isSuccess: false, isFailure: true', async () => {
        const r = await asyncErr('fail');
        expect(r.isSuccess).toBe(false);
        expect(r.isFailure).toBe(true);
    });

    it('asyncOk and asyncErr are different variants', async () => {
        const rs = await asyncOk(42);
        const rf = await asyncErr('fail');
        expect(rs.isSuccess).toBe(true);
        expect(rs.isFailure).toBe(false);
        expect(rf.isSuccess).toBe(false);
        expect(rf.isFailure).toBe(true);
    });

    it('FP operator form: asyncErr(error) is a failure', async () => {
        const r = await asyncErr('fail');
        expect(r.isFailure).toBe(true);
    });
});
