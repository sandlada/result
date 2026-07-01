import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResult } from '../src/IResult.js';

describe('Result.Success()', () => {
    it('returns a success result', () => {
        const ok = Result.Success();
        expect(ok.isSuccess).toBe(true);
    });

    it('has isFailure === false', () => {
        const ok = Result.Success();
        expect(ok.isFailure).toBe(false);
    });

    it('returns an object conforming to IResult', () => {
        const ok: IResult = Result.Success();
        expect(ok).toBeDefined();
    });
});

describe('Result.Failure(error)', () => {
    it('returns a failure result', () => {
        const err = Result.Failure(new Error('fail'));
        expect(err.isSuccess).toBe(false);
    });

    it('has isFailure === true', () => {
        const err = Result.Failure(new Error('fail'));
        expect(err.isFailure).toBe(true);
    });

    it('exposes the error object', () => {
        const error = new Error('Something went wrong');
        const err = Result.Failure(error);
        expect(err.error).toBe(error);
    });

    it('works with string errors (structural typing allows non-Error TError)', () => {
        const err = Result.Failure('validation failed');
        expect(err.error).toBe('validation failed');
    });
});

describe('Result.Success<T>(value)', () => {
    it('returns a success result carrying a value', () => {
        const ok = Result.Success(42);
        expect(ok.isSuccess).toBe(true);
        expect(ok.value).toBe(42);
    });

    it('infers the value type from the argument', () => {
        const ok = Result.Success({ id: 1, name: 'Alice' });
        expect(ok.value.name).toBe('Alice');
        expect(ok.value.id).toBe(1);
    });

    it('works with null value', () => {
        const ok = Result.Success<number | null>(null);
        expect(ok.isSuccess).toBe(true);
        expect(ok.value).toBeNull();
    });

    it('works with undefined value', () => {
        const ok = Result.Success<number | undefined>(undefined);
        expect(ok.isSuccess).toBe(true);
        expect(ok.value).toBeUndefined();
    });
});

describe('Result.Failure<T, E>(error)', () => {
    it('returns a failure result with typed error', () => {
        type ApiError = { status: number; message: string };
        const err = Result.Failure<string, ApiError>({
            status: 404,
            message: 'User not found',
        });
        expect(err.isSuccess).toBe(false);
        expect(err.error.status).toBe(404);
        expect(err.error.message).toBe('User not found');
    });

    it('does not require T when unneeded', () => {
        const err = Result.Failure<never, Error>(new Error('boom'));
        expect(err.error).toBeInstanceOf(Error);
    });

    it('accepts discriminated union error types', () => {
        type ValidationError = { kind: 'required'; field: string } | { kind: 'format'; field: string };
        const err = Result.Failure<string, ValidationError>({ kind: 'required', field: 'email' });
        expect(err.error.kind).toBe('required');
        expect(err.error.field).toBe('email');
    });
});

describe('Factory consistency', () => {
    it('Success() and Failure() produce mutually exclusive states', () => {
        const ok = Result.Success();
        const err = Result.Failure(new Error('nope'));

        expect(ok.isSuccess).not.toBe(ok.isFailure);
        expect(err.isSuccess).not.toBe(err.isFailure);
    });

    it('Success<T>() value is defined on success', () => {
        const ok = Result.Success('hello');
        expect(ok.value).toBe('hello');
    });
});
