import { describe, it, expectTypeOf } from 'vitest';
import { asyncOrElse } from './asyncOrElse.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncOrElse types', () => {
    it('curried form returns a function', () => {
        const fn: (r: IResultOfT<number, string>) => Promise<IResultOfT<number, string>> = asyncOrElse<number, string, string>(
            (e: string) => Promise.resolve(ok<number>(0) as IResultOfT<number, string>),
        );
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<T, E | F>>', () => {
        const fn = asyncOrElse<string, number, string>(
            (e: number) => Promise.resolve(ok<string>('default') as IResultOfT<string, string>),
        );
        const r = fn(err<string>('boom') as unknown as IResultOfT<string, number>);
        const _check: Promise<IResultOfT<string, number | string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<T, E | F>>', () => {
        const r = asyncOrElse<number, string, number>(
            (e: string) => Promise.resolve(ok<number>(0) as IResultOfT<number, number>),
            ok<number>(42) as IResultOfT<number, string>,
        );
        const _check: Promise<IResultOfT<number, string | number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = asyncOrElse<number, string, boolean>(
            (e: string) => Promise.resolve(ok<number>(0) as IResultOfT<number, boolean>),
            err<string>('boom') as unknown as IResultOfT<number, string>,
        );
        const _check: Promise<IResultOfT<number, string | boolean>> = r;
        expectTypeOf(_check).toBeObject();
    });
});

