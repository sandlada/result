import { describe, it, expectTypeOf } from 'vitest';
import { orElseAsync } from './orElseAsync.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('orElseAsync types', () => {
    it('curried form returns a function', () => {
        const fallback: IResultOfT<string, never> = { isSuccess: true, isFailure: false, value: 'default' };
        const fn = orElseAsync<string, string, never>(
            (e: string) => fallback,
        );
        const _check: (r: Promise<IResultOfT<number, string>>) => Promise<IResultOfT<number | string, never>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<A | B, F>>', () => {
        const fallback: IResultOfT<string, never> = { isSuccess: true, isFailure: false, value: 'default' };
        const fn = orElseAsync<string, string, never>(
            (e: string) => fallback,
        );
        const bad: IResultOfT<number, string> = { isSuccess: false, isFailure: true, error: 'boom' };
        const r = fn(Promise.resolve(bad));
        const _check: Promise<IResultOfT<number | string, never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<A | B, F>>', () => {
        const fallback: IResultOfT<string, never> = { isSuccess: true, isFailure: false, value: 'default' };
        const bad: IResultOfT<number, string> = { isSuccess: false, isFailure: true, error: 'boom' };
        const r = orElseAsync<string, string, never>(
            (e: string) => Promise.resolve(fallback),
            Promise.resolve(bad),
        );
        const _check: Promise<IResultOfT<number | string, never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form — wider success type', () => {
        const fallback: IResultOfT<boolean, string> = { isSuccess: true, isFailure: false, value: true };
        const bad: IResultOfT<number, string> = { isSuccess: false, isFailure: true, error: 'boom' };
        const r = orElseAsync<number, string, string>(
            (e: string) => Promise.resolve(fallback),
            Promise.resolve(bad),
        );
        const _check: Promise<IResultOfT<number | boolean, string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
