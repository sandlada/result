import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { map } from './index.js';

describe('map', () => {
    const double = (x: number) => x * 2;
    it('curried: map(fn) returns a function, then applied to success', () => {
        const doubleFn = map(double);
        const result = doubleFn(ok(21));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });
    it('direct: map(fn, result) transforms success value', () => {
        const result = map(double, ok(21));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });
    it('failure passes through unchanged (curried)', () => {
        const original = err<string>('bad');
        const mapped = map(double)(original);
        expect(mapped.isSuccess).toBe(false);
        if (!mapped.isSuccess) expect(mapped.error).toBe('bad');
    });
    it('failure passes through unchanged (direct)', () => {
        const original = err<string>('bad');
        const mapped = map(double, original);
        expect(mapped.isSuccess).toBe(false);
        if (!mapped.isSuccess) expect(mapped.error).toBe('bad');
    });
    it('chained curried: double map applies both transforms', () => {
        const addOne = (x: number) => x + 1;
        const result = map(addOne)(map(double)(ok(10)));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(21);
    });
    it('converts mapping function throw to err(caughtError) (catch+convert policy)', () => {
        const throwing = () => { throw new Error('boom'); };
        const result = map(throwing, ok(5));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('boom');
    });

    it('does NOT call fn on failure (Group C)', () => {
        const fn = vi.fn((_x: number) => 0);
        map(fn, err<string>('e'));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('calls fn exactly once on success (Group C)', () => {
        const fn = vi.fn((_x: number) => 0);
        map(fn, ok(5));
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('converts non-Error throw to err(caught) (Group D)', () => {
        const result = map((_x: number) => { throw 'string-throw'; }, ok(1));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('string-throw');
    });

    it('uses errorFn to map thrown errors in direct call', () => {
        const throwing = () => { throw new Error('boom'); };
        const result = map(
            throwing,
            ok(5),
            (thrown) => `mapped: ${(thrown as Error).message}`
        );
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('mapped: boom');
    });

    it('uses errorFn to map thrown errors in curried call', () => {
        const throwing = () => { throw new Error('boom'); };
        const mappedFn = map(
            throwing,
            (thrown) => `mapped: ${(thrown as Error).message}`
        );
        const result = mappedFn(ok(5));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('mapped: boom');
    });
});

