import { describe, it, expectTypeOf } from 'vitest';
import { existsAsyncOption } from './existsAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('existsAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<boolean>', () => {
        const fn = existsAsyncOption((x: number) => x > 0);
        const _check: (r: Promise<IOption<number>>) => Promise<boolean> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<boolean>', () => {
        const p = existsAsyncOption((x: number) => x > 0, Promise.resolve(ofSome(42)));
        const _check: Promise<boolean> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('predicate may return Promise<boolean>', () => {
        const fn = existsAsyncOption(async (x: number) => x > 0);
        const _check: (r: Promise<IOption<number>>) => Promise<boolean> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input', () => {
        const noneOpt: IOption<number> = ofNone();
        const p = existsAsyncOption((x: number) => x > 0, Promise.resolve(noneOpt));
        const _check: Promise<boolean> = p;
        expectTypeOf(_check).toBeObject();
    });
});
