import { describe, it, expectTypeOf } from 'vitest';
import { flattenAsync } from './flattenAsync.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('flattenAsync types', () => {
    it('returns Promise<IResultOfT<A, E>> for nested Ok', () => {
        const inner: IResultOfT<number, string> = { isSuccess: true as const, isFailure: false as const, value: 42 };
        const outer: IResultOfT<typeof inner, string> = { isSuccess: true as const, isFailure: false as const, value: inner };
        const r = flattenAsync(Promise.resolve(outer));
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves E from outer Err', () => {
        const outer: IResultOfT<never, string> = { isSuccess: false as const, isFailure: true as const, error: 'boom' };
        const r = flattenAsync(Promise.resolve(outer));
        const _check: Promise<IResultOfT<never, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input — nested success', () => {
        const inner: IResultOfT<number, string> = { isSuccess: true as const, isFailure: false as const, value: 42 };
        const outer: IResultOfT<typeof inner, string> = { isSuccess: true as const, isFailure: false as const, value: inner };
        const r = flattenAsync(Promise.resolve(outer));
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('unwraps inner Err with same E type', () => {
        const inner: IResultOfT<never, string> = { isSuccess: false as const, isFailure: true as const, error: 'inner' };
        const outer: IResultOfT<typeof inner, string> = { isSuccess: true as const, isFailure: false as const, value: inner };
        const r = flattenAsync(Promise.resolve(outer));
        const _check: Promise<IResultOfT<never, string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
