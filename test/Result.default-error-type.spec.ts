import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';

describe('Default TError = Error', () => {
    it('omitting TError creates IResult<Error> on failure', () => {
        const err = Result.Failure(new Error('fail'));
        expect(err.error).toBeInstanceOf(Error);
    });

    it('omitting TError on success creates IResult<T, Error>', () => {
        const ok = Result.Success('hello');
        expect(ok.value).toBe('hello');
    });

    it('Error properties accessible without explicit TError', () => {
        const err = Result.Failure(new Error('message'));
        expect(err.error.message).toBe('message');
        expect(err.error.name).toBe('Error');
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
        const err = Result.Failure(new CustomError('oops', 500));
        expect(err.error).toBeInstanceOf(CustomError);
        expect(err.error.code).toBe(500);
    });
});

describe('Structural typing with default Error', () => {
    it('plain object works as error (structural match)', () => {
        const err = Result.Failure({ message: 'plain error' });
        expect(err.error.message).toBe('plain error');
    });

    it('default TError does not restrict error shape at runtime', () => {
        const err = Result.Failure(42);
        expect(err.error).toBe(42);
    });

    it('null as error (unusual but allowed structurally)', () => {
        const err = Result.Failure(null as unknown as Error);
        expect(err.error).toBeNull();
    });
});
