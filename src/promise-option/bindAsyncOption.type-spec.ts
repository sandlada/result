import { describe, it, expectTypeOf } from 'vitest';
import { bindAsyncOption } from './bindAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('bindAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<IOption<U>>', () => {
        const fn = bindAsyncOption((x: number) => Promise.resolve(ofSome(x * 2)));
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<U>>', () => {
        const r = bindAsyncOption(
            (x: number) => Promise.resolve(ofSome(x * 2)),
            Promise.resolve(ofSome(21)),
        );
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('fn may return IOption<U> synchronously', () => {
        const fn = bindAsyncOption((s: string) => ofSome(s.length));
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves U from the wrapped function', () => {
        const fn = bindAsyncOption((s: string) => Promise.resolve(ofSome(s.length)));
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
