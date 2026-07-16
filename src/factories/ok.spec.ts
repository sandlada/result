import { describe, it, expect } from 'vitest';
import type { IResult } from '../../src/types/IResult.js';
import { ok } from '../../src/index.js';

// ─── ok() — void success ───────────────────────────────────────────────────

describe('ok()', () => {
    it('returns a success result', () => {
        const r = ok();
        expect(r.isSuccess).toBe(true);
    });

    it('has isFailure === false', () => {
        const r = ok();
        expect(r.isFailure).toBe(false);
    });

    it('returns an object conforming to IResult', () => {
        const r: IResult = ok();
        expect(r).toBeDefined();
    });

    it('ok() with no argument creates a void success', () => {
        const result = ok();
        expect(result.isSuccess).toBe(true);
        expect(result.isFailure).toBe(false);
    });
});

// ─── ok<T>(value) — value success ──────────────────────────────────────────

describe('ok<T>(value)', () => {
    it('returns a success result carrying a value', () => {
        const r = ok(42);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('infers the value type from the argument', () => {
        const r = ok({ id: 1, name: 'Alice' });
        if (r.isSuccess) {
            expect(r.value.name).toBe('Alice');
            expect(r.value.id).toBe(1);
        }
    });

    it('works with null value', () => {
        const r = ok<number | null>(null);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBeNull();
    });

    it('works with undefined value', () => {
        const r = ok<number | undefined>(undefined);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBeUndefined();
    });

    it('ok(undefined) creates a success with undefined value', () => {
        const result = ok<number | undefined>(undefined);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBeUndefined();
    });

    it('ok(null) creates a success with null value', () => {
        const result = ok<number | null>(null);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBeNull();
    });
});

// ─── ok consistency ────────────────────────────────────────────────────────

describe('ok consistency', () => {
    it('ok<T>(val) produces isSuccess: true, isFailure: false', () => {
        const r = ok(42);
        expect(r.isSuccess).toBe(true);
        expect(r.isFailure).toBe(false);
    });

    it('ok() produces isSuccess: true, isFailure: false for void', () => {
        const r = ok();
        expect(r.isSuccess).toBe(true);
        expect(r.isFailure).toBe(false);
    });

    it('FP operator form: ok(42) is a success', () => {
        expect(ok(42).isSuccess).toBe(true);
    });

    it('FP operator form: ok() is a success', () => {
        expect(ok().isSuccess).toBe(true);
    });
});
