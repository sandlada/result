import { describe, it, expect, vi, expectTypeOf } from 'vitest';
import { map, ofSome, ofNone } from './index.js';
import { pipe } from '../composition/index.js';
import type { IOption } from '../../src/types/Option.js';

describe('map', () => {
    it('transforms the value on Some', () => {
        const result = map((x: number) => x * 2)(ofSome(5));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(10);
    });

    it('passes through None unchanged', () => {
        const result = map((x: number) => x * 2)(ofNone());
        expect(result.isSome).toBe(false);
    });

    it('chains multiple maps via pipe', () => {
        const result = pipe(
            ofSome(5),
            map((x: number) => x * 2),
            map((x: number) => x.toString()),
            map((s: string) => s + 'px'),
        );
        if (result.isSome) expect(result.value).toBe('10px');
    });

    it('transforms Some value (FP operator)', () => {
        const result = map((x: number) => x * 2)(ofSome(5));
        if (result.isSome) expect(result.value).toBe(10);
    });

    it('returns None when mapping function throws an error', () => {
        const result = map((x: number) => {
            throw new Error('Mapping error');
        })(ofSome(5));
        expect(result.isSome).toBe(false);
    });

    it('does NOT call fn on None — short-circuit (Group C)', () => {
        const fn = vi.fn((x: number) => x * 2);
        map(fn)(ofNone() as IOption<number>);
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('calls fn exactly once on Some — single invocation (Group C)', () => {
        const fn = vi.fn((x: number) => x * 2);
        map(fn)(ofSome(7));
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('preserves literal input type in result (Group B)', () => {
        const literalOpt = ofSome(21 as 21);
        const result = map((x: number) => x.toString())(literalOpt);
        if (result.isSome) {
            // U is inferred from the callback — string
            expectTypeOf(result.value).toEqualTypeOf<string>();
        }
    });

    it('throws are caught and converted to None (no rethrow) (Group D)', () => {
        const result = map((_x: number) => { throw new Error('caught'); })(ofSome(1));
        expect(result.isNone).toBe(true);
    });

    it('curried form returns the same function reference semantics for each call', () => {
        const fn = map((x: number) => x * 2);
        const r1 = fn(ofSome(1));
        const r2 = fn(ofSome(2));
        expect(r1).not.toBe(r2);
        if (r1.isSome) expect(r1.value).toBe(2);
        if (r2.isSome) expect(r2.value).toBe(4);
    });
});
