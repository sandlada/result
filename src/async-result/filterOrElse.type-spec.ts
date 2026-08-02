import { describe, it, expectTypeOf } from 'vitest';
import { filterOrElse } from './filterOrElse.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('filterOrElse types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => AsyncResult<T, E>', () => {
        const fn = filterOrElse((x: number) => x > 0, (x: number) => `neg: ${x}`);
        const _check: (ar: AsyncResult<number, string>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<T, E>', () => {
        const r = filterOrElse<number, string>(
            (x) => x > 0,
            (x) => `neg: ${x}`,
            fromResult(ok(42) as unknown as IResultOfT<number, string>),
        );
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
