import { describe, it, expect } from 'vitest';
import { ok, err } from '../../factories/index.js';
import type { IResult } from '../../types/IResult.js';
import type { IResultOfT } from '../../types/IResultOfT.js';

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
            const r = err<AppError>({
                kind: 'Validation',
                fields: { id: 'Required' },
            });
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                const error = r.error as unknown as AppError;
                expect(error.kind).toBe('Validation');
                if (error.kind === 'Validation') {
                    expect(error.fields.id).toBe('Required');
                }
            }
        });
    });

    describe('NotFound error', () => {
        it('creates failure with NotFound error', () => {
            const r = err<AppError>({
                kind: 'NotFound',
                resource: 'User',
                id: '42',
            });
            if (r.isFailure) {
                const error = r.error as unknown as AppError;
                expect(error.kind).toBe('NotFound');
                if (error.kind === 'NotFound') {
                    expect(error.resource).toBe('User');
                    expect(error.id).toBe('42');
                }
            }
        });
    });

    describe('Unauthorized error', () => {
        it('creates failure with Unauthorized error', () => {
            const r = err<AppError>({
                kind: 'Unauthorized',
                reason: 'Token expired',
            });
            if (r.isFailure) {
                const error = r.error as unknown as AppError;
                expect(error.kind).toBe('Unauthorized');
                if (error.kind === 'Unauthorized') {
                    expect(error.reason).toBe('Token expired');
                }
            }
        });
    });

    describe('Exhaustiveness checking', () => {
        it('switch covers all error variants', () => {
            const result: IResultOfT<string, AppError> = err<AppError>({
                kind: 'NotFound',
                resource: 'User',
                id: '1',
            }) as unknown as IResultOfT<string, AppError>;

            let message = '';
            if (result.isFailure) {
                const error = result.error as unknown as AppError;
                switch (error.kind) {
                    case 'NotFound':
                        message = `Missing ${error.resource} ${error.id}`;
                        break;
                    case 'Validation':
                        message = `Invalid input: ${JSON.stringify(error.fields)}`;
                        break;
                    case 'Unauthorized':
                        message = `Access denied: ${error.reason}`;
                        break;
                }
            }
            expect(message).toBe('Missing User 1');
        });
    });

    describe('Success path with discriminated union', () => {
        it('returns success with value', () => {
            const r = ok({ id: 1, name: 'Alice' }) as unknown as IResultOfT<{ id: number; name: string }, never>;
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) expect(r.value.name).toBe('Alice');
        });
    });
});

describe('Class-based error', () => {
    it('creates failure with DomainError', () => {
        const r = err<DomainError>(
            new DomainError('Invalid email format', 'INVALID_EMAIL'),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            const error = r.error as unknown as DomainError;
            expect(error).toBeInstanceOf(DomainError);
            expect(error).toBeInstanceOf(Error);
            expect(error.code).toBe('INVALID_EMAIL');
            expect(error.message).toBe('Invalid email format');
        }
    });

    it('DomainError retains name property', () => {
        const r = err<DomainError>(
            new DomainError('oops', 'ERR'),
        );
        if (r.isFailure) expect((r.error as unknown as DomainError).name).toBe('DomainError');
    });

    it('success path with DomainError', () => {
        const r = ok('valid@email.com');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('valid@email.com');
    });

    it('multiple DomainError instances are distinct', () => {
        const e1 = new DomainError('first', 'E1');
        const e2 = new DomainError('second', 'E2');
        const r1 = err<DomainError>(e1);
        const r2 = err<DomainError>(e2);
        if (r1.isFailure && r2.isFailure) {
            const err1 = r1.error as unknown as DomainError;
            const err2 = r2.error as unknown as DomainError;
            expect(err1).not.toBe(err2);
            expect(err1.code).toBe('E1');
            expect(err2.code).toBe('E2');
        }
    });
});

describe('Plain object error', () => {
    type TimeoutError = { reason: string; retryAfter: number };

    it('passes any object as error', () => {
        const r = err<TimeoutError>({
            reason: 'timeout',
            retryAfter: 5000,
        });
        if (r.isFailure) {
            const error = r.error as unknown as TimeoutError;
            expect(error.reason).toBe('timeout');
            expect(error.retryAfter).toBe(5000);
        }
    });

    it('plain object error is not an Error instance', () => {
        const r = err<{ reason: string }>({ reason: 'oops' });
        if (r.isFailure) expect(r.error).not.toBeInstanceOf(Error);
    });

    it('deeply nested plain objects work', () => {
        const r = err<{
            code: string;
            detail: { inner: { value: number } };
        }>({
            code: 'DEEP',
            detail: { inner: { value: 42 } },
        });
        if (r.isFailure) expect((r.error as unknown as { detail: { inner: { value: number } } }).detail.inner.value).toBe(42);
    });
});
