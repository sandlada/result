import { describe, it, expectTypeOf } from 'vitest';
import { mapErrAsync } from './mapErrAsync.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('mapErrAsync types', () => {
    it('curried form returns a function', () => {
        // The curried overload is `<E, F>` (two parameters); the direct one is
        // `<A, E, F>`. Supplying three type arguments selects the direct
        // overload, which then demands a second value argument.
        const fn = mapErrAsync<string, number>((e: string) => Promise.resolve(e.length));
        const _check: (r: Promise<IResultOfT<number, string>>) => Promise<IResultOfT<number, number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<A, F>>', () => {
        const fn = mapErrAsync<string, number>((e: string) => Promise.resolve(e.length));
        const good: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 42 };
        const r = fn(Promise.resolve(good));
        const _check: Promise<IResultOfT<number, number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<A, F>>', () => {
        const bad: IResultOfT<number, string> = { isSuccess: false, isFailure: true, error: 'boom' };
        const r = mapErrAsync<number, string, string>(
            (e: string) => Promise.resolve(e.toUpperCase()),
            Promise.resolve(bad),
        );
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form — string-to-number transform', () => {
        const bad: IResultOfT<number, string> = { isSuccess: false, isFailure: true, error: 'boom' };
        const r = mapErrAsync<number, string, number>(
            (e: string) => Promise.resolve(e.length),
            Promise.resolve(bad),
        );
        const _check: Promise<IResultOfT<number, number>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
