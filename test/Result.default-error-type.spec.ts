import { describe, it, expect } from 'vitest';
import { ok, err } from '../src/index.js';

describe('Default TError = Error', () => {
    it('omitting TError creates IResult<Error> on failure', () => {
        const r = err(new Error('fail'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeInstanceOf(Error);
    });

    it('omitting TError on success creates IResult<T, Error>', () => {
        const r = ok('hello');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('hello');
    });

    it('Error properties accessible without explicit TError', () => {
        const r = err(new Error('message'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error.message).toBe('message');
            expect(r.error.name).toBe('Error');
        }
    });

    it('custom Error subclass works with default TError', () => {
        class CustomError extends Error {
            constructor(
                message: string,
                public readonly code: number,
            ) {
                super(message);
                this.name = 'CustomError';
            }
        }
        const r = err(new CustomError('oops', 500));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(CustomError);
            expect((r.error as CustomError).code).toBe(500);
        }
    });
});

describe('Structural typing with default Error', () => {
    it('plain object works as error (structural match)', () => {
        const r = err({ message: 'plain error' });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as { message: string }).message).toBe('plain error');
    });

    it('default TError does not restrict error shape at runtime', () => {
        const r = err(42);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error as unknown as number).toBe(42);
    });

    it('null as error (unusual but allowed structurally)', () => {
        const r = err(null as unknown as Error);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeNull();
    });
});
