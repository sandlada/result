import { describe, it, expect, vi, expectTypeOf } from 'vitest';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../../src/types/Option.js';
import { zipWith } from '../../src/option/index.js';

describe('Option — zipWith', () => {
    it('both Some returns Some(fn(a, b))', () => {
        const zipped = zipWith((a: number, b: string) => `${a}-${b}`);
        const result = zipped(ofSome(1), ofSome('a'));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe('1-a');
    });

    it('first None returns None', () => {
        const zipped = zipWith((a: number, b: string) => `${a}-${b}`);
        const result = zipped(ofNone() as IOption<number>, ofSome('a'));
        expect(result.isSome).toBe(false);
    });

    it('second None returns None', () => {
        const zipped = zipWith((a: number, b: string) => `${a}-${b}`);
        const result = zipped(ofSome(1), ofNone() as IOption<string>);
        expect(result.isSome).toBe(false);
    });

    it('both None returns None', () => {
        const zipped = zipWith((a: number, b: string) => `${a}-${b}`);
        const result = zipped(ofNone() as IOption<number>, ofNone() as IOption<string>);
        expect(result.isSome).toBe(false);
    });

    it('works with numeric operation', () => {
        const zipped = zipWith((a: number, b: number) => a + b);
        const result = zipped(ofSome(3), ofSome(4));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(7);
    });

    it('works with objects', () => {
        const zipped = zipWith((a: { x: number }, b: { y: number }) => ({ x: a.x, y: b.y }));
        const result = zipped(ofSome({ x: 1 }), ofSome({ y: 2 }));
        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toEqual({ x: 1, y: 2 });
        }
    });

    it('can be partially applied with fn only', () => {
        const combine = zipWith((a: number, b: number) => a * b);
        const result = combine(ofSome(5), ofSome(6));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(30);
    });

    it('returns None if the zip function throws', () => {
        const zipped = zipWith((a: number, b: number) => {
            throw new Error('Test error');
        });
        const result = zipped(ofSome(1), ofSome(2));
        expect(result.isSome).toBe(false);
    });

    it('does NOT call fn when first is None — short-circuit (Group C)', () => {
        const fn = vi.fn((a: number, b: number) => a + b);
        zipWith(fn)(ofNone() as IOption<number>, ofSome(1));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('does NOT call fn when second is None — short-circuit (Group C)', () => {
        const fn = vi.fn((a: number, b: number) => a + b);
        zipWith(fn)(ofSome(1), ofNone() as IOption<number>);
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('does NOT call fn when both are None — short-circuit (Group C)', () => {
        const fn = vi.fn((a: number, b: number) => a + b);
        zipWith(fn)(ofNone() as IOption<number>, ofNone() as IOption<number>);
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('calls fn exactly once when both are Some — single invocation (Group C)', () => {
        const fn = vi.fn((a: number, b: number) => a + b);
        zipWith(fn)(ofSome(1), ofSome(2));
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('value type is the callback return type (Group B)', () => {
        const zipped = zipWith((a: number, b: number) => ({ sum: a + b }));
        const result = zipped(ofSome(1), ofSome(2));
        if (result.isSome) {
            expectTypeOf(result.value).toEqualTypeOf<{ sum: number }>();
        }
    });
});

describe('Option — zipWith (variadic arity > 2)', () => {
    it('arity 3: all Some returns Some(fn(a, b, c))', () => {
        const z = zipWith((a: number, b: number, c: number) => a + b + c);
        const r = z(ofSome(1), ofSome(2), ofSome(3));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(6);
    });

    it('arity 3: any None short-circuits to None', () => {
        const z = zipWith((a: number, b: number, c: number) => a + b + c);
        expect(z(ofSome(1), ofNone() as IOption<number>, ofSome(3)).isNone).toBe(true);
    });

    it('arity 5: all Some returns Some(fn(a..e))', () => {
        const z = zipWith(
            (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e,
        );
        const r = z(ofSome(1), ofSome(2), ofSome(3), ofSome(4), ofSome(5));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(15);
    });

    it('arity 5: any None short-circuits to None', () => {
        const z = zipWith(
            (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e,
        );
        expect(z(ofSome(1), ofSome(2), ofSome(3), ofSome(4), ofNone() as IOption<number>).isNone).toBe(true);
    });

    it('arity 7: heterogeneous types preserved across the tuple', () => {
        const z = zipWith(
            (a: number, b: string, c: boolean, d: number, e: string, f: boolean, g: number) =>
                `${a}-${b}-${c}-${d}-${e}-${f}-${g}`,
        );
        const r = z(ofSome(1), ofSome('a'), ofSome(true), ofSome(2), ofSome('b'), ofSome(false), ofSome(3));
        expect(r.isSome).toBe(true);
        if (r.isSome) {
            expect(r.value).toBe('1-a-true-2-b-false-3');
            expectTypeOf(r.value).toEqualTypeOf<string>();
        }
    });

    it('arity 7: any None short-circuits to None', () => {
        const z = zipWith(
            (a: number, b: number, c: number, d: number, e: number, f: number, g: number) =>
                a + b + c + d + e + f + g,
        );
        expect(
            z(ofSome(1), ofSome(2), ofSome(3), ofSome(4), ofSome(5), ofSome(6), ofNone() as IOption<number>).isNone,
        ).toBe(true);
    });

    it('arity > 10 falls through to the catch-all variadic', () => {
        const z = zipWith(
            (a: number, b: number, c: number, d: number, e: number,
             f: number, g: number, h: number, i: number, j: number,
             k: number, l: number) =>
                a + b + c + d + e + f + g + h + i + j + k + l,
        );
        const r = z(
            ofSome(1), ofSome(2), ofSome(3), ofSome(4), ofSome(5), ofSome(6),
            ofSome(7), ofSome(8), ofSome(9), ofSome(10), ofSome(11), ofSome(12),
        );
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(78);
    });

    it('curried form works for arity 5', () => {
        const z = zipWith(
            (a: number, b: number, c: number, d: number, e: number) => a * b * c * d * e,
        );
        const r = z(ofSome(1), ofSome(2), ofSome(3), ofSome(4), ofSome(5));
        if (r.isSome) expect(r.value).toBe(120);
    });

    it('does not call fn when any operand is None at arity 5', () => {
        const fn = vi.fn(
            (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e,
        );
        zipWith(fn)(ofSome(1), ofSome(2), ofNone() as IOption<number>, ofSome(4), ofSome(5));
        expect(fn).toHaveBeenCalledTimes(0);
    });
});
