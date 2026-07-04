import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { expect as expectOp } from '../../src/index.js';

// ─── Void result ───────────────────────────────────────────────────────────

describe('expect (void result)', () => {
    it('succeeds on a success result (no return)', () => {
        const r = ok() as IResultOfT<void, never>;
        expect(() => expectOp('should not happen', r)).not.toThrow();
    });

    it('throws TypeError with the custom message on failure', () => {
        const r = err(new Error('boom'));
        try {
            expectOp('User must exist', r);
        } catch (e: unknown) {
            expect(e).toBeInstanceOf(TypeError);
            expect(String(e)).toContain('User must exist');
            expect(String(e)).toContain('boom');
        }
    });
});

// ─── Value result ──────────────────────────────────────────────────────────

describe('expect (value result)', () => {
    it('returns the value on success', () => {
        const r = ok('hello');
        expect(expectOp('should not happen', r)).toBe('hello');
    });

    it('throws TypeError with custom message on failure', () => {
        const r = err(new Error('db down'));
        try {
            expectOp('Failed to fetch user', r);
        } catch (e: unknown) {
            expect(e).toBeInstanceOf(TypeError);
            expect(String(e)).toContain('Failed to fetch user');
            expect(String(e)).toContain('db down');
        }
    });

    it('works with discriminated union TError', () => {
        type AppErr = { kind: 'NotFound'; id: number };
        const r = err<AppErr>({ kind: 'NotFound', id: 42 });
        try {
            expectOp('User lookup', r);
        } catch (e: unknown) {
            expect(e).toBeInstanceOf(TypeError);
            expect((e as TypeError).message).toContain('User lookup');
        }
    });
});

// ─── FP operator form ──────────────────────────────────────────────────────

describe('expect (FP operator)', () => {
    it('returns value on success', () => {
        const r: IResultOfT<number> = ok(42);
        expect(expectOp('not needed', r)).toBe(42);
    });

    it('throws on failure', () => {
        const r: IResultOfT<number> = err(new Error('op fail'));
        expect(() => expectOp('should not happen', r)).toThrow(TypeError);
    });
});
