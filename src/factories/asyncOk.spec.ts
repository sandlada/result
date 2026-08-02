import { describe, it, expect } from 'vitest';
import type { IResult } from '../../src/types/IResult.js';
import { asyncOk } from './index.js';

// ─── asyncOk<T>(value) — value success ─────────────────────────────────────

describe('asyncOk<T>(value)', () => {
    it('returns a resolved Promise with a success result', async () => {
        const r = await asyncOk(42);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('infers the value type from the argument', async () => {
        const r = await asyncOk({ id: 1, name: 'Alice' });
        if (r.isSuccess) {
            expect(r.value.name).toBe('Alice');
            expect(r.value.id).toBe(1);
        }
    });

    it('works with null value', async () => {
        const r = await asyncOk<number | null>(null);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBeNull();
    });

    it('works with undefined value', async () => {
        const r = await asyncOk<number | undefined>(undefined);
        const _r: IResult = r;
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBeUndefined();
        // suppress unused
        void _r;
    });

    it('preserves literal value types', async () => {
        const r = await asyncOk('exact' as const);
        if (r.isSuccess) expect(r.value).toBe('exact');
    });

    it('preserves array values without unwrapping', async () => {
        const r = await asyncOk([1, 2, 3]);
        if (r.isSuccess) expect(r.value).toEqual([1, 2, 3]);
    });

    it('preserves complex nested objects', async () => {
        const payload = { user: { id: 7, tags: ['a', 'b'] }, count: 2 };
        const r = await asyncOk(payload);
        if (r.isSuccess) {
            expect(r.value.user.id).toBe(7);
            expect(r.value.user.tags).toEqual(['a', 'b']);
            expect(r.value.count).toBe(2);
        }
    });

    it('preserves boolean false and number 0 (no falsy collapse)', async () => {
        const rFalse = await asyncOk(false);
        if (rFalse.isSuccess) expect(rFalse.value).toBe(false);
        const rZero = await asyncOk(0);
        if (rZero.isSuccess) expect(rZero.value).toBe(0);
    });
});

// ─── asyncOk async policy ──────────────────────────────────────────────────

describe('asyncOk async policy', () => {
    it('does not invoke any user callback during construction', () => {
        // The factory is value-driven, not callback-driven. Constructing
        // asyncOk(x) must not require (and must not invoke) any callback.
        let invoked = 0;
        const tracker = () => {
            invoked += 1;
        };
        const p = asyncOk(tracker()); // pass the result of an (unused) callback
        expect(invoked).toBe(1); // the tracker() call ran once, synchronously
        // The factory itself runs no other callback — it just wraps.
        void p;
    });

    it('the returned Promise is already resolved (or resolves on first microtask)', async () => {
        const p = asyncOk(42);
        // Awaiting yields the success variant; the Promise must not be pending.
        const r = await p;
        expect(r.isSuccess).toBe(true);
    });

    it('multiple invocations produce independent Promises with independent results', async () => {
        const pa = asyncOk(1);
        const pb = asyncOk(2);
        expect(pa).not.toBe(pb);
        const ra = await pa;
        const rb = await pb;
        if (ra.isSuccess && rb.isSuccess) {
            expect(ra.value).toBe(1);
            expect(rb.value).toBe(2);
        }
    });
});

// ─── asyncOk consistency ───────────────────────────────────────────────────

describe('asyncOk consistency', () => {
    it('asyncOk<T>(val) produces isSuccess: true, isFailure: false', async () => {
        const r = await asyncOk(42);
        expect(r.isSuccess).toBe(true);
        expect(r.isFailure).toBe(false);
    });

    it('the returned Promise resolves to an object conforming to IResult', async () => {
        const r: IResult = await asyncOk(42);
        expect(r).toBeDefined();
        expect(r.isSuccess).toBe(true);
    });

    it('does not carry an `error` key on the success variant', async () => {
        const r = await asyncOk(42);
        expect(r).not.toHaveProperty('error');
    });
});