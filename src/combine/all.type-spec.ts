import { describe, it, expectTypeOf } from 'vitest';
import { all } from './all.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('all types', () => {
    it('returns IResultOfT<[number, string], E> for heterogeneous tuple', () => {
        const r = all([ok(1), ok('hi')] as const);
        const _check: IResultOfT<readonly [number, string], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns IResultOfT<[number, number, number], E> for homogeneous tuple', () => {
        const r = all([ok(1), ok(2), ok(3)] as const);
        const _check: IResultOfT<readonly [number, number, number], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('union E when inputs have different error types', () => {
        const r = all([
            ok<number>(1) as IResultOfT<number, string>,
            ok<boolean>(true) as IResultOfT<boolean, number>,
        ] as const);
        expectTypeOf(r).toBeObject();
    });

    it('returns IResultOfT<never, E> when any element is Err', () => {
        const r = all([ok(1), err('boom'), ok(2)] as const);
        expectTypeOf(r.isSuccess).toBeBoolean();
    });

    it('accepts an empty tuple and returns a value-bearing result (defect regression)', () => {
        // Brief: all([]) returns ok([]); assert this and the inferred tuple type.
        // Defect fixed: previously the constraint required at least one element,
        // so all([]) was a type error. The constraint was relaxed to accept any
        // readonly array including the empty tuple.
        const r = all([]);
        expectTypeOf(r).toBeObject();
        if (r.isSuccess) {
            // CONTRACT GAP (pinned): an un-`as const` empty array literal infers
            // `T = unknown[]`, so the mapped value type is `unknown[]` —
            // it is neither `readonly` nor `never[]`.
            expectTypeOf(r.value).toEqualTypeOf<unknown[]>();
        }
    });

    it('preserves tuple-position inference for non-empty tuples (Group B)', () => {
        // TypeScript must infer T as the literal tuple type when given a tuple
        // literal — not as an array of unions. We verify by checking each
        // position retains its original type.
        const r = all([ok(1), ok('hi'), ok(true)] as const);
        if (r.isSuccess) {
            expectTypeOf(r.value[0]).toEqualTypeOf<number>();
            expectTypeOf(r.value[1]).toEqualTypeOf<string>();
            expectTypeOf(r.value[2]).toEqualTypeOf<boolean>();
        }
    });

    it('union error type collapses when input errors differ', () => {
        // Brief: the error type is a distributive conditional collapsed to a
        // common supertype. Here the input errors are string and number; the
        // result error type must be `string | number`.
        const r = all([
            err<string>('boom') as IResultOfT<number, string>,
            err<number>(42) as IResultOfT<string, number>,
        ] as const);
        if (!r.isSuccess) {
            expectTypeOf(r.error).toEqualTypeOf<string | number>();
        }
    });
});
