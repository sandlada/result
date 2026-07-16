import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { unwrap } from '../../src/index.js';

// ─── Void result ───────────────────────────────────────────────────────────

describe('unwrap (void result)', () => {
    it('succeeds on a success result (no return)', () => {
        const r = ok();
        expect(() => unwrap(r)).not.toThrow();
    });

    it('throws TypeError on a failure result', () => {
        const r = err(new Error('boom'));
        expect(() => unwrap(r)).toThrow(TypeError);
    });

    it('includes the error in the thrown message', () => {
        const r = err(new Error('something went wrong'));
        try {
            unwrap(r);
        } catch (e: unknown) {
            expect(e).toBeInstanceOf(TypeError);
            expect(String(e)).toContain('something went wrong');
        }
    });

    it('works with custom (non-Error) TError', () => {
        const r = err({ kind: 'ValidationError' as const, reason: 'bad' });
        try {
            unwrap(r);
        } catch (e: unknown) {
            expect(e).toBeInstanceOf(TypeError);
            expect((e as TypeError).message).toContain('Called unwrap() on a failure result.');
        }
    });
});

// ─── Value result ──────────────────────────────────────────────────────────

describe('unwrap (value result)', () => {
    it('returns the value on success', () => {
        const r = ok(42);
        expect(unwrap(r)).toBe(42);
    });

    it('throws TypeError on failure', () => {
        const r = err<number>(new Error('no number here'));
        expect(() => unwrap(r)).toThrow(TypeError);
    });

    it('includes the error in the thrown message', () => {
        const r = err<string>(new Error('parse error'));
        try {
            unwrap(r);
        } catch (e: unknown) {
            expect(e).toBeInstanceOf(TypeError);
            expect(String(e)).toContain('parse error');
        }
    });
});

// ─── FP operator form ──────────────────────────────────────────────────────

describe('unwrap (FP operator)', () => {
    it('returns value on success', () => {
        const r: IResultOfT<number> = ok(42);
        expect(unwrap(r)).toBe(42);
    });

    it('throws on failure', () => {
        const r: IResultOfT<number> = err<number>(new Error('op fail'));
        expect(() => unwrap(r)).toThrow(TypeError);
    });
});
