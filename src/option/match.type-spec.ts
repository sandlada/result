import { describe, it, expectTypeOf } from 'vitest';
import { match } from './match.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

describe('match types', () => {
    it('positional curried form returns (opt: IOption<T>) => U', () => {
        const fn = match(
            (v: number) => `value: ${v}`,
            () => 'nothing',
        );
        const _check: (opt: IOption<number>) => string = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('positional direct form returns U', () => {
        const r = match(
            (v: number) => `value: ${v}`,
            () => 'nothing',
            ofSome(42),
        );
        expectTypeOf(r).toEqualTypeOf<string>();
    });

    it('object-handler curried form returns (opt: IOption<T>) => U', () => {
        const fn = match({
            some: (v: number) => `value: ${v}`,
            none: () => 'nothing',
        });
        const _check: (opt: IOption<number>) => string = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('object-handler direct form returns U', () => {
        const r = match(
            { some: (v: number) => `value: ${v}`, none: () => 'nothing' },
            ofSome(42),
        );
        expectTypeOf(r).toEqualTypeOf<string>();
    });

    it('returns U from handlers', () => {
        const r = match(
            (v: number) => v * 2,
            () => 0,
            ofSome(21),
        );
        expectTypeOf(r).toEqualTypeOf<number>();
    });

    it('handler return types are unified to the broader type (Group B)', () => {
        const r = match(
            (_v: number): 1 | 2 => 1,
            (): 1 | 2 => 2,
            ofSome(42),
        );
        expectTypeOf(r).toEqualTypeOf<1 | 2>();
    });

    it('object form preserves the same union of return types (Group B)', () => {
        const r = match(
            { some: (_v: number): 1 | 2 => 1, none: (): 1 | 2 => 2 },
            ofNone(),
        );
        expectTypeOf(r).toEqualTypeOf<1 | 2>();
    });

    it('no-r variant — positional curried with only onSome/onNone (Group A)', () => {
        const fn = match(
            (v: number) => `value: ${v}`,
            () => 'nothing',
        );
        // Calling without opt at construction time returns a function
        const _check: (opt: IOption<number>) => string = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('no-r variant — object curried with only handlers (Group A)', () => {
        const fn = match({
            some: (v: number) => `value: ${v}`,
            none: () => 'nothing',
        });
        const _check: (opt: IOption<number>) => string = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
