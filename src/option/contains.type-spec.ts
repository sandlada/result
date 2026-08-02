import { describe, it, expectTypeOf } from 'vitest';
import { contains } from './contains.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

describe('contains types', () => {
    it('returns a function from IOption<T> to boolean', () => {
        const fn = contains(42);
        const _check: (opt: IOption<number>) => boolean = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T from target argument', () => {
        const fn = contains('hi');
        const _check: (opt: IOption<string>) => boolean = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('returns boolean on Some source', () => {
        const r = contains(42)(ofSome(42));
        expectTypeOf(r).toEqualTypeOf<boolean>();
    });

    it('returns boolean on None source', () => {
        const r = contains(42)(ofNone());
        expectTypeOf(r).toEqualTypeOf<boolean>();
    });
});
