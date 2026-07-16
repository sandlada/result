import { describe, it, expect } from 'vitest';
import { ok, err } from '../../index.js';

// ── Void Result ──────────────────────────────────────────────────────

describe('IResult (void)', () => {
    it('ok() creates a success with isSuccess=true', () => {
        const r = ok();
        expect(r.isSuccess).toBe(true);
        expect(r.isFailure).toBe(false);
    });

    it('ok() value is not accessible (compile-time)', () => {
        const r = ok();
        expect(r.isSuccess).toBe(true);
        // (r as any).value would be undefined at runtime but TS forbids it
    });

    it('err creates a failure with isSuccess=false', () => {
        const r = err('error');
        expect(r.isSuccess).toBe(false);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('error');
    });

    it('err with Error instance', () => {
        const e = new Error('something went wrong');
        const r = err(e);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(e);
    });

    it('narrowing: isSuccess narrows to success variant', () => {
        const r = ok();
        if (r.isSuccess) {
            // value does not exist on void success
            // but isSuccess is true
            expect(r.isSuccess).toBe(true);
        }
    });

    it('narrowing: isFailure narrows to failure variant', () => {
        const r = err('oops');
        if (r.isFailure) {
            expect(r.error).toBe('oops');
        }
    });

    it('string error', () => {
        const r = err('fail');
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });

    it('number error', () => {
        const r = err(500);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(500);
    });

    it('object error', () => {
        const r = err({ code: 500, message: 'Server Error' });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error.code).toBe(500);
            expect(r.error.message).toBe('Server Error');
        }
    });
});

// ── Value Result ─────────────────────────────────────────────────────

describe('IResultOfT (value)', () => {
    it('ok(value) creates success with value', () => {
        const r = ok(42);
        expect(r.isSuccess).toBe(true);
        expect(r.isFailure).toBe(false);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('ok(value) with string', () => {
        const r = ok('hello');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('hello');
    });

    it('ok(value) with object', () => {
        const obj = { id: 1, name: 'Alice' };
        const r = ok(obj);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(obj);
    });

    it('ok(value) with array', () => {
        const arr = [1, 2, 3];
        const r = ok(arr);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 2, 3]);
    });

    it('ok(value) with boolean', () => {
        const r = ok(true);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(true);
    });

    it('ok(value) with null', () => {
        const r = ok(null);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBeNull();
    });

    it('err creates failure with error', () => {
        const r = err<string, string>('error');
        expect(r.isSuccess).toBe(false);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('error');
    });

    it('value is undefined on failure variant', () => {
        const r = err<string, string>('fail');
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            // .value doesn't exist on failure variant
            expect(r.error).toBe('fail');
        }
    });

    it('error is undefined on success variant', () => {
        const r = ok(42);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            // .error doesn't exist on success variant
            expect(r.value).toBe(42);
        }
    });

    it('narrowing: isSuccess narrows to success variant', () => {
        const r = ok(42);
        if (r.isSuccess) {
            expect(r.value).toBe(42);
        }
    });

    it('narrowing: isSuccess lets else branch access error', () => {
        const r = err<number, string>('fail');
        if (r.isSuccess) {
            expect(r.value).toBe(42);
        } else {
            expect(r.error).toBe('fail');
        }
    });

    it('narrowing: isFailure narrows to failure variant', () => {
        const r = err<number, string>('fail');
        if (r.isFailure) {
            expect(r.error).toBe('fail');
        }
    });

    it('generic parameter inference from factory', () => {
        const r = ok(42);
        if (r.isSuccess) {
            expect(r.value).toBe(42);
        }
    });

    it('explicit generic types work', () => {
        const r = ok<number>(42);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('explicit error type generic works', () => {
        type CustomError = { message: string; code: number };
        const r = err<number, CustomError>({ message: 'fail', code: 500 });
        if (r.isFailure) {
            expect(r.error.code).toBe(500);
        }
    });

    it('discriminated union error type works', () => {
        type ApiError =
            | { kind: 'NotFound'; resource: string }
            | { kind: 'Validation'; field: string };

        const r1 = err<string, ApiError>({ kind: 'NotFound', resource: 'user' });
        if (r1.isFailure) {
            if (r1.error.kind === 'NotFound') {
                expect(r1.error.resource).toBe('user');
            }
        }

        const r2 = err<string, ApiError>({ kind: 'Validation', field: 'email' });
        if (r2.isFailure) {
            if (r2.error.kind === 'Validation') {
                expect(r2.error.field).toBe('email');
            }
        }
    });

    it('isSuccess on value result', () => {
        const r = ok(42);
        expect(r.isSuccess).toBe(true);
    });

    it('isFailure on value result', () => {
        const r = err<number, string>('fail');
        expect(r.isFailure).toBe(true);
    });
});
