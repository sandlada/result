import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';

describe('Value on success', () => {
    it('returns the provided value', () => {
        const ok = Result.Success(42);
        expect(ok.value).toBe(42);
    });

    it('works with object values', () => {
        const obj = { id: 1, name: 'Alice' };
        const ok = Result.Success(obj);
        expect(ok.value).toBe(obj);
        expect(ok.value.name).toBe('Alice');
    });

    it('works with string values', () => {
        const ok = Result.Success('hello');
        expect(ok.value).toBe('hello');
    });

    it('works with array values', () => {
        const arr = [1, 2, 3];
        const ok = Result.Success(arr);
        expect(ok.value).toEqual([1, 2, 3]);
    });

    it('works with boolean values', () => {
        const ok = Result.Success(true);
        expect(ok.value).toBe(true);
    });
});

describe('Value on failure', () => {
    it('throws TypeError when accessing value', () => {
        const err = Result.Failure<string, Error>(new Error('nope'));
        expect(() => err.value).toThrow();
    });

    it('throws with a descriptive message', () => {
        const err = Result.Failure<string, Error>(new Error('nope'));
        expect(() => err.value).toThrow(TypeError);
    });

    it('typed failure value access also throws', () => {
        type AppError = { kind: 'NotFound' };
        const err = Result.Failure<string, AppError>({ kind: 'NotFound' });
        expect(() => err.value).toThrow();
    });
});

describe('Type narrowing after isSuccess check', () => {
    it('value is safely accessible in success branch', () => {
        const result = Result.Success('hello');
        if (result.isSuccess) {
            const val: string = result.value;
            expect(val).toBe('hello');
        }
    });

    it('value is safely avoided in failure branch', () => {
        const result = Result.Failure<string, Error>(new Error('fail'));
        if (result.isFailure) {
            expect(result.error).toBeInstanceOf(Error);
        }
    });

    it('both branches cover all cases', () => {
        const result: { isSuccess: boolean; value?: number; error?: Error } = Result.Success(10);
        if (result.isSuccess) {
            expect(result.value).toBe(10);
        } else {
            expect(result.error).toBeDefined();
        }
    });
});

describe('Void success (no value)', () => {
    it('Result.Success() returns IResult (not IResult<T>)', () => {
        const ok = Result.Success();
        expect(ok.isSuccess).toBe(true);
    });
});
