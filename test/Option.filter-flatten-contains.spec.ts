import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../src/option/index.js';
import type { IOption } from '../src/types/Option.js';

// FP option operators
import { filter, flatten, contains } from '../src/option/index.js';

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
});

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
});

describe('Option — contains', () => {
    it('Some with matching value returns true', () => {
        expect(contains(42)(ofSome(42))).toBe(true);
    });

    it('Some with non-matching value returns false', () => {
        expect(contains(99)(ofSome(42))).toBe(false);
    });

    it('None returns false', () => {
        expect(contains(42)(ofNone() as IOption<number>)).toBe(false);
    });

    it('curried form', () => {
        const isFortyTwo = contains(42);
        expect(isFortyTwo(ofSome(42))).toBe(true);
        expect(isFortyTwo(ofSome(7))).toBe(false);
        expect(isFortyTwo(ofNone() as IOption<number>)).toBe(false);
    });
});

