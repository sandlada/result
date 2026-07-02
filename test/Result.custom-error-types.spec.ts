import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResult } from '../src/IResult.js';
import type { IResultOfT } from '../src/IResultOfT.js';

type AppError =
    | { kind: 'NotFound'; resource: string; id: string }
    | { kind: 'Validation'; fields: Record<string, string> }
    | { kind: 'Unauthorized'; reason: string };

class DomainError extends Error {
    constructor(
        message: string,
        public readonly code: string,
    ) {
        super(message);
        this.name = 'DomainError';
    }
}

describe('Discriminated union error', () => {
    describe('Validation error', () => {
        it('creates failure with validation error', () => {
            const err = Result.Failure<string, AppError>({
                kind: 'Validation',
                fields: { id: 'Required' },
            });
            expect(err.isFailure).toBe(true);
            if (err.isFailure) {
                expect(err.error.kind).toBe('Validation');
                if (err.error.kind === 'Validation') {
                    expect(err.error.fields.id).toBe('Required');
                }
            }
        });
    });

    describe('NotFound error', () => {
        it('creates failure with NotFound error', () => {
            const err = Result.Failure<string, AppError>({
                kind: 'NotFound',
                resource: 'User',
                id: '42',
            });
            if (err.isFailure) {
                expect(err.error.kind).toBe('NotFound');
                if (err.error.kind === 'NotFound') {
                    expect(err.error.resource).toBe('User');
                    expect(err.error.id).toBe('42');
                }
            }
        });
    });

    describe('Unauthorized error', () => {
        it('creates failure with Unauthorized error', () => {
            const err = Result.Failure<string, AppError>({
                kind: 'Unauthorized',
                reason: 'Token expired',
            });
            if (err.isFailure) {
                expect(err.error.kind).toBe('Unauthorized');
                if (err.error.kind === 'Unauthorized') {
                    expect(err.error.reason).toBe('Token expired');
                }
            }
        });
    });

    describe('Exhaustiveness checking', () => {
        it('switch covers all error variants', () => {
            const result: IResultOfT<string, AppError> = Result.Failure<string, AppError>({
                kind: 'NotFound',
                resource: 'User',
                id: '1',
            });

            let message = '';
            if (result.isFailure) {
                switch (result.error.kind) {
                    case 'NotFound':
                        message = `Missing ${result.error.resource} ${result.error.id}`;
                        break;
                    case 'Validation':
                        message = `Invalid input: ${JSON.stringify(result.error.fields)}`;
                        break;
                    case 'Unauthorized':
                        message = `Access denied: ${result.error.reason}`;
                        break;
                }
            }
            expect(message).toBe('Missing User 1');
        });
    });

    describe('Success path with discriminated union', () => {
        it('returns success with value', () => {
            const ok = Result.Success<{ id: number; name: string }>({ id: 1, name: 'Alice' });
            expect(ok.isSuccess).toBe(true);
            if (ok.isSuccess) expect(ok.value.name).toBe('Alice');
        });
    });
});

describe('Class-based error', () => {
    it('creates failure with DomainError', () => {
        const err = Result.Failure<string, DomainError>(
            new DomainError('Invalid email format', 'INVALID_EMAIL'),
        );
        expect(err.isFailure).toBe(true);
        if (err.isFailure) {
            expect(err.error).toBeInstanceOf(DomainError);
            expect(err.error).toBeInstanceOf(Error);
            expect(err.error.code).toBe('INVALID_EMAIL');
            expect(err.error.message).toBe('Invalid email format');
        }
    });

    it('DomainError retains name property', () => {
        const err = Result.Failure<string, DomainError>(
            new DomainError('oops', 'ERR'),
        );
        if (err.isFailure) expect(err.error.name).toBe('DomainError');
    });

    it('success path with DomainError', () => {
        const ok = Result.Success('valid@email.com');
        expect(ok.isSuccess).toBe(true);
        if (ok.isSuccess) expect(ok.value).toBe('valid@email.com');
    });

    it('multiple DomainError instances are distinct', () => {
        const e1 = new DomainError('first', 'E1');
        const e2 = new DomainError('second', 'E2');
        const r1 = Result.Failure<string, DomainError>(e1);
        const r2 = Result.Failure<string, DomainError>(e2);
        if (r1.isFailure && r2.isFailure) {
            expect(r1.error).not.toBe(r2.error);
            expect(r1.error.code).toBe('E1');
            expect(r2.error.code).toBe('E2');
        }
    });
});

describe('Plain object error', () => {
    it('passes any object as error', () => {
        const err = Result.Failure<number, { reason: string; retryAfter: number }>({
            reason: 'timeout',
            retryAfter: 5000,
        });
        if (err.isFailure) {
            expect(err.error.reason).toBe('timeout');
            expect(err.error.retryAfter).toBe(5000);
        }
    });

    it('plain object error is not an Error instance', () => {
        const err = Result.Failure<number, { reason: string }>({ reason: 'oops' });
        if (err.isFailure) expect(err.error).not.toBeInstanceOf(Error);
    });

    it('deeply nested plain objects work', () => {
        const err = Result.Failure<string, {
            code: string;
            detail: { inner: { value: number } };
        }>({
            code: 'DEEP',
            detail: { inner: { value: 42 } },
        });
        if (err.isFailure) expect(err.error.detail.inner.value).toBe(42);
    });
});
