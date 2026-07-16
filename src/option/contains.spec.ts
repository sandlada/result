import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/index.js';
import type { IOption } from '../../src/types/Option.js';
import { contains } from '../../src/option/index.js';

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
