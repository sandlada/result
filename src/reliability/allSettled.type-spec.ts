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

    it('Settled success variant has value and forbids error', () => {
        type S = Settled<number, string>;
        const success: S = { ok: true, value: 42 };
        if (success.ok) {
            expectTypeOf(success.value).toEqualTypeOf<number>();
        }
        // @ts-expect-error: error is forbidden on the success branch.
        const bad: S = { ok: true, value: 42, error: 'illegal' };
        void bad;
    });

    it('Settled failure variant has error and forbids value', () => {
        type S = Settled<number, string>;
        const failure: S = { ok: false, error: 'boom' };
        if (!failure.ok) {
            expectTypeOf(failure.error).toEqualTypeOf<string>();
        }
        // @ts-expect-error: value is forbidden on the failure branch.
        const bad: S = { ok: false, error: 'boom', value: 99 };
        void bad;
    });

    it('preserves literal T and E through Settled<T, E>[]', () => {
        type Err = 'transient' | 'fatal';
        type Lit = Settled<42, Err>;
        const okVariant: Lit = { ok: true, value: 42 };
        const errVariant: Lit = { ok: false, error: 'transient' };
        expectTypeOf(okVariant.value).toEqualTypeOf<42>();
        expectTypeOf(errVariant.error).toEqualTypeOf<Err>();
    });

    it('the AsyncResult error type is literally `never`', () => {
        const r = allSettled([fromResult(ok(1))]);
        // The E parameter of the AsyncResult is `never`, not `unknown`.
        const _check: AsyncResult<Settled<number, string>[], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('input is readonly AsyncResult<T, E>[]', () => {
        const mutable: AsyncResult<number, string>[] = [fromResult(ok(1))];
        const r = allSettled(mutable);
        const _check: AsyncResult<Settled<number, string>[], never> = r;
        expectTypeOf(_check).toBeObject();
    });
});
