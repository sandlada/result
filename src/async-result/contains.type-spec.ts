import { describe, it, expectTypeOf } from 'vitest';
import { contains } from './contains.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('contains types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => Promise<boolean>', () => {
        const fn = contains<number>(42);
        const _check: <E>(ar: AsyncResult<number, E>) => Promise<boolean> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<boolean>', () => {
        const r = contains<number, string>(42, fromResult(ok(42) as unknown as IResultOfT<number, string>));
        expectTypeOf(r).toEqualTypeOf<Promise<boolean>>();
    });
});
