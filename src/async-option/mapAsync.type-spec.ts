import { describe, it, expectTypeOf } from 'vitest';
import { mapAsync } from './mapAsync.js';
import { fromOption } from './index.js';
import { ofSome } from '../option/index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('mapAsync types', () => {
    it('curried form returns (ao: AsyncOption<T>) => AsyncOption<U>', () => {
        const fn = mapAsync(async (x: number) => x.toString());
        const _check: (ao: AsyncOption<number>) => AsyncOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncOption<U>', () => {
        const r = mapAsync(async (x: number) => x * 2, fromOption(ofSome(21)));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
