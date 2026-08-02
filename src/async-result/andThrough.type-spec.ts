import { describe, it, expectTypeOf } from 'vitest';
import { andThrough } from './andThrough.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('andThrough types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => AsyncResult<T, E | F>', () => {
        const res: AsyncResult<undefined, string> = fromResult(ok(undefined) as IResultOfT<undefined, string>);
        const fn = andThrough<number, string, string>((v: number) => res);
        const _check: (ar: AsyncResult<number, string>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<T, E | F>', () => {
        const res: AsyncResult<undefined, string> = fromResult(ok(undefined) as IResultOfT<undefined, string>);
        const ar: AsyncResult<number, number> = fromResult(ok(42) as IResultOfT<number, number>);
        const r = andThrough<number, number, string>((v: number) => res, ar);
        const _check: AsyncResult<number, number | string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
