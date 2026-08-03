import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { sequence } from './index.js';
import { combine } from '../combine/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('sequence', () => {
    it('matches combine byte-for-byte for a uniform-success list', () => {
        const input = [ok(1), ok(2), ok(3)];
        expect(sequence(input)).toEqual(combine(input));
    });

    it('short-circuits on first failure', () => {
        const r = sequence([ok(1), err('a'), ok(3)]);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('a');
    });

    it('returns Ok([]) on empty input', () => {
        const r = sequence([]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('returns Ok of values when all results succeed (Step 14.2 — sequence equivalence to combine)', () => {
        const r = sequence([ok(1), ok(2), ok(3)]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value).toEqual([1, 2, 3]);
        }
    });

    it('preserves error object identity on short-circuit (Step 14.2 — first-error wins)', () => {
        const sentinel = { code: 'E_FIRST' };
        const r = sequence([
            ok(1),
            err<number>(sentinel),
            err<number>({ code: 'NEVER_SEEN' }),
        ]);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(sentinel);
    });

    it('matches combine on a heterogeneous shape that is still IResultOfT<T, E> (Step 14.2 — sequence aliasing)', () => {
        const input: IResultOfT<number, string>[] = [ok(1), ok(2)];
        expect(sequence(input)).toEqual(combine(input));
    });

    it('accepts a readonly array input (Step 14.2 — readonly contract)', () => {
        const input: readonly IResultOfT<number, never>[] = [ok(1), ok(2), ok(3)];
        const r = sequence(input);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 2, 3]);
    });

    it('returns single-element array for a single success (Step 14.2 — boundary)', () => {
        const r = sequence([ok(42)]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([42]);
    });

    it('returns the failure when the only element is an error (Step 14.2 — boundary)', () => {
        const r = sequence<number, string>([err('only')]);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('only');
    });

    it('last-position failure still short-circuits correctly (Step 14.2 — last-position short-circuit)', () => {
        const r = sequence<number, string>([ok(1), ok(2), err('last')]);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('last');
    });

    it('preserves E across more than two error types (Step 14.2 — error channel)', () => {
        const errObj = new Error('boom');
        const r = sequence<number, Error>([ok(1), err<number, Error>(errObj)]);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(errObj);
    });
});
