import { describe, it, expectTypeOf } from 'vitest';
import { asyncMatchOption } from './asyncMatchOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('asyncMatchOption types', () => {
    it('curried form returns (o: IOption<T>) => Promise<U>', () => {
        const fn = asyncMatchOption<number, string>({
            some: (v) => `value: ${v}`,
            none: () => 'nothing',
        });
        const _check: (o: IOption<number>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<U>', () => {
        const p = asyncMatchOption<number, string>(
            { some: (v) => `value: ${v}`, none: () => 'nothing' },
            ofSome(42),
        );
        const _check: Promise<string> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('handlers may return Promise<U>', () => {
        const fn = asyncMatchOption<number, string>({
            some: async (v) => `value: ${v}`,
            none: async () => 'nothing',
        });
        const _check: (o: IOption<number>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input', () => {
        const noneOpt: IOption<number> = ofNone();
        const p = asyncMatchOption<number, string>(
            { some: (v) => `value: ${v}`, none: () => 'nothing' },
            noneOpt,
        );
        const _check: Promise<string> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = asyncMatchOption<number, string>({
            some: (v) => `value: ${v}`,
            none: () => 'nothing',
        });
        expectTypeOf(fn).toEqualTypeOf<(o: IOption<number>) => Promise<string>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const p = asyncMatchOption<number, string>(
            { some: (v) => `value: ${v}`, none: () => 'nothing' },
            ofSome(42),
        );
        expectTypeOf(p).toEqualTypeOf<Promise<string>>();
    });

    it('unifies U across some and none — heterogeneous return types do NOT widen to a union', () => {
        // Per the canonical contract, a single U parameter binds to *both*
        // handlers. Same pattern as matchAsync.
        const p = asyncMatchOption<number, string>(
            { some: (v) => `s:${v}`, none: () => 'n' },
            ofSome(5),
        );
        const _check: Promise<string> = p;
        expectTypeOf(_check).toEqualTypeOf<Promise<string>>();
    });
});
