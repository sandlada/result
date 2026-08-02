import { describe, it, expectTypeOf } from 'vitest';
import { orElseAsyncOption } from './orElseAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('orElseAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<IOption<T>>', () => {
        const fn = orElseAsyncOption<number>(() => Promise.resolve(ofSome(0)));
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<T>>', () => {
        const r = orElseAsyncOption<number>(
            () => Promise.resolve(ofSome(0)),
            Promise.resolve(ofNone()),
        );
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('fn may return IOption<T> synchronously', () => {
        const fn = orElseAsyncOption<string>(() => ofSome('default'));
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T across the recovery path', () => {
        const fn = orElseAsyncOption<string>(() => Promise.resolve(ofSome('default')));
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
