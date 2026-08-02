import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { unsafeUnwrapErr } from './index.js';

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

    it('throws the raw success value (NOT wrapped in TypeError) (Group D)', () => {
        const v = { code: 7 };
        try { unsafeUnwrapErr(ok(v)); } catch (caught: unknown) {
            expect(caught).toBe(v);
        }
    });

    it('returns the literal error value (no widening) (Group B)', () => {
        const r = err('boom' as const);
        const e = unsafeUnwrapErr(r);
        expect(e).toBe('boom');
        const _check: 'boom' = e;
        void _check;
    });
});
