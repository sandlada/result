import { describe, it, expect } from 'vitest';
import { ok, err } from '../../index.js';
import type { IResult } from '../../types/IResult.js';
import type { IResultOfT } from '../../types/IResultOfT.js';

type AppError =
    | { kind: 'NotFound'; resource: string; id: string }
    | { kind: 'Validation'; fields: Record<string, string> };

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
            const r = err<string, AppError>({
                kind: 'Validation',
                fields: { id: 'Required' },
            });
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('Validation');
                if (r.error.kind === 'Validation') {
                    expect(r.error.fields.id).toBe('Required');
                }
            }
        });
    });

    describe('NotFound error', () => {
        it('creates failure with NotFound error', () => {
            const r = err<string, AppError>({
                kind: 'NotFound',
                resource: 'User',
                id: '42',
            });
            if (r.isFailure) {
                expect(r.error.kind).toBe('NotFound');
                if (r.error.kind === 'NotFound') {
                    expect(r.error.resource).toBe('User');
                    expect(r.error.id).toBe('42');
                }
            }
        });
    });

    describe('Unauthorized error', () => {
        it('creates failure with Unauthorized error', () => {
            const r = err<string, AppError>({
                kind: 'Unauthorized',
                reason: 'Token expired',
            });
            if (r.isFailure) {
                expect(r.error.kind).toBe('Unauthorized');
                if (r.error.kind === 'Unauthorized') {
                    expect(r.error.reason).toBe('Token expired');
                }
            }
        });
    });

    describe('Exhaustiveness checking', () => {
        it('switch covers all error variants', () => {
            const result: IResultOfT<string, AppError> = err<string, AppError>({
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
            const r = ok<{ id: number; name: string }>({ id: 1, name: 'Alice' });
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) expect(r.value.name).toBe('Alice');
        });
    });
});

describe('Class-based error', () => {
    it('creates failure with DomainError', () => {
        const r = err<string, DomainError>(
            new DomainError('Invalid email format', 'INVALID_EMAIL'),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(DomainError);
            expect(r.error).toBeInstanceOf(Error);
            expect(r.error.code).toBe('INVALID_EMAIL');
            expect(r.error.message).toBe('Invalid email format');
        }
    });

    it('DomainError retains name property', () => {
        const r = err<string, DomainError>(
            new DomainError('oops', 'ERR'),
        );
        if (r.isFailure) expect(r.error.name).toBe('DomainError');
    });

    it('success path with DomainError', () => {
        const r = ok('valid@email.com');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('valid@email.com');
    });

    it('multiple DomainError instances are distinct', () => {
        const e1 = new DomainError('first', 'E1');
        const e2 = new DomainError('second', 'E2');
        const r1 = err<string, DomainError>(e1);
        const r2 = err<string, DomainError>(e2);
        if (r1.isFailure && r2.isFailure) {
            expect(r1.error).not.toBe(r2.error);
            expect(r1.error.code).toBe('E1');
            expect(r2.error.code).toBe('E2');
        }
    });
});

describe('Plain object error', () => {
    it('passes any object as error', () => {
        const r = err<number, { reason: string; retryAfter: number }>({
            reason: 'timeout',
            retryAfter: 5000,
        });
        if (r.isFailure) {
            expect(r.error.reason).toBe('timeout');
            expect(r.error.retryAfter).toBe(5000);
        }
    });

    it('plain object error is not an Error instance', () => {
        const r = err<number, { reason: string }>({ reason: 'oops' });
        if (r.isFailure) expect(r.error).not.toBeInstanceOf(Error);
    });

    it('deeply nested plain objects work', () => {
        const r = err<string, {
            code: string;
            detail: { inner: { value: number } };
        }>({
            code: 'DEEP',
            detail: { inner: { value: 42 } },
        });
        if (r.isFailure) expect(r.error.detail.inner.value).toBe(42);
    });
});
