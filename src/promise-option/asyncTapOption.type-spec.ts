import { describe, it, expectTypeOf } from 'vitest';
import { asyncTapOption } from './asyncTapOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('asyncTapOption types', () => {
    it('curried form returns (opt: IOption<T>) => Promise<IOption<T>>', () => {
        const fn = asyncTapOption(async (x: number) => { /* side effect */ });
        const _check: (opt: IOption<number>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<T>>', () => {
        const r = asyncTapOption(async (x: number) => { /* side effect */ }, ofSome(42));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T unchanged on the success track', () => {
        const fn = asyncTapOption(async (s: string) => { /* side effect */ });
        const _check: (opt: IOption<string>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input as pass-through', () => {
        const noneOpt: IOption<number> = ofNone();
        const r = asyncTapOption(async (x: number) => { /* side effect */ }, noneOpt);
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = asyncTapOption(async (x: number) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(opt: IOption<number>) => Promise<IOption<number>>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const r = asyncTapOption(async (x: number) => { /* side effect */ }, ofSome(42));
        expectTypeOf(r).toEqualTypeOf<Promise<IOption<number>>>();
    });

    it('preserves T in the input carrier (no widening on the carrier)', () => {
        // asyncTapOption takes T in and gives T back — side-effects cannot
        // leak into T even if the callback returns a different type.
        const fn = asyncTapOption(async (s: string) => { /* side effect */ void s; });
        const _check: (opt: IOption<string>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toEqualTypeOf<(opt: IOption<string>) => Promise<IOption<string>>>();
    });
});
