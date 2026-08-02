import { describe, it, expect } from 'vitest';
import { fromSafePromise } from './index.js';

describe('fromSafePromise', () => {
    it('wraps a resolved promise into Ok', async () => {
        const r = await fromSafePromise(Promise.resolve(42));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('error type is never', async () => {
        const r = await fromSafePromise(Promise.resolve('hello'));
        expect(r.isSuccess).toBe(true);
    });

    it('unwrap gives the correct value', async () => {
        const r = await fromSafePromise(Promise.resolve({ name: 'Alice' }));
        if (r.isSuccess) expect(r.value.name).toBe('Alice');
    });

    it('returns err when the promise rejects with an Error', async () => {
        const r = await fromSafePromise(Promise.reject(new Error('unexpected')));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect((r.error as Error).message).toBe('unexpected');
    });

    it('wraps a non-Error rejection value in an Error', async () => {
        const r = await fromSafePromise(Promise.reject('plain string'));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error).toBeInstanceOf(Error);
            expect((r.error as Error).message).toBe('plain string');
        }
    });

    // ─── Auto-wrapping policy ──────────────────────────────────────────────

    it('auto-wraps a number rejection as an Error with the string form', async () => {
        const r = await fromSafePromise(Promise.reject(42));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
            expect((r.error as Error).message).toBe('42');
        }
    });

    it('auto-wraps a null rejection as an Error', async () => {
        const r = await fromSafePromise(Promise.reject(null));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
            expect((r.error as Error).message).toBe('null');
        }
    });

    it('auto-wraps an undefined rejection as an Error', async () => {
        const r = await fromSafePromise(Promise.reject(undefined));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
        }
    });

    it('auto-wraps an object rejection using String(e)', async () => {
        const r = await fromSafePromise(Promise.reject({ code: 500 }));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
            // String({ code: 500 }) yields '[object Object]'.
            expect((r.error as Error).message).toBe('[object Object]');
        }
    });

    it('passes an Error rejection through unchanged (preserves message and stack)', async () => {
        const e = new Error('original');
        const r = await fromSafePromise(Promise.reject(e));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBe(e);
            expect((r.error as Error).message).toBe('original');
        }
    });

    it('preserves subclass-of-Error rejections as instances of that subclass', async () => {
        class DomainError extends Error {
            public readonly code = 'E_DOMAIN';
        }
        const e = new DomainError('bad');
        const r = await fromSafePromise(Promise.reject(e));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBe(e);
            expect((r.error as DomainError).code).toBe('E_DOMAIN');
        }
    });

    // ─── Behavioural edges ─────────────────────────────────────────────────

    it('preserves falsy resolved values (0, false, empty string, null)', async () => {
        const r0 = await fromSafePromise(Promise.resolve(0));
        const rFalse = await fromSafePromise(Promise.resolve(false));
        const rEmpty = await fromSafePromise(Promise.resolve(''));
        const rNull = await fromSafePromise(Promise.resolve(null));
        expect(r0.isSuccess).toBe(true); if (r0.isSuccess) expect(r0.value).toBe(0);
        expect(rFalse.isSuccess).toBe(true); if (rFalse.isSuccess) expect(rFalse.value).toBe(false);
        expect(rEmpty.isSuccess).toBe(true); if (rEmpty.isSuccess) expect(rEmpty.value).toBe('');
        expect(rNull.isSuccess).toBe(true); if (rNull.isSuccess) expect(rNull.value).toBeNull();
    });

    it('preserves complex resolved objects', async () => {
        const r = await fromSafePromise(Promise.resolve({ id: 1, tags: ['a', 'b'] }));
        if (r.isSuccess) {
            expect(r.value.id).toBe(1);
            expect(r.value.tags).toEqual(['a', 'b']);
        }
    });

    it('the outer Promise does not reject when the inner one rejects (catches and wraps)', async () => {
        // Document the policy: fromSafePromise catches the inner rejection.
        // The outer Promise resolves with the failure variant — it never rejects.
        const outer = fromSafePromise(Promise.reject(new Error('inner')));
        const r = await outer;
        expect(r.isFailure).toBe(true);
    });

    it('returned IResult does not carry both value and error at once', async () => {
        const r = await fromSafePromise(Promise.resolve(42));
        if (r.isSuccess) {
            expect(r).toHaveProperty('value');
            expect(r).not.toHaveProperty('error');
        }
    });
});