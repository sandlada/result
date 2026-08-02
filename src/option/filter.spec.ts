import { describe, it, expect, vi, expectTypeOf } from 'vitest';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../../src/types/Option.js';
import { filter } from '../../src/option/index.js';

describe('Option — filter', () => {
    it('Some with passing predicate returns Some', () => {
        const predicate = (n: number) => n > 0;
        const result = filter(predicate)(ofSome(5));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(5);
    });

    it('Some with failing predicate returns None', () => {
        const predicate = (n: number) => n > 0;
        const result = filter(predicate)(ofSome(-1));
        expect(result.isSome).toBe(false);
    });

    it('None stays None', () => {
        const predicate = (n: number) => n > 0;
        const result = filter(predicate)(ofNone() as IOption<number>);
        expect(result.isSome).toBe(false);
    });

    it('curried form', () => {
        const positive = filter((n: number) => n > 0);
        expect(positive(ofSome(5)).isSome).toBe(true);
        expect(positive(ofSome(-1)).isSome).toBe(false);
        expect(positive(ofNone() as IOption<number>).isSome).toBe(false);
    });

    it('catches predicate throw and converts to None', () => {
        const predicate = (() => { throw new Error('pred-boom'); }) as (n: number) => boolean;
        const result = filter(predicate)(ofSome(5));
        expect(result.isNone).toBe(true);
    });

    it('does NOT call predicate on None — short-circuit (Group C)', () => {
        const pred = vi.fn((n: number) => n > 0);
        filter(pred)(ofNone() as IOption<number>);
        expect(pred).toHaveBeenCalledTimes(0);
    });

    it('calls predicate exactly once on Some — single invocation (Group C)', () => {
        const pred = vi.fn((n: number) => n > 0);
        filter(pred)(ofSome(5));
        expect(pred).toHaveBeenCalledTimes(1);
    });

    it('returns the original Some reference when predicate passes (tee policy)', () => {
        const sentinel = { id: 'x' };
        const opt = ofSome(sentinel);
        const result = filter((_o: { id: string }) => true)(opt);
        if (result.isSome) expect(result.value).toBe(sentinel);
    });

    it('T is preserved through filter — does not widen (Group B)', () => {
        const opt = ofSome('hello' as 'hello');
        const result = filter((s: 'hello') => s.length > 0)(opt);
        if (result.isSome) expectTypeOf(result.value).toEqualTypeOf<'hello'>();
    });
});
