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
});
