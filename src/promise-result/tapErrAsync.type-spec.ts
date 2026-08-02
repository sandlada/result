import { describe, it, expectTypeOf } from 'vitest';
import { tapErrAsync } from './tapErrAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('tapErrAsync types', () => {
    it('curried form returns a function', () => {
        const fn = tapErrAsync((e: string) => undefined);
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<A, E>>', () => {
        const fn = tapErrAsync((e: string) => undefined);
        const r = fn(asyncErr<string>('boom'));
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<A, E>>', () => {
        const r = tapErrAsync(
            (e: string) => undefined,
            asyncErr<string>('boom'),
        );
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = tapErrAsync<number, string>(
            (e) => undefined,
            asyncErr<string>('boom'),
        );
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
