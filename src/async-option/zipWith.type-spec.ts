import { describe, it, expectTypeOf } from 'vitest';
import { zipWith } from './zipWith.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('zipWith types', () => {
    it('curried form returns (ao1: AsyncOption<A>, ao2: AsyncOption<B>) => AsyncOption<C>', () => {
        const fn = zipWith((a: number, b: string) => `${a}-${b}`);
        const _check: (ao1: AsyncOption<number>, ao2: AsyncOption<string>) => AsyncOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncOption<C>', () => {
        const r = zipWith((a: number, b: number) => a + b, ofSome(1), ofSome(2));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('fn may return Promise<C>', () => {
        const fn = zipWith(async (a: number, b: number) => a + b);
        const _check: (ao1: AsyncOption<number>, ao2: AsyncOption<number>) => AsyncOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles None source', () => {
        const r = zipWith((a: number, b: number) => a + b, ofNone<number>(), ofSome(2));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
