import { describe, it, expectTypeOf } from 'vitest';
import { exists } from './exists.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('exists types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => Promise<boolean>', () => {
        const fn = exists((v: number) => v > 0);
        const _check: <E>(ar: AsyncResult<number, E>) => Promise<boolean> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<boolean>', () => {
        const r = exists<number, string>(
            (v) => v > 0,
            fromResult(ok(42) as unknown as IResultOfT<number, string>),
        );
        expectTypeOf(r).toEqualTypeOf<Promise<boolean>>();
    });
});
