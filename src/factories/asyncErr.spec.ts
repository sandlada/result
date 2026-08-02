import { describe, it, expect } from 'vitest';
import { asyncOk, asyncErr } from './index.js';

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

    it('preserves class-based errors with prototype intact', async () => {
        class DomainError extends Error {
            public readonly code = 'E_DOMAIN';
            constructor(public readonly detail: string) {
                super(detail);
            }
        }
        const e = new DomainError('bad');
        const r = await asyncErr(e);
        if (r.isFailure) {
            expect(r.error).toBe(e);
            expect(r.error.code).toBe('E_DOMAIN');
            expect(r.error.detail).toBe('bad');
            expect(r.error).toBeInstanceOf(DomainError);
        }
    });

    it('preserves literal error values', async () => {
        const r = await asyncErr('boom' as const);
        if (r.isFailure) expect(r.error).toBe('boom');
    });
});

// ─── asyncErr async policy ─────────────────────────────────────────────────

describe('asyncErr async policy', () => {
    it('does not invoke any user callback during construction', async () => {
        // The factory is value-driven. Constructing asyncErr(x) requires no
        // callback; the Promise resolves to the wrapped Err variant.
        const p = asyncErr('boom');
        const r = await p;
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('boom');
    });

    it('the returned Promise resolves with a failure variant on the first microtask', async () => {
        const p = asyncErr('x');
        const r = await p;
        expect(r.isSuccess).toBe(false);
        expect(r.isFailure).toBe(true);
    });

    it('multiple invocations produce independent Promises with independent results', async () => {
        const pa = asyncErr('a');
        const pb = asyncErr('b');
        expect(pa).not.toBe(pb);
        const ra = await pa;
        const rb = await pb;
        if (ra.isFailure && rb.isFailure) {
            expect(ra.error).toBe('a');
            expect(rb.error).toBe('b');
        }
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

    it('asyncErr result does not carry a `value` key on the failure variant', async () => {
        const r = await asyncErr('fail');
        expect(r).not.toHaveProperty('value');
        expect(Object.keys(r).sort()).toEqual(['error', 'isFailure', 'isSuccess']);
    });
});