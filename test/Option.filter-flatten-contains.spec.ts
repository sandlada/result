import { describe, it, expect } from 'vitest';
import { Option } from '../src/Option.js';
import type { IOption } from '../src/Option.js';

// FP option operators
import { filter, flatten, contains } from '../src/fp/option/operators.js';

describe('Option — filter', () => {
    it('OOP: Some with passing predicate returns Some', () => {
        const opt = Option.Some(5);
        const result = opt.filter(n => n > 0);
        expect(result.isSome).toBe(true);
        expect(result.value).toBe(5);
    });

    it('OOP: Some with failing predicate returns None', () => {
        const opt = Option.Some(-1);
        const result = opt.filter(n => n > 0);
        expect(result.isSome).toBe(false);
    });

    it('OOP: None stays None', () => {
        const opt = Option.None();
        const result = opt.filter((n: number) => n > 0);
        expect(result.isSome).toBe(false);
    });

    it('FP: curried form', () => {
        const positive = filter((n: number) => n > 0);
        expect(positive(Option.Some(5)).isSome).toBe(true);
        expect(positive(Option.Some(-1)).isSome).toBe(false);
        expect(positive(Option.None()).isSome).toBe(false);
    });
});

describe('Option — flatten', () => {
    it('OOP: Some(Some(value)) → Some(value)', () => {
        const inner: IOption<number> = Option.Some(42);
        const outer: IOption<IOption<number>> = Option.Some(inner);
        expect(outer.flatten().isSome).toBe(true);
        expect(outer.flatten().unwrapOr(0)).toBe(42);
    });

    it('OOP: Some(None) → None', () => {
        const inner: IOption<number> = Option.None();
        const outer: IOption<IOption<number>> = Option.Some(inner);
        expect(outer.flatten().isSome).toBe(false);
    });

    it('OOP: None → None', () => {
        const outer: IOption<IOption<number>> = Option.None();
        expect(outer.flatten().isSome).toBe(false);
    });

    it('FP: direct form', () => {
        const inner: IOption<string> = Option.Some('hi');
        const outer: IOption<IOption<string>> = Option.Some(inner);
        expect(flatten(outer).unwrapOr('')).toBe('hi');
    });
});

describe('Option — contains', () => {
    it('OOP: Some with matching value returns true', () => {
        expect(Option.Some(42).contains(42)).toBe(true);
    });

    it('OOP: Some with non-matching value returns false', () => {
        expect(Option.Some(42).contains(99)).toBe(false);
    });

    it('OOP: None returns false', () => {
        expect(Option.None().contains(42)).toBe(false);
    });

    it('FP: curried form', () => {
        const isFortyTwo = contains(42);
        expect(isFortyTwo(Option.Some(42))).toBe(true);
        expect(isFortyTwo(Option.Some(7))).toBe(false);
        expect(isFortyTwo(Option.None())).toBe(false);
    });
});
