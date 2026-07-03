import { describe, it, expect } from 'vitest';
import { ok, err } from '../src/index.js';

describe('Value on success', () => {
    it('returns the provided value', () => {
        const r = ok(42);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('works with object values', () => {
        const obj = { id: 1, name: 'Alice' };
        const r = ok(obj);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value).toBe(obj);
            expect(r.value.name).toBe('Alice');
        }
    });

    it('works with string values', () => {
        const r = ok('hello');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('hello');
    });

    it('works with array values', () => {
        const arr = [1, 2, 3];
        const r = ok(arr);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 2, 3]);
    });

    it('works with boolean values', () => {
        const r = ok(true);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(true);
    });
});

describe('Value on failure', () => {
    it('has no value property on failure objects', () => {
        const r = err<string, Error>(new Error('nope'));
        // Plain objects don't have a `value` property on failure
        expect('value' in r).toBe(false);
    });

    it('error is accessible on failure', () => {
        const r = err<string, Error>(new Error('nope'));
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
            expect(r.error.message).toBe('nope');
        }
    });

    it('typed failure error access', () => {
        type AppError = { kind: 'NotFound' };
        const r = err<string, AppError>({ kind: 'NotFound' });
        if (r.isFailure) {
            expect(r.error.kind).toBe('NotFound');
        }
    });
});

describe('Type narrowing after isSuccess check', () => {
    it('value is safely accessible in success branch', () => {
        const result = ok('hello');
        if (result.isSuccess) {
            const val: string = result.value;
            expect(val).toBe('hello');
        }
    });

    it('value is safely avoided in failure branch', () => {
        const result = err<string, Error>(new Error('fail'));
        if (result.isFailure) {
            expect(result.error).toBeInstanceOf(Error);
        }
    });

    it('both branches cover all cases', () => {
        const result: { isSuccess: boolean; value?: number; error?: Error } = ok(10);
        if (result.isSuccess) {
            expect(result.value).toBe(10);
        } else {
            expect(result.error).toBeDefined();
        }
    });
});

describe('Void success (no value)', () => {
    it('ok() returns IResult (not IResult<T>)', () => {
        const r = ok();
        expect(r.isSuccess).toBe(true);
    });
});
