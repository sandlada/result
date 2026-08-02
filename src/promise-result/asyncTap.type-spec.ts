import { describe, it, expectTypeOf } from 'vitest';
import { asyncTap } from './asyncTap.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncTap types', () => {
    it('curried form returns a function', () => {
        const fn: <A, E>(r: IResultOfT<A, E>) => Promise<IResultOfT<A, E>> = asyncTap(<A>(x: A) => Promise.resolve(String(x)));
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<A, E>>', () => {
        const fn = asyncTap<number, string>((x: number) => Promise.resolve(x.toString()));
        const r = fn(ok<number>(42) as IResultOfT<number, string>);
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<A, E>>', () => {
        const r = asyncTap<number, string>((x: number) => Promise.resolve(x.toString()), ok<number>(21) as IResultOfT<number, string>);
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = asyncTap<number, string>((x: number) => Promise.resolve(x.toString()), ok<number>(42) as IResultOfT<number, string>);
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
