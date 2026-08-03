import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { unwrap } from './index.js';

// ─── Void result ───────────────────────────────────────────────────────────

describe('unwrap (void result)', () => {
    it('succeeds on a success result (no return)', () => {
        const r = ok() as unknown as IResultOfT<unknown, never>;
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
        const r = err<Error>(new Error('no number here'));
        expect(() => unwrap(r)).toThrow(TypeError);
    });

    it('includes the error in the thrown message', () => {
        const r = err<Error>(new Error('parse error'));
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
        const r: IResultOfT<number> = err<Error>(new Error('op fail'));
        expect(() => unwrap(r)).toThrow(TypeError);
    });

    it('throws TypeError on failure with exact message format (Group D)', () => {
        const r = err<Error>(new Error('inner-error'));
        try { unwrap(r); } catch (e: unknown) {
            const msg = (e as TypeError).message;
            expect(msg).toContain('Called unwrap() on a failure result.');
            expect(msg).toContain('inner-error');
        }
    });

    it('throws on non-Error error types (string) (Group D)', () => {
        const r = err<string>('string-error');
        try { unwrap(r); } catch (e: unknown) {
            expect(e).toBeInstanceOf(TypeError);
            expect((e as TypeError).message).toContain('string-error');
        }
    });
});
