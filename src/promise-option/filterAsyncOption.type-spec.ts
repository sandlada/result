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
});
