import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOr } from './unwrapOr.js';
import { fromOption } from './index.js';
import { ofSome } from '../option/index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('unwrapOr types', () => {
    it('curried form returns (ao: AsyncOption<T>) => Promise<T>', () => {
        const fn = unwrapOr(0);
        const _check: (ao: AsyncOption<number>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<T>', () => {
        const p = unwrapOr(0, fromOption(ofSome(42)));
        expectTypeOf(p).toEqualTypeOf<Promise<number>>();
    });

    it('defaultValue may be Promise<T>', () => {
        const fn = unwrapOr(Promise.resolve(0));
        const _check: (ao: AsyncOption<number>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
