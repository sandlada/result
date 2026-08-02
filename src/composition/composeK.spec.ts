import { describe, it, expect } from 'vitest';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { ok, err } from '../factories/index.js';
import { composeK } from './index.js';

describe('composeK', () => {
    type AppErr = string;
    const parse = (input: string): IResultOfT<number, AppErr> => {
        const n = Number(input);
        return Number.isNaN(n) ? err<AppErr>('Not a number') : ok(n);
    };
    const double = (n: number): IResultOfT<number, AppErr> => ok(n * 2);
    it('chains two successful functions', () => {
        const composed = composeK(parse, double);
        const result = composed('21');
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });
    it('short-circuits when the first function fails', () => {
        let secondCalled = false;
        const tracking = (n: number): IResultOfT<number, AppErr> => {
            secondCalled = true;
            return ok(n * 2);
        };
        const composed = composeK(parse, tracking);
        const result = composed('invalid');
        expect(secondCalled).toBe(false);
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('Not a number');
    });
    it('chains to failure when the second function fails', () => {
        const failIfLarge = (n: number): IResultOfT<number, AppErr> =>
            n > 10 ? err<AppErr>('Too large') : ok(n);
        const composed = composeK(parse, failIfLarge);
        const result = composed('21');
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('Too large');
    });
    it('supports nested composeK', () => {
        const addOne = (n: number): IResultOfT<number, AppErr> => ok(n + 1);
        const composed = composeK(parse, composeK(double, addOne));
        const result = composed('21');
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(43);
    });
    it('catches sync throw from first function', () => {
        const throwing = (_x: string): any => { throw new Error('boom'); };
        const composed = composeK(throwing, double);
        const result = composed('hello');
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBeInstanceOf(Error);
    });
    it('catches sync throw from second function', () => {
        const throwing = (_x: number): any => { throw new RangeError('overflow'); };
        const composed = composeK(parse, throwing);
        const result = composed('21');
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBeInstanceOf(RangeError);
    });
    it('throws TypeError when called with zero functions (guard)', () => {
        // @ts-expect-error Testing runtime check
        expect(() => composeK()).toThrow(TypeError);
        // @ts-expect-error Testing runtime check
        expect(() => composeK()).toThrow(/at least one function/);
    });

    it('chains exactly 6 functions (top of the documented ladder)', () => {
        // Documented ladder: 2-6 functions. Each step must widen to the
        // next function's input; the final composed function returns the
        // innermost step's value type.
        const f = composeK(
            (x: number) => ok<AppErr, number>(x * 2),
            (x: number) => ok<AppErr, number>(x + 1),
            (x: number) => ok<AppErr, string>(x.toString()),
            (s: string) => ok<AppErr, string>(s.toUpperCase()),
            (s: string) => ok<AppErr, string>(s.split('').reverse().join('')),
            (s: string) => ok<AppErr, number>(s.length),
        );
        const result = f(10);
        // 10 → 21 → "21" → "21" → "12" → 2
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(2);
    });

    it('short-circuits in the middle of the 6-function chain', () => {
        let step5Called = false;
        const step5 = (_x: string): IResultOfT<number, AppErr> => {
            step5Called = true;
            return ok(0);
        };
        const f = composeK(
            (x: number) => ok<AppErr, number>(x * 2),
            (x: number) => ok<AppErr, number>(x + 1),
            (x: number) => err<AppErr, string>('middle failure'),
            (s: string) => ok<AppErr, string>(s),
            (s: string) => ok<AppErr, string>(s),
            step5 as unknown as (s: string) => IResultOfT<number, AppErr>,
        );
        const r = f(1);
        expect(r.isFailure).toBe(true);
        if (!r.isFailure) throw new Error('expected failure');
        expect(r.error).toBe('middle failure');
        expect(step5Called).toBe(false);
    });
});