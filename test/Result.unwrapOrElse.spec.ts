import { describe, it, expect, vi } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResultOfT } from '../src/IResultOfT.js';

// FP operator
import { unwrapOrElse } from '../src/fp/operators.js';

// ─── ResultOfT.unwrapOrElse() — OOP ─────────────────────────────────────────

describe('ResultOfT.unwrapOrElse() — OOP', () => {
    it('returns the value on success without calling fn', () => {
        const fn = vi.fn((_e: Error) => 0);
        const r = Result.Success(42);
        expect(r.unwrapOrElse(fn)).toBe(42);
        expect(fn).not.toHaveBeenCalled();
    });

    it('returns the result of fn(error) on failure', () => {
        const err = new Error('parse failed');
        const r = Result.Failure<number>(err);
        const result = r.unwrapOrElse((e) => {
            expect(e).toBe(err);
            return -1;
        });
        expect(result).toBe(-1);
    });

    it('can recover different types (widening)', () => {
        const r = Result.Failure<{ name: string }>(new Error('not found'));
        // Recover with a default object
        const recovery = r.unwrapOrElse((_e) => ({ name: 'unknown' }));
        expect(recovery).toEqual({ name: 'unknown' });
    });

    it('works with discriminated union TError in callback', () => {
        type AppErr = { kind: 'NotFound'; id: number } | { kind: 'Unauthorized' };
        const r = Result.Failure<string, AppErr>({ kind: 'NotFound', id: 5 });
        const result = r.unwrapOrElse((err) => {
            switch (err.kind) {
                case 'NotFound': return `missing #${err.id}`;
                case 'Unauthorized': return 'denied';
            }
        });
        expect(result).toBe('missing #5');
    });
});

// ─── FP unwrapOrElse ────────────────────────────────────────────────────────

describe('FP unwrapOrElse', () => {
    it('returns value on success (direct form)', () => {
        const r: IResultOfT<number> = Result.Success(7);
        const result = unwrapOrElse((_e: Error) => 99, r);
        expect(result).toBe(7);
    });

    it('calls fallback on failure (direct form)', () => {
        const r: IResultOfT<number> = Result.Failure<number>(new Error('bad'));
        const result = unwrapOrElse((e) => e.message.length, r);
        expect(result).toBe(3); // "bad".length
    });

    it('curried form works', () => {
        const orZero = unwrapOrElse((_e: Error) => 0);
        expect(orZero(Result.Success(10))).toBe(10);
        expect(orZero(Result.Failure<number>(new Error('fail')))).toBe(0);
    });

    it('fallback is not called on success (curried)', () => {
        const fn = vi.fn((_e: Error) => 0);
        const orZero = unwrapOrElse(fn);
        const r: IResultOfT<number> = Result.Success(5);
        expect(orZero(r)).toBe(5);
        expect(fn).not.toHaveBeenCalled();
    });
});
