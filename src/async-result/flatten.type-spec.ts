import { describe, it, expectTypeOf } from 'vitest';
import { flatten } from './flatten.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('flatten types', () => {
    it('flattens AsyncResult<AsyncResult<T, E>, E> to AsyncResult<T, E>', () => {
        const inner: AsyncResult<number, string> = fromResult(ok(42) as unknown as IResultOfT<number, string>);
        const outer: AsyncResult<AsyncResult<number, string>, string> = fromResult({ isSuccess: true as const, isFailure: false as const, value: inner } as IResultOfT<AsyncResult<number, string>, string>);
        const r = flatten(outer);
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves structured error types through flatten', () => {
        type VErr = { code: number };
        const inner: AsyncResult<string, VErr> = fromResult(ok('a') as IResultOfT<string, VErr>);
        const outer: AsyncResult<AsyncResult<string, VErr>, VErr> = fromResult({ isSuccess: true as const, isFailure: false as const, value: inner } as IResultOfT<AsyncResult<string, VErr>, VErr>);
        const r = flatten(outer);
        expectTypeOf(r).toEqualTypeOf<AsyncResult<string, VErr>>();
    });

    it('requires the inner and outer error types to be identical', () => {
        // CONTRACT GAP (pinned): `flatten<T, E>(ar: AsyncResult<AsyncResult<T, E>, E>)`
        // binds one `E` across both layers. A nested value whose inner `E`
        // differs from the outer `E` is rejected outright — flatten does not
        // widen to `EOuter | EInner`. Pinned rather than "fixed" because
        // widening the signature would change the public API.
        const inner: AsyncResult<string, string> = fromResult(ok('a') as IResultOfT<string, string>);
        const outer: AsyncResult<AsyncResult<string, string>, number> = fromResult({ isSuccess: true as const, isFailure: false as const, value: inner } as IResultOfT<AsyncResult<string, string>, number>);
        // @ts-expect-error outer E is number while inner E is string
        flatten(outer);

        // With a shared E the call type-checks and preserves it.
        const outerSame: AsyncResult<AsyncResult<string, string>, string> = fromResult({ isSuccess: true as const, isFailure: false as const, value: inner } as IResultOfT<AsyncResult<string, string>, string>);
        expectTypeOf(flatten(outerSame)).toEqualTypeOf<AsyncResult<string, string>>();
    });
});
