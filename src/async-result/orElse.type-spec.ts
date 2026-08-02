import { describe, it, expectTypeOf } from 'vitest';
import { orElse } from './orElse.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('orElse types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => AsyncResult<T, E | F>', () => {
        const fn = orElse((e: string) => fromResult(ok(0) as unknown as IResultOfT<number, number>));
        const _check: (ar: AsyncResult<number, string>) => AsyncResult<number, string | number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<T, E | F>', () => {
        const r = orElse<number, string, number>(
            (e) => fromResult(ok(0) as unknown as IResultOfT<number, number>),
            fromResult(ok(42) as unknown as IResultOfT<number, string>),
        );
        const _check: AsyncResult<number, string | number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
