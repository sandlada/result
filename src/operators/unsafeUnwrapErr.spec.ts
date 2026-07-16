import { describe, it, expect } from 'vitest';
import { ok, err, unsafeUnwrapErr } from '../../src/index.js';

describe('unsafeUnwrapErr', () => {
    it('returns the error on failure', () => {
        const result = unsafeUnwrapErr(err('boom'));
        expect(result).toBe('boom');
    });

    it('throws the value on success', () => {
        expect(() => unsafeUnwrapErr(ok(42))).toThrow(42);
    });

    it('throws the raw success value', () => {
        expect(() => unsafeUnwrapErr(ok('should throw'))).toThrow('should throw');
    });

    it('works with custom error types', () => {
        const result = unsafeUnwrapErr(err<never, { code: number }>({ code: 404 }));
        expect(result.code).toBe(404);
    });
});
