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

    it('requires both operands to share E (mismatched error types are rejected)', () => {
        // CONTRACT GAP (pinned): `and<T, U, E>(res1: AsyncResult<T, E>,
        // res2: AsyncResult<U, E>)` binds a *single* `E`. It does NOT widen to
        // `E1 | E2`, and it does not keep only res1's `E` either — a call whose
        // operands carry different error types simply fails to compile. Callers
        // must unify `E` themselves before calling. Pinned rather than "fixed"
        // because widening the signature would change the public API.
        const res1: AsyncResult<number, string> = fromResult(ok(1) as IResultOfT<number, string>);
        const res2: AsyncResult<string, Error> = fromResult(ok('hi') as IResultOfT<string, Error>);
        // @ts-expect-error AsyncResult<string, Error> is not assignable to AsyncResult<string, string>
        and(res1, res2);

        // With a shared E the call type-checks and the result carries that E.
        const res2Same: AsyncResult<string, string> = fromResult(ok('hi') as IResultOfT<string, string>);
        expectTypeOf(and(res1, res2Same)).toEqualTypeOf<AsyncResult<string, string>>();
    });
});
