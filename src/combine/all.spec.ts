import { describe, it, expect, expectTypeOf } from 'vitest';
import { ok, err } from '../factories/index.js';
import { all } from './index.js';

describe('all', () => {
    it('combines a heterogeneous tuple preserving each element type', () => {
        const combined = all([
            ok<number>(1),
            ok<string>('hello'),
            ok<boolean>(true),
        ] as const);
        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            const [num, str, bool] = combined.value;
            expect(num).toBe(1);
            expect(str).toBe('hello');
            expect(bool).toBe(true);
        }
    });

    it('short-circuits on the first failure in a tuple', () => {
        const error = new Error('failed');
        const combined = all([
            ok<number>(1),
            err<Error>(error),
            ok<boolean>(true),
        ] as const);
        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toBe(error);
        }
    });

    it('works with a single-element tuple', () => {
        const combined = all([ok(42)] as const);
        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            const [val] = combined.value;
            expect(val).toBe(42);
        }
    });

    it('preserves types when using as const on a tuple', () => {
        const combined = all([ok(10), ok('world')] as const);
        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            const [a, b] = combined.value;
            expect(typeof a).toBe('number');
            expect(typeof b).toBe('string');
        }
    });

    it('returns ok([]) for an empty tuple (defect regression)', () => {
        // Brief: all([]) returns ok([]); assert this and the inferred tuple type.
        // Previously the constraint `T extends readonly [IResultOfT<unknown, unknown>, ...]`
        // rejected empty tuples at the type level. The constraint was relaxed
        // to `T extends readonly IResultOfT<unknown, unknown>[]` so empty tuples
        // are accepted; the runtime still produces `ok([])` because the loop
        // has nothing to iterate.
        const combined = all([]);
        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) {
            expect(combined.value).toEqual([]);
            // CONTRACT GAP (pinned): the inferred value type for an empty input
            // is `unknown[]` (from the mapped type `{ [K in keyof T]: ... }`
            // over the empty tuple's `keyof`), not `never[]`. Pinned
            // rather than "fixed" because tightening the inference would change
            // the public type contract of `all`.
            expectTypeOf(combined.value).toEqualTypeOf<unknown[]>();
        }
    });

    it('tuple-position preservation — value types at each index (Group B)', () => {
        const combined = all([ok(1), ok('hi'), ok(true)] as const);
        if (combined.isSuccess) {
            expectTypeOf(combined.value).toEqualTypeOf<readonly [number, string, boolean]>();
        }
    });

    it('does NOT process elements after the first failure (Group C)', () => {
        const err1 = new Error('first');
        const combined = all([
            ok<number>(1),
            err<Error>(err1),
            err<Error>(new Error('second')),
            ok<boolean>(true),
        ] as const);
        expect(combined.isSuccess).toBe(false);
        if (!combined.isSuccess) {
            expect(combined.error).toBe(err1);
        }
    });
});

describe('fp/all', () => {
    it('heterogeneous tuple all success', () => {
        const result = all([
            ok<number>(1),
            ok<string>('hello'),
        ] as const);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toEqual([1, 'hello']);
    });

    it('any failure → short-circuits', () => {
        const result = all([
            ok<number>(1),
            err<string>('failed'),
        ] as const);
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('failed');
    });

    it('empty tuple → ok with empty value (Group B)', () => {
        const result = all([]);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toEqual([]);
    });
});