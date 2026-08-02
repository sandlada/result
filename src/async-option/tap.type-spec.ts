import { describe, it, expectTypeOf } from 'vitest';
import { tap } from './tap.js';
import { fromOption } from './index.js';
import { ofSome } from '../option/index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('tap types', () => {
    it('curried form returns (ao: AsyncOption<T>) => AsyncOption<T>', () => {
        const fn = tap((x: number) => { /* side effect */ });
        const _check: (ao: AsyncOption<number>) => AsyncOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncOption<T>', () => {
        const r = tap((x: number) => { /* side effect */ }, fromOption(ofSome(42)));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
