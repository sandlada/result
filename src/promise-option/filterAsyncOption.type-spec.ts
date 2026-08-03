import { describe, it, expectTypeOf } from 'vitest';
import { filterAsyncOption } from './filterAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('filterAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<IOption<T>>', () => {
        const fn = filterAsyncOption((x: number) => x > 0);
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<T>>', () => {
        const r = filterAsyncOption((x: number) => x > 0, Promise.resolve(ofSome(42)));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('predicate may return Promise<boolean>', () => {
        const fn = filterAsyncOption(async (x: number) => x > 0);
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input as pass-through', () => {
        const noneOpt: IOption<number> = ofNone();
        const r = filterAsyncOption((x: number) => x > 0, Promise.resolve(noneOpt));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = filterAsyncOption((x: number) => x > 0);
        expectTypeOf(fn).toEqualTypeOf<(r: Promise<IOption<number>>) => Promise<IOption<number>>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const r = filterAsyncOption((x: number) => x > 0, Promise.resolve(ofSome(42)));
        expectTypeOf(r).toEqualTypeOf<Promise<IOption<number>>>();
    });

    it('preserves T unchanged across both branches (no widening on filter)', () => {
        // T goes in and T comes out — filterAsyncOption cannot widen the
        // value type even when the predicate returns a different type.
        const fn = filterAsyncOption((s: string) => s.length > 0);
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
