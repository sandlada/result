import { describe, it, expectTypeOf } from 'vitest';
import { filter } from './filter.js';
import { fromOption } from './index.js';
import { ofSome } from '../option/index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('filter types', () => {
    it('curried form returns (ao: AsyncOption<T>) => AsyncOption<T>', () => {
        const fn = filter((x: number) => x > 0);
        const _check: (ao: AsyncOption<number>) => AsyncOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncOption<T>', () => {
        const r = filter((x: number) => x > 0, fromOption(ofSome(42)));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('predicate may return Promise<boolean>', () => {
        const fn = filter(async (x: number) => x > 0);
        const _check: (ao: AsyncOption<number>) => AsyncOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
