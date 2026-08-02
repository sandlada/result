import { describe, it, expectTypeOf } from 'vitest';
import { mapOr } from './mapOr.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('mapOr types', () => {
    it('curried form returns (ao: AsyncOption<T>) => Promise<U>', () => {
        const fn = mapOr(-1, (x: number) => x * 2);
        const _check: (ao: AsyncOption<number>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<U>', () => {
        const p = mapOr(-1, (x: number) => x * 2, ofSome(21));
        expectTypeOf(p).toEqualTypeOf<Promise<number>>();
    });

    it('mapper may return Promise<U>', () => {
        const fn = mapOr(-1, async (x: number) => x * 2);
        const _check: (ao: AsyncOption<number>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('default value type drives U when T differs', () => {
        const p = mapOr('default', (n: number) => n.toString(), ofNone<number>());
        expectTypeOf(p).toEqualTypeOf<Promise<string>>();
    });
});
