import { describe, it, expect } from 'vitest';
import { fromPromise } from './index.js';

describe('fromPromise', () => {
    it('wraps a resolved promise into Ok', async () => {
        const r = await fromPromise(Promise.resolve(42));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('wraps a rejected promise into Err', async () => {
        const r = await fromPromise(Promise.reject('oops'));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('oops');
    });

    it('defaults error type to Error for Error rejections', async () => {
        const r = await fromPromise(Promise.reject(new Error('network error')));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBeInstanceOf(Error);
        if (!r.isSuccess && r.error instanceof Error) expect(r.error.message).toBe('network error');
    });

    it('uses custom errorFn to transform rejection', async () => {
        const r = await fromPromise(
            Promise.reject(new Error('not found')),
            (e) => `custom: ${(e as Error).message}`,
        );
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('custom: not found');
    });

    it('uses custom errorFn on string rejection', async () => {
        const r = await fromPromise(
            Promise.reject('fail'),
            (e) => `mapped: ${e}`,
        );
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('mapped: fail');
    });

    // ─── Default-error contract ────────────────────────────────────────────

    it('default error type is `unknown` — non-Error rejections pass through unchanged', async () => {
        const thrown = { code: 500, message: 'server' };
        const r = await fromPromise<number>(Promise.reject(thrown));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(thrown);
    });

    it('default error type is `unknown` — null rejections pass through', async () => {
        const r = await fromPromise<number>(Promise.reject(null));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeNull();
    });

    it('default error type is `unknown` — undefined rejections pass through', async () => {
        const r = await fromPromise<number>(Promise.reject(undefined));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeUndefined();
    });

    it('default error type is `unknown` — number rejections pass through', async () => {
        const r = await fromPromise<number>(Promise.reject(42));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(42);
    });

    // ─── errorFn mapping ───────────────────────────────────────────────────

    it('errorFn is not invoked when the promise resolves', async () => {
        let called = 0;
        const r = await fromPromise(
            Promise.resolve(1),
            () => {
                called += 1;
                return 'should-not-be-used';
            },
        );
        expect(r.isSuccess).toBe(true);
        expect(called).toBe(0);
    });

    it('errorFn receives the rejection value and its return drives the error variant', async () => {
        let captured: unknown = undefined;
        const r = await fromPromise<number>(
            Promise.reject('raw'),
            (e: unknown) => {
                captured = e;
                return { wrapped: String(e) };
            },
        );
        expect(captured).toBe('raw');
        if (r.isFailure) {
            expect(r.error).toEqual({ wrapped: 'raw' });
        }
    });

    it('errorFn maps an Error to a narrower discriminated union', async () => {
        type AppErr = { kind: 'AppError'; raw: string };
        const r = await fromPromise<number, AppErr>(
            Promise.reject(new Error('boom')),
            (e: unknown): AppErr => ({
                kind: 'AppError' as const,
                raw: e instanceof Error ? e.message : String(e),
            }),
        );
        if (r.isFailure) {
            expect(r.error.kind).toBe('AppError');
            expect(r.error.raw).toBe('boom');
        }
    });

    // ─── Behavioural edges ─────────────────────────────────────────────────

    it('preserves falsy resolved values (0, false, empty string, null)', async () => {
        const r0 = await fromPromise(Promise.resolve(0));
        const rFalse = await fromPromise(Promise.resolve(false));
        const rEmpty = await fromPromise(Promise.resolve(''));
        const rNull = await fromPromise(Promise.resolve(null));
        expect(r0.isSuccess).toBe(true); if (r0.isSuccess) expect(r0.value).toBe(0);
        expect(rFalse.isSuccess).toBe(true); if (rFalse.isSuccess) expect(rFalse.value).toBe(false);
        expect(rEmpty.isSuccess).toBe(true); if (rEmpty.isSuccess) expect(rEmpty.value).toBe('');
        expect(rNull.isSuccess).toBe(true); if (rNull.isSuccess) expect(rNull.value).toBeNull();
    });

    it('preserves complex resolved objects', async () => {
        const r = await fromPromise(Promise.resolve({ id: 1, tags: ['a', 'b'] }));
        if (r.isSuccess) {
            expect(r.value.id).toBe(1);
            expect(r.value.tags).toEqual(['a', 'b']);
        }
    });

    it('returned IResult does not carry both value and error at once', async () => {
        const r = await fromPromise(Promise.resolve(42));
        if (r.isSuccess) {
            expect(r).toHaveProperty('value');
            expect(r).not.toHaveProperty('error');
        }
    });

    it('the outer Promise does not reject when the inner one rejects (catches and returns Err)', async () => {
        // Document the policy: fromPromise catches the inner rejection. The
        // outer Promise resolves with the failure variant — it never rejects.
        const outer = fromPromise(Promise.reject(new Error('inner')));
        // Awaiting never throws — the outer Promise is always resolved.
        const r = await outer;
        expect(r.isFailure).toBe(true);
    });
});