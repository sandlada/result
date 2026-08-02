import { describe, it, expectTypeOf } from 'vitest';
import { mapOrAsync } from './mapOrAsync.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('mapOrAsync types', () => {
    it('curried form returns a function', () => {
        const fn = mapOrAsync<number, string, string>(-1, (x: number) => `${x}`);
        const _check: (r: Promise<IResultOfT<number, string>>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('curried form when applied returns Promise<B>', () => {
        const fn = mapOrAsync<number, string, string>('fallback', (x: number) => `${x}`);
        const good: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 42 };
        const r = fn(Promise.resolve(good));
        const _check: Promise<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<B>', () => {
        const good: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 5 };
        const r = mapOrAsync<number, number, string>(
            -1,
            (x: number) => x * 2,
            Promise.resolve(good),
        );
        const _check: Promise<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const good: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 42 };
        const r = mapOrAsync<number, string, string>(
            'fallback',
            (x: number) => `${x}`,
            Promise.resolve(good),
        );
        const _check: Promise<string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
