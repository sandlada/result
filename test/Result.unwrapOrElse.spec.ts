import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../src/index.js';
import type { IResultOfT } from '../src/types/IResultOfT.js';

// FP operator
import { unwrapOrElse } from '../src/index.js';

// ─── unwrapOrElse() — FP ────────────────────────────────────────────────

describe('unwrapOrElse()', () => {
    it('returns the value on success without calling fn', () => {
        const fn = vi.fn((_e: Error) => 0);
        const r = ok(42);
        expect(unwrapOrElse(fn, r)).toBe(42);
        expect(fn).not.toHaveBeenCalled();
    });

    it('returns the result of fn(error) on failure', () => {
        const error = new Error('parse failed');
        const r = err<number>(error);
        const result = unwrapOrElse((e) => {
            expect(e).toBe(error);
            return -1;
        }, r);
        expect(result).toBe(-1);
    });

    it('can recover different types (widening)', () => {
        const r = err<{ name: string }>(new Error('not found'));
        // Recover with a default object
        const recovery = unwrapOrElse((_e) => ({ name: 'unknown' }), r);
        expect(recovery).toEqual({ name: 'unknown' });
    });

    it('works with discriminated union TError in callback', () => {
        type AppErr = { kind: 'NotFound'; id: number } | { kind: 'Unauthorized' };
        const r = err<string, AppErr>({ kind: 'NotFound', id: 5 });
        const result = unwrapOrElse((e) => {
            switch (e.kind) {
                case 'NotFound': return `missing #${e.id}`;
                case 'Unauthorized': return 'denied';
            }
        }, r);
        expect(result).toBe('missing #5');
    });
});

// ─── FP unwrapOrElse (curried) ────────────────────────────────────────────

describe('FP unwrapOrElse', () => {
    it('returns value on success (direct form)', () => {
        const r: IResultOfT<number> = ok(7);
        const result = unwrapOrElse((_e: Error) => 99, r);
        expect(result).toBe(7);
    });

    it('calls fallback on failure (direct form)', () => {
        const r: IResultOfT<number> = err<number>(new Error('bad'));
        const result = unwrapOrElse((e) => e.message.length, r);
        expect(result).toBe(3); // "bad".length
    });

    it('curried form works', () => {
        const orZero = unwrapOrElse((_e: Error) => 0);
        expect(orZero(ok(10))).toBe(10);
        expect(orZero(err<number>(new Error('fail')))).toBe(0);
    });

    it('fallback is not called on success (curried)', () => {
        const fn = vi.fn((_e: Error) => 0);
        const orZero = unwrapOrElse(fn);
        const r: IResultOfT<number> = ok(5);
        expect(orZero(r)).toBe(5);
        expect(fn).not.toHaveBeenCalled();
    });
});

