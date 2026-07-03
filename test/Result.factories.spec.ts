import { describe, it, expect } from 'vitest';
import { ok, err } from '../src/index.js';
import type { IResult } from '../src/types/IResult.js';
import type { IResultOfT } from '../src/types/IResultOfT.js';

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
});

describe('err(error)', () => {
    it('returns a failure result', () => {
        const r = err(new Error('fail'));
        expect(r.isSuccess).toBe(false);
    });

    it('has isFailure === true', () => {
        const r = err(new Error('fail'));
        expect(r.isFailure).toBe(true);
    });

    it('exposes the error object', () => {
        const error = new Error('Something went wrong');
        const r = err(error);
        expect(r.isFailure).toBe(true);
        if (!r.isSuccess) expect(r.error).toBe(error);
    });

    it('works with string errors (structural typing allows non-Error TError)', () => {
        const r = err('validation failed');
        expect(r.isFailure).toBe(true);
        if (!r.isSuccess) expect(r.error).toBe('validation failed');
    });
});

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
});

describe('err<E>(error) with typed error', () => {
    it('returns a failure result with typed error', () => {
        type ApiError = { status: number; message: string };
        const r = err<ApiError>({
            status: 404,
            message: 'User not found',
        });
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error.status).toBe(404);
            expect(r.error.message).toBe('User not found');
        }
    });

    it('accepts Error instances', () => {
        const r = err(new Error('boom'));
        expect(r.isFailure).toBe(true);
        if (!r.isSuccess) expect(r.error).toBeInstanceOf(Error);
    });

    it('accepts discriminated union error types', () => {
        type ValidationError = { kind: 'required'; field: string } | { kind: 'format'; field: string };
        const r = err<ValidationError>({ kind: 'required', field: 'email' });
        expect(r.isFailure).toBe(true);
        if (!r.isSuccess) {
            expect(r.error.kind).toBe('required');
            expect(r.error.field).toBe('email');
        }
    });
});

describe('Factory consistency', () => {
    it('ok() and err() produce mutually exclusive states', () => {
        const success = ok();
        const failure = err(new Error('nope'));

        expect(success.isSuccess).not.toBe(success.isFailure);
        expect(failure.isSuccess).not.toBe(failure.isFailure);
    });

    it('ok<T>() value is defined on success', () => {
        const r = ok('hello');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('hello');
    });
});

