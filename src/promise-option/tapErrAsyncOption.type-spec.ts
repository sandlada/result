import { describe, it, expectTypeOf } from 'vitest';
import { tapErrAsyncOption } from './tapErrAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('tapErrAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<IOption<T>>', () => {
        const fn = tapErrAsyncOption((v: number | undefined) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<T>>', () => {
        const noneOpt: IOption<number> = ofNone();
        const r = tapErrAsyncOption((v: number | undefined) => { /* side effect */ }, Promise.resolve(noneOpt));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('callback may return Promise<void>', () => {
        const fn = tapErrAsyncOption(async (v: number | undefined) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T unchanged across the side-effect', () => {
        const fn = tapErrAsyncOption((v: string | undefined) => { /* side effect */ });
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofSome input as pass-through', () => {
        const r = tapErrAsyncOption((v: number | undefined) => { /* side effect */ }, Promise.resolve(ofSome(42)));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
