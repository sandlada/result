import { describe, it, expectTypeOf } from 'vitest';
import { catchErr } from './catchErr.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('catchErr types', () => {
    it('curried form returns (ar: AsyncResult<A, E>) => AsyncResult<A, never>', () => {
        const fn = catchErr<number, string>((e) => 0);
        const _check: (ar: AsyncResult<number, string>) => AsyncResult<number, never> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<A, never>', () => {
        const ar: AsyncResult<number, string> = fromResult(ok(42) as IResultOfT<number, string>);
        const r = catchErr<number, string>((e) => 0, ar);
        const _check: AsyncResult<number, never> = r;
        expectTypeOf(_check).toBeObject();
    });
});
