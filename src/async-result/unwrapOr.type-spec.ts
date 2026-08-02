import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOr } from './unwrapOr.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unwrapOr types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => Promise<T>', () => {
        const fn = unwrapOr<number, string>(0);
        const _check: (ar: AsyncResult<number, string>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<T>', () => {
        const r = unwrapOr<number, string>(0, fromResult(ok(42) as unknown as IResultOfT<number, string>));
        expectTypeOf(r).toEqualTypeOf<Promise<number>>();
    });
});
