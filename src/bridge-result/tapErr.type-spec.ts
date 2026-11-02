import { describe, it, expectTypeOf } from 'vitest';
import { tapErr } from './tapErr.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('tapErr types', () => {
    it('curried form returns a function', () => {
        const fn: <A, E>(r: IResultOfT<A, E>) => Promise<IResultOfT<A, E>> = tapErr(<E>(e: E) => Promise.resolve(String(e)));
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<A, E>>', () => {
        const fn = tapErr<never, string>((e: string) => Promise.resolve(e.toUpperCase()));
        const r = fn(err<string>('boom') as IResultOfT<never, string>);
        const _check: Promise<IResultOfT<never, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<A, E>>', () => {
        const r = tapErr<number, string>((e: string) => Promise.resolve(e.toUpperCase()), err<string>('boom') as IResultOfT<number, string>);
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = tapErr<number, string>(
            (e: string) => Promise.resolve(e.toUpperCase()),
            err<string>('boom') as IResultOfT<number, string>,
        );
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
