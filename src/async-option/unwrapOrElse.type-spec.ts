import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOrElse } from './unwrapOrElse.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('unwrapOrElse types', () => {
    it('curried form returns (ao: AsyncOption<T>) => Promise<T>', () => {
        const fn = unwrapOrElse(() => 0);
        const _check: (ao: AsyncOption<number>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<T>', () => {
        const p = unwrapOrElse(() => 0, ofSome(42));
        expectTypeOf(p).toEqualTypeOf<Promise<number>>();
    });

    it('onNone may return Promise<T>', () => {
        const fn = unwrapOrElse(async () => 0);
        const _check: (ao: AsyncOption<number>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('applied to None uses default', () => {
        const p = unwrapOrElse(() => 0, ofNone<number>());
        expectTypeOf(p).toEqualTypeOf<Promise<number>>();
    });
});
