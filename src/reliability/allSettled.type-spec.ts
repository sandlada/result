import { describe, it, expectTypeOf } from 'vitest';
import { allSettled, type Settled } from './allSettled.js';
import { fromResult } from '../async-result/index.js';
import { ok, err } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('allSettled types', () => {
    it('returns AsyncResult<Settled<T, E>[], never>', () => {
        const r = allSettled([fromResult(ok(1)), fromResult(err('a'))]);
        const _check: AsyncResult<Settled<number, string>[], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('Settled<T, E> is a discriminated union with ok boolean', () => {
        type S = Settled<number, string>;
        const success: S = { ok: true, value: 42 };
        const failure: S = { ok: false, error: 'fail' };
        expectTypeOf(success.ok).toEqualTypeOf<true>();
        expectTypeOf(failure.ok).toEqualTypeOf<false>();
    });

    it('handles empty input', () => {
        const r = allSettled<number, string>([]);
        const _check: AsyncResult<Settled<number, string>[], never> = r;
        expectTypeOf(_check).toBeObject();
    });
});
