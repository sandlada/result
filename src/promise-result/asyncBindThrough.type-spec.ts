import { describe, it, expectTypeOf } from 'vitest';
import { asyncBindThrough } from './asyncBindThrough.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncBindThrough types', () => {
    it('curried form returns a function', () => {
        const fn = asyncBindThrough((x: number) => Promise.resolve(ok(undefined)));
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<A, E | F>>', () => {
        const fn = asyncBindThrough((x: number) => Promise.resolve(ok(undefined)));
        const source: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 21 };
        const r = fn(source);
        const _check: Promise<IResultOfT<number, string | never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<A, E | F>>', () => {
        const source: IResultOfT<number, unknown> = { isSuccess: true, isFailure: false, value: 21 };
        const fallback: IResultOfT<void, string> = { isSuccess: true, isFailure: false, value: undefined };
        const r = asyncBindThrough(
            async (x: number) => fallback,
            source,
        );
        const _check: Promise<IResultOfT<number, unknown | string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E|F from input on direct form', () => {
        const source: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 21 };
        const fallback: IResultOfT<void, string> = { isSuccess: true, isFailure: false, value: undefined };
        const r = asyncBindThrough(
            async (x: number) => fallback,
            source,
        );
        const _check: Promise<IResultOfT<number, string | string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
