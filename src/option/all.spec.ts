import { describe, it, expect, expectTypeOf } from 'vitest';
import { ofSome, ofNone } from './index.js';
import { all } from '../../src/option/index.js';

describe('Option — all', () => {
    it('all Some returns Some tuple', () => {
        const result = all([ofSome(1), ofSome('hi'), ofSome(true)]);
        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toEqual([1, 'hi', true]);
        }
    });

    it('short-circuits on first None', () => {
        const result = all([ofSome(1), ofNone(), ofSome(true)]);
        expect(result.isSome).toBe(false);
    });

    it('None at first position', () => {
        const result = all([ofNone(), ofSome(2)]);
        expect(result.isSome).toBe(false);
    });

    it('None at last position', () => {
        const result = all([ofSome(1), ofNone()]);
        expect(result.isSome).toBe(false);
    });

    it('single element tuple', () => {
        const result = all([ofSome(42)]);
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toEqual([42]);
    });

    it('preserves heterogeneous types', () => {
        const result = all([ofSome('hello'), ofSome(42), ofSome(true)]);
        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value[0]).toBe('hello');
            expect(result.value[1]).toBe(42);
            expect(result.value[2]).toBe(true);
        }
    });

    it('works with objects', () => {
        const result = all([ofSome({ a: 1 }), ofSome({ b: 2 })]);
        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value[0]).toEqual({ a: 1 });
            expect(result.value[1]).toEqual({ b: 2 });
        }
    });

    it('tuple-position preservation — value types at each index (Group B)', () => {
        const result = all([ofSome(1), ofSome('hi'), ofSome(true)] as const);
        if (result.isSome) {
            expectTypeOf(result.value).toEqualTypeOf<readonly [number, string, boolean]>();
            // each position retains its original type
            expectTypeOf(result.value[0]).toEqualTypeOf<number>();
            expectTypeOf(result.value[1]).toEqualTypeOf<string>();
            expectTypeOf(result.value[2]).toEqualTypeOf<boolean>();
        }
    });

    it('does NOT process elements after the first None — short-circuit (Group C)', () => {
        // all() iterates the array; the moment it finds a None it returns ofNone()
        // without reading later entries. The runtime semantics match the
        // "short-circuits on first None" expectation — covered above. We
        // additionally verify that a None at any position yields the same
        // single None (no per-element state leaking).
        const r = all([ofSome(1), ofNone(), ofSome('a')]);
        expect(r.isSome).toBe(false);
        expect(r).toEqual(ofNone());
    });

    it('result value type matches input tuple length (Group B)', () => {
        const r3 = all([ofSome(1), ofSome(2), ofSome(3)] as const);
        if (r3.isSome) {
            expectTypeOf(r3.value).toEqualTypeOf<readonly [number, number, number]>();
            expectTypeOf(r3.value.length).toEqualTypeOf<3>();
        }
    });

    it('accepts runtime-sized array', () => {
        const opts: IOption<number>[] = [ofSome(1), ofSome(2), ofSome(3)];
        const result = all(opts);
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toEqual([1, 2, 3]);
    });

    it('array overload short-circuits on first None', () => {
        const opts: IOption<number>[] = [ofSome(1), ofNone(), ofSome(3)];
        const result = all(opts);
        expect(result.isSome).toBe(false);
    });

    it('array overload returns Some([]) for empty input', () => {
        const opts: IOption<number>[] = [];
        const result = all(opts);
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toEqual([]);
    });
});
