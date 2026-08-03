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

    it('narrows T from res1 independently of U from res2', () => {
        const res1: AsyncResult<boolean, number> = fromResult(ok(true) as IResultOfT<boolean, number>);
        const res2: AsyncResult<string, number> = fromResult(ok('hi') as IResultOfT<string, number>);
        const r = and(res1, res2);
        expectTypeOf(r).toEqualTypeOf<AsyncResult<string, number>>();
    });

    it('does not widen E from res2 (only res1 E is exposed on failure)', () => {
        const res1: AsyncResult<number, string> = fromResult(ok(1) as IResultOfT<number, string>);
        const res2: AsyncResult<string, Error> = fromResult(ok('hi') as IResultOfT<string, Error>);
        const r = and(res1, res2);
        // The error type stays as res1's E — string here. Error from res2
        // would only surface if res1 succeeded and res2 failed.
        expectTypeOf(r).toEqualTypeOf<AsyncResult<string, string>>();
    });
});
