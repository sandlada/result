import { describe, it, expect } from 'vitest';
import type { IResult } from '../../src/types/IResult.js';
import { asyncOk } from '../../src/index.js';

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
});
