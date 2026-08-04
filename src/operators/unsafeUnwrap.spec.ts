import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { unsafeUnwrap } from './index.js';

describe('unsafeUnwrap', () => {
    it('returns the value on success', () => {
        const result = unsafeUnwrap(ok(42));
        expect(result).toBe(42);
    });

    it('throws the error on failure', () => {
        expect(() => unsafeUnwrap(err('boom'))).toThrow('boom');
    });

    it('works with custom error types', () => {
        expect(() => unsafeUnwrap(err(404))).toThrow(404);
    });

    it('throws the raw error (not wrapped)', () => {
        const customError = new TypeError('custom');
        expect(() => unsafeUnwrap(err(customError))).toThrow(customError);
    });

    it('works with Error instances as error type', () => {
        expect(() => unsafeUnwrap(err(new Error('oops')))).toThrow('oops');
    });

    it('throws the raw error value verbatim (no wrapper) on failure (Group D)', () => {
        // Earlier wording said "throws TypeError"; the function does NOT throw
        // a TypeError — it re-throws whatever the Err holds, with no wrapping.
        // The test uses a TypeError instance only to demonstrate the "no
        // wrapper" property; the same shape would hold for an `Error`,
        // `RangeError`, a string, a number, or any other value.
        const e = new TypeError('t');
        try { unsafeUnwrap(err(e)); } catch (caught: unknown) {
            expect(caught).toBe(e);
        }
    });

    it('returns the literal value (no widening) (Group B)', () => {
        const r = ok('literal' as const);
        const v = unsafeUnwrap(r);
        expect(v).toBe('literal');
        const _check: 'literal' = v;
        void _check;
    });
});
