import { describe, it, expect } from 'vitest';
import { ok, err, unsafeUnwrap } from '../../src/index.js';

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
});
