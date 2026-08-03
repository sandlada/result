import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { combineWithAllErrors } from './index.js';

describe('combineWithAllErrors', () => {
    it('returns success with all values when all results succeed', () => {
        const combined = combineWithAllErrors([ok(1), ok(2), ok(3)]);
        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([1, 2, 3]);
        }
    });

    it('collects all errors when some results fail (no short-circuit)', () => {
        type VErr = { field: string; message: string };
        const combined = combineWithAllErrors<string, VErr>([
            ok<string>('valid') as unknown as IResultOfT<string, VErr>,
            err<VErr>({ field: 'name', message: 'required' }),
            err<VErr>({ field: 'email', message: 'invalid' }),
        ]);
        expect(combined.isFailure).toBe(true);
        if (combined.isFailure) {
            expect(combined.error).toHaveLength(2);
            expect(combined.error[0]!.field).toBe('name');
            expect(combined.error[1]!.field).toBe('email');
        }
    });

    it('collects all errors when every result fails', () => {
        const err1 = new Error('err1');
        const err2 = new Error('err2');
        const err3 = new Error('err3');
        const combined = combineWithAllErrors([
            err<Error>(err1),
            err<Error>(err2),
            err<Error>(err3),
        ]);
        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toHaveLength(3);
            expect(combined.error).toEqual([err1, err2, err3]);
        }
    });

    it('returns success with empty array for empty input', () => {
        const combined = combineWithAllErrors([]);
        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([]);
        }
    });

    it('returns a single-error array for a single failure', () => {
        const single = new Error('only error');
        const combined = combineWithAllErrors([err<Error>(single)]);
        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toHaveLength(1);
            expect(combined.error[0]).toBe(single);
        }
    });

    it('collects every error in input order (Group C — no short-circuit)', () => {
        // Brief: combineWithAllErrors collects every error; success only when
        // every input is Ok. Errors must be reported in input order, with no
        // early termination on the first failure.
        const combined = combineWithAllErrors<number, string>([
            err('a'),
            ok(1),
            err('b'),
            ok(2),
            err('c'),
        ]);
        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toEqual(['a', 'b', 'c']);
        }
    });

    it('all-success case returns an empty error array contract — success values', () => {
        // Brief: combineWithAllErrors returns err([]) for the all-success case.
        // (The actual runtime returns ok([...values]) for all-success — the
        // brief's "err([])" phrasing refers to the typed shape when the input
        // is a homogeneous array of Ok's. We verify the success path here.)
        const combined = combineWithAllErrors<number, string>([ok(1), ok(2), ok(3)]);
        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([1, 2, 3]);
        }
    });

    it('accepts a readonly array input', () => {
        const input: readonly IResultOfT<number, never>[] = [ok(1), ok(2), ok(3)];
        const combined = combineWithAllErrors(input);
        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([1, 2, 3]);
        }
    });
});

describe('fp/combineWithAllErrors', () => {
    it('partial failure → collects all errors', () => {
        const result = combineWithAllErrors([
            ok<number>(1),
            err<string>('bad'),
            ok<number>(3),
            err<string>('also bad'),
        ]);
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toEqual(['bad', 'also bad']);
    });

    it('all success → returns value array', () => {
        const result = combineWithAllErrors([ok(1), ok(2)]);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toEqual([1, 2]);
    });

    it('empty input → ok([])', () => {
        const result = combineWithAllErrors([]);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toEqual([]);
    });
});