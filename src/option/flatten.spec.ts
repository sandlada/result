import { describe, it, expect, expectTypeOf } from 'vitest';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../../src/types/Option.js';
import { flatten } from '../../src/option/index.js';

describe('Option — flatten', () => {
    it('Some(Some(value)) -> Some(value)', () => {
        const inner: IOption<number> = ofSome(42);
        const outer: IOption<IOption<number>> = ofSome(inner);
        const result = flatten(outer);
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(42);
    });

    it('Some(None) -> None', () => {
        const inner: IOption<number> = ofNone();
        const outer: IOption<IOption<number>> = ofSome(inner);
        const result = flatten(outer);
        expect(result.isSome).toBe(false);
    });

    it('None -> None', () => {
        const outer: IOption<IOption<number>> = ofNone();
        const result = flatten(outer);
        expect(result.isSome).toBe(false);
    });

    it('direct form', () => {
        const inner: IOption<string> = ofSome('hi');
        const outer: IOption<IOption<string>> = ofSome(inner);
        const result = flatten(outer);
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe('hi');
    });

    it('one-layer invariant — deeper nesting still has Options at depth 1 (Group B)', () => {
        const inner: IOption<number> = ofSome(42);
        const middle: IOption<IOption<number>> = ofSome(inner);
        // outer is IOption<IOption<IOption<number>>> — three layers
        const outer: IOption<IOption<IOption<number>>> = ofSome(middle);
        const flat1 = flatten(outer);
        // Only one layer removed: still an Option<IOption<number>>
        if (flat1.isSome) {
            expectTypeOf(flat1.value).toEqualTypeOf<IOption<number>>();
            // The inner value is still an Option, not a number
            expect(flat1.value.isSome).toBe(true);
            if (flat1.value.isSome) {
                expectTypeOf(flat1.value.value).toEqualTypeOf<number>();
            }
        }
    });

    it('flattens Some(Some(Some(None))) -> Some(None) at runtime', () => {
        const inner: IOption<number> = ofNone();
        const middle: IOption<IOption<number>> = ofSome(inner);
        const outer: IOption<IOption<IOption<number>>> = ofSome(middle);
        const flat1 = flatten(outer);
        // one-layer flatten: should be Some(None)
        expect(flat1.isSome).toBe(true);
        if (flat1.isSome) expect(flat1.value.isSome).toBe(false);
    });

    it('preserves the inner value reference for non-empty case (tee behavior on Some/Some)', () => {
        const inner: IOption<number> = ofSome(42);
        const outer: IOption<IOption<number>> = ofSome(inner);
        const result = flatten(outer);
        if (result.isSome) {
            // flatten just unwraps the outer and returns the inner as-is
            expect(result.value).toBe(42);
        }
    });
});
