import { describe, it, expectTypeOf } from 'vitest';
import { ap } from './ap.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('ap types', () => {
    it('curried form returns (result: AsyncResult<A, E>) => AsyncResult<B, E>', () => {
        const fnAr: AsyncResult<(a: number) => number, string> = fromResult(ok(((x: number) => x * 2)) as IResultOfT<(a: number) => number, string>);
        const fn = ap(fnAr);
        const _check: (result: AsyncResult<number, string>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<B, E>', () => {
        const fnAr: AsyncResult<(a: number) => string, string> = fromResult(ok(((x: number) => x.toString())) as IResultOfT<(a: number) => string, string>);
        const ar: AsyncResult<number, string> = fromResult(ok(42) as IResultOfT<number, string>);
        const r = ap(fnAr, ar);
        const _check: AsyncResult<string, string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
