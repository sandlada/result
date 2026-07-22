import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/index.js';
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
});
