import { describe, it, expectTypeOf } from 'vitest';
import { mapOrElseAsync } from './mapOrElseAsync.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('mapOrElseAsync types', () => {
    it('curried form returns a function', () => {
        const fn = mapOrElseAsync<number, string, string>(
            (e: string) => 'err',
            (x: number) => `${x}`,
        );
        const _check: (r: Promise<IResultOfT<number, string>>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('curried form when applied returns Promise<B>', () => {
        const fn = mapOrElseAsync<number, string, string>(
            (e: string) => '0',
            (x: number) => `${x}`,
        );
        const good: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 42 };
        const r = fn(Promise.resolve(good));
        const _check: Promise<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<B>', () => {
        const good: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 5 };
        const r = mapOrElseAsync<number, string, number>(
            (e: string) => -1,
            (x: number) => x * 2,
            Promise.resolve(good),
        );
        const _check: Promise<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const good: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 42 };
        const r = mapOrElseAsync<number, string, number>(
            (e: string) => 0,
            (x: number) => x,
            Promise.resolve(good),
        );
        const _check: Promise<number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
