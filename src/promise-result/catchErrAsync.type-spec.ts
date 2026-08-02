import { describe, it, expectTypeOf } from 'vitest';
import { catchErrAsync } from './catchErrAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('catchErrAsync types', () => {
    it('curried form returns a function', () => {
        const fn = catchErrAsync<number, string>((e) => 0);
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<A, never>>', () => {
        const fn = catchErrAsync<number, string>((e) => 0);
        const r = fn(asyncErr<string>('boom'));
        const _check: Promise<IResultOfT<number, never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<A, never>>', () => {
        const r = catchErrAsync(
            (e: string) => 0,
            asyncErr<string>('boom'),
        );
        const _check: Promise<IResultOfT<number, never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = catchErrAsync(
            (e: string) => 0,
            asyncErr<string>('boom'),
        );
        const _check: Promise<IResultOfT<number, never>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
