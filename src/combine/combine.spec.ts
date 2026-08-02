import { describe, it, expect } from 'vitest';import { ok, err } from '../factories/index.js';import type { IResultOfT } from '../../src/types/IResultOfT.js';import { combine } from './index.js';describe('combine', () => {    it('returns success with all values when all results succeed', () => {        const combined = combine([ok(1), ok(2), ok(3)]);        expect(combined.isSuccess).toBe(true);        if (combined.isSuccess) {            expect(combined.value).toEqual([1, 2, 3]);        }    });    it('short-circuits on the first failure and returns it', () => {        const error = new Error('first failure');        const combined = combine([ok(1), err<number, Error>(error), ok(3)]);        expect(combined.isSuccess).toBe(false);        if (!combined.isSuccess) {            expect(combined.error).toBe(error);        }    });    it('short-circuits on a middle failure', () => {        const middleErr = new Error('middle');        const combined = combine([            ok(1),            err<number, Error>(middleErr),            err<number, Error>(new Error('never seen')),        ]);        expect(combined.isSuccess).toBe(false);        if (!combined.isSuccess) {            expect(combined.error).toBe(middleErr);            expect(combined.error.message).toBe('middle');        }    });    it('returns success with empty array for empty input', () => {        const combined = combine([]);        expect(combined.isSuccess).toBe(true);        if (combined.isSuccess) {            expect(combined.value).toEqual([]);        }    });    it('returns a single-element array for a single success', () => {        const combined = combine([ok(42)]);        expect(combined.isSuccess).toBe(true);        if (combined.isSuccess) {            expect(combined.value).toEqual([42]);        }    });    it('first-error short-circuit on homogeneous mixed success/failure (Group C)', () => {        // Brief: combine([ok(1), err('a'), ok('x')]) returns err('a') — when A and E
        // align, the first Err wins regardless of later successes.
        const combined = combine<number, string>([ok(1), err('a'), ok(2)]);
        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toBe('a');
        }
    });
    it('last-position failure still short-circuits correctly', () => {
        const combined = combine<number, string>([ok(1), ok(2), err('last')]);
        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toBe('last');
        }
    });
    it('does NOT collect trailing errors after the first short-circuit (Group C)', () => {
        // Once a failure is seen, later results are not inspected. We verify by
        // ensuring the returned error is exactly the first one, with no
        // aggregation observable.
        const firstErr = new Error('first');
        const combined = combine([
            ok<number>(1),
            err<number, Error>(firstErr),
            err<number, Error>(new Error('second')),
            err<number, Error>(new Error('third')),
        ]);
        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toBe(firstErr);
        }
    });
    it('accepts a readonly array input', () => {
        const input: readonly IResultOfT<number, never>[] = [ok(1), ok(2), ok(3)];
        const combined = combine(input);
        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([1, 2, 3]);
        }
    });
});describe('fp/combine', () => {    it('all success → returns value array', () => {        const result = combine([ok(1), ok(2), ok(3)]);        expect(result.isSuccess).toBe(true);        if (result.isSuccess) expect(result.value).toEqual([1, 2, 3]);    });    it('first failure → short-circuits', () => {        const result = combine([err<string>('fail'), ok(2), ok(3)]);        expect(result.isSuccess).toBe(false);        if (!result.isSuccess) expect(result.error).toBe('fail');    });    it('empty array → success with empty array', () => {        const result = combine([]);        expect(result.isSuccess).toBe(true);        if (result.isSuccess) expect(result.value).toEqual([]);    });    it('single failure → returns that error (Group C)', () => {        const result = combine<number, string>([err('only')]);        expect(result.isSuccess).toBe(false);        if (!result.isSuccess) expect(result.error).toBe('only');    });});

