import { describe, it, expectTypeOf } from 'vitest';
import { mapOrElse } from './mapOrElse.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('mapOrElse types', () => {
    it('curried form returns (ao: AsyncOption<T>) => Promise<U>', () => {
        const fn = mapOrElse(() => -1, (x: number) => x * 2);
        const _check: (ao: AsyncOption<number>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<U>', () => {
        const p = mapOrElse(() => -1, (x: number) => x * 2, ofSome(21));
        expectTypeOf(p).toEqualTypeOf<Promise<number>>();
    });

    it('onNone may return Promise<U>', () => {
        const fn = mapOrElse(async () => -1, (x: number) => x * 2);
        const _check: (ao: AsyncOption<number>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
