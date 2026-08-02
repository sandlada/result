import { describe, it, expectTypeOf } from 'vitest';
import { and } from './and.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('and types', () => {
    it('returns AsyncResult<U, E>', () => {
        const res1: AsyncResult<number, string> = fromResult(ok(1) as IResultOfT<number, string>);
        const res2: AsyncResult<string, string> = fromResult(ok('hi') as IResultOfT<string, string>);
        const r = and(res1, res2);
        const _check: AsyncResult<string, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves U from res2', () => {
        const res1: AsyncResult<number, string> = fromResult(ok(1) as IResultOfT<number, string>);
        const res2: AsyncResult<string, string> = fromResult(ok('hi') as IResultOfT<string, string>);
        const r = and(res1, res2);
        const _check: AsyncResult<string, string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
