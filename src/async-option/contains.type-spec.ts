import { describe, it, expectTypeOf } from 'vitest';
import { contains } from './contains.js';
import { ofSome } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('contains types', () => {
    it('curried form returns (ao: AsyncOption<T>) => Promise<boolean>', () => {
        const fn = contains(42);
        const _check: (ao: AsyncOption<number>) => Promise<boolean> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<boolean>', () => {
        const p = contains(42, ofSome(42));
        expectTypeOf(p).toEqualTypeOf<Promise<boolean>>();
    });
});
