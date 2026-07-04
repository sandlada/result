import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../../src/index.js';
import { orThrow, orThrowWith } from '../../src/index.js';

describe('orThrow', () => {
    it('returns the value on success', () => {
        expect(orThrow(ok(42))).toBe(42);
    });

    it('returns undefined for void success', () => {
        expect(orThrow(ok())).toBeUndefined();
    });

    it('throws the error directly on failure', () => {
        const error = new Error('boom');
        expect(() => orThrow(err(error))).toThrow(error);
    });

    it('throws the exact error instance (not a wrapper)', () => {
        class CustomError extends Error { public readonly code: number; constructor(msg: string, code: number) { super(msg); this.code = code; } }
        const error = new CustomError('custom', 42);
        expect(() => orThrow(err(error))).toThrow(CustomError);
        try { orThrow(err(error)); } catch(e: unknown) {
            expect(e).toBe(error);
            if(e instanceof CustomError) expect(e.code).toBe(42);
        }
    });
});

describe('orThrowWith', () => {
    it('returns the value on success', () => {
        expect(orThrowWith(e => new Error(String(e)), ok(42))).toBe(42);
    });

    it('returns undefined for void success', () => {
        expect(orThrowWith(e => new Error(String(e)), ok())).toBeUndefined();
    });

    it('throws a custom error transformed by errorFn on failure', () => {
        const customError = new Error('custom message');
        expect(() => orThrowWith(e => customError, err('original'))).toThrow(customError);
    });

    it('passes the original error to errorFn', () => {
        const original = { code: 400, message: 'bad request' };
        const spy = vi.fn((e: unknown) => new Error(String(e)));
        expect(() => orThrowWith(spy, err(original))).toThrow();
        expect(spy).toHaveBeenCalledWith(original);
    });

    it('is curried', () => {
        const makeError = (e: string) => new Error(e);
        const unwrap = orThrowWith(makeError);
        expect(() => unwrap(err('fail'))).toThrow('fail');
        expect(unwrap(ok(42))).toBe(42);
    });

    it('curried form can be reused', () => {
        const makeError = (e: string) => new Error(e);
        const unwrap = orThrowWith(makeError);
        expect(unwrap(ok(1))).toBe(1);
        expect(unwrap(ok(2))).toBe(2);
        expect(() => unwrap(err('x'))).toThrow('x');
    });
});
