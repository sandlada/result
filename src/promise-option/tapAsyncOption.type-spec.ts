import { describe, it, expectTypeOf } from 'vitest';
import { tapAsyncOption } from './tapAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('tapAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<IOption<T>>', () => {
        const fn = tapAsyncOption((x: number) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<T>>', () => {
        const r = tapAsyncOption((v: number) => { /* side effect */ }, Promise.resolve(ofSome(42)));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('callback may return Promise<void>', () => {
        const fn = tapAsyncOption(async (x: number) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T unchanged on the success track', () => {
        const fn = tapAsyncOption((s: string) => { /* side effect */ });
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
