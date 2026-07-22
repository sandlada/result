import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { ap } from '../../src/operators/ap.js';

describe('ap', () => {
    it('applies a wrapped function to a wrapped value when both are Ok', () => {
        const fnResult = ok((x: number) => x * 2);
        const valueResult = ok(21);
        const result = ap(fnResult, valueResult);
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('propagates failure if fnResult is Err', () => {
        const fnResult = err<string>('fn failed');
        const valueResult = ok(21);
        const result = ap(fnResult, valueResult);
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fn failed');
    });

    it('propagates failure if valueResult is Err', () => {
        const fnResult = ok((x: number) => x * 2);
        const valueResult = err<string>('val failed');
        const result = ap(fnResult, valueResult);
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('val failed');
    });

    it('propagates fnResult failure even when both are Err (fn checked first)', () => {
        const fnResult = err<string>('fn failed');
        const valueResult = err<string>('val failed');
        const result = ap(fnResult, valueResult);
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fn failed');
    });

    it('is curried', () => {
        const applyFn = ap(ok((x: number) => x + 1));
        const result = applyFn(ok(41));
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('works with string transformations', () => {
        const fnResult = ok((s: string) => s.toUpperCase());
        const valueResult = ok('hello');
        const result = ap(fnResult, valueResult);
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe('HELLO');
    });

    it('converts fn throw to Err(caught)', () => {
        const fnResult = ok<() => number>(() => { throw new Error('fn-boom'); });
        const result = ap(fnResult, ok(0));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('fn-boom');
    });
});
