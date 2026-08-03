import { describe, it, expectTypeOf } from 'vitest';
import { or } from './or.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('or types', () => {
    it('returns AsyncResult<T, E | F>', () => {
        const r = or(fromResult(ok(1) as unknown as IResultOfT<number, string>), fromResult(ok(2) as unknown as IResultOfT<number, number>));
        const _check: AsyncResult<number, string | number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T from both inputs', () => {
        const r = or(fromResult(ok('a') as unknown as IResultOfT<string, string>), fromResult(ok('b') as unknown as IResultOfT<string, number>));
        const _check: AsyncResult<string, string | number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('unifies structured error types via union', () => {
        type VErrA = { code: number };
        type VErrB = { reason: string };
        const r = or(
            fromResult(ok(1) as IResultOfT<number, VErrA>),
            fromResult(ok(2) as IResultOfT<number, VErrB>),
        );
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number, VErrA | VErrB>>();
    });

    it('T is invariant between the two inputs (must be the same type)', () => {
        // Both inputs must share the same T; otherwise TypeScript rejects.
        const r = or(
            fromResult(ok(1) as IResultOfT<number, string>),
            fromResult(ok(2) as IResultOfT<number, number>),
        );
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number, string | number>>();
    });
});
