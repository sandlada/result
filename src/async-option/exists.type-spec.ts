import { describe, it, expectTypeOf } from 'vitest';
import { exists } from './exists.js';
import { ofSome } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('exists types', () => {
    it('curried form returns (ao: AsyncOption<T>) => Promise<boolean>', () => {
        const fn = exists((x: number) => x > 0);
        const _check: (ao: AsyncOption<number>) => Promise<boolean> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<boolean>', () => {
        const p = exists((x: number) => x > 0, ofSome(42));
        expectTypeOf(p).toEqualTypeOf<Promise<boolean>>();
    });

    it('predicate may return Promise<boolean>', () => {
        const fn = exists(async (x: number) => x > 0);
        const _check: (ao: AsyncOption<number>) => Promise<boolean> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
