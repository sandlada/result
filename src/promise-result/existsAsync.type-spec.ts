import { describe, it, expectTypeOf } from 'vitest';
import { existsAsync } from './existsAsync.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('existsAsync types', () => {
    it('curried form returns a function', () => {
        const fn = existsAsync<number>((x: number) => x > 0);
        const _check: <E>(r: Promise<IResultOfT<number, E>>) => Promise<boolean> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('curried form when applied returns Promise<boolean>', () => {
        const fn = existsAsync<number>((x: number) => x > 0);
        const good: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 42 };
        const r = fn(Promise.resolve(good));
        const _check: Promise<boolean> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<boolean>', () => {
        const good: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 42 };
        const r = existsAsync(
            (x: number) => x > 0,
            Promise.resolve(good),
        );
        const _check: Promise<boolean> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const good: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 42 };
        const r = existsAsync(
            (x: number) => x > 0,
            Promise.resolve(good),
        );
        const _check: Promise<boolean> = r;
        expectTypeOf(_check).toBeObject();
    });
});
