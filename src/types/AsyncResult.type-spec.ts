import { describe, it, expectTypeOf } from 'vitest';
import type { AsyncResult } from './AsyncResult.js';
import type { IResultOfT, IResultOfTSuccess, IResultOfTFailure } from './IResultOfT.js';
import { ok, err } from '../factories/index.js';

describe('AsyncResult types', () => {
    it('run() returns Promise<IResultOfT<T, E>>', () => {
        type AR = AsyncResult<number, string>;
        type R = ReturnType<AR['run']>;
        const _check: Promise<IResultOfT<number, string>> = null as unknown as R;
        expectTypeOf(_check).toBeObject();
    });

    it('AsyncResult defaults E to unknown', () => {
        type AR = AsyncResult<number>;
        type R = ReturnType<AR['run']>;
        const _check: Promise<IResultOfT<number, unknown>> = null as unknown as R;
        expectTypeOf(_check).toBeObject();
    });

    it('structural compatibility: a plain object with .run() is AsyncResult', () => {
        const ar: AsyncResult<number, string> = {
            run: () => Promise.resolve(ok(42) as IResultOfT<number, string>),
        };
        expectTypeOf(ar.run).toEqualTypeOf<() => Promise<IResultOfT<number, string>>>();
    });

    it('run() resolves with success variant', () => {
        const ar: AsyncResult<number, string> = {
            run: () => Promise.resolve(ok(42) as IResultOfT<number, string>),
        };
        const result = ar.run();
        expectTypeOf(result).toBeObject();
    });

    it('run() resolves with failure variant', () => {
        const ar: AsyncResult<number, string> = {
            run: () => Promise.resolve(err('fail') as IResultOfT<number, string>),
        };
        const result = ar.run();
        expectTypeOf(result).toBeObject();
    });

    // ---------------------------------------------------------------------
    // Shape
    // ---------------------------------------------------------------------

    it('the carrier has exactly one member, run', () => {
        expectTypeOf<keyof AsyncResult<number, string>>().toEqualTypeOf<'run'>();
        expectTypeOf<AsyncResult<number, string>['run']>().toEqualTypeOf<
            () => Promise<IResultOfT<number, string>>
        >();
    });

    it('run is readonly', () => {
        const ar: AsyncResult<number, string> = {
            run: () => Promise.resolve(ok(42) as IResultOfT<number, string>),
        };
        // @ts-expect-error run is readonly
        ar.run = () => Promise.resolve(ok(1) as IResultOfT<number, string>);
    });

    it('run takes no arguments', () => {
        const ar: AsyncResult<number, string> = {
            run: () => Promise.resolve(ok(42) as IResultOfT<number, string>),
        };
        // @ts-expect-error run() accepts zero arguments
        ar.run(1);
    });

    it('AsyncResult<T> with no error argument is exactly AsyncResult<T, unknown>', () => {
        expectTypeOf<AsyncResult<number>>().toEqualTypeOf<AsyncResult<number, unknown>>();
    });

    // ---------------------------------------------------------------------
    // Awaited resolution
    // ---------------------------------------------------------------------

    it('awaiting run() yields the discriminated union, which still needs narrowing', async () => {
        const ar: AsyncResult<number, string> = {
            run: async () => ok(42) as IResultOfT<number, string>,
        };
        const settled = await ar.run();
        expectTypeOf(settled).toEqualTypeOf<IResultOfT<number, string>>();
        if (settled.isSuccess) {
            expectTypeOf(settled).toEqualTypeOf<IResultOfTSuccess<number>>();
            expectTypeOf(settled.value).toEqualTypeOf<number>();
        } else {
            expectTypeOf(settled).toEqualTypeOf<IResultOfTFailure<string>>();
            expectTypeOf(settled.error).toEqualTypeOf<string>();
        }
    });

    it('Awaited<ReturnType<run>> is the result union, not a nested promise', () => {
        expectTypeOf<Awaited<ReturnType<AsyncResult<number, string>['run']>>>().toEqualTypeOf<
            IResultOfT<number, string>
        >();
    });

    // ---------------------------------------------------------------------
    // Accepted run implementations
    // ---------------------------------------------------------------------

    it('accepts an async function that returns a result value directly', () => {
        const ar: AsyncResult<number, string> = { run: async () => ok(42) };
        expectTypeOf(ar).toEqualTypeOf<AsyncResult<number, string>>();
    });

    it('accepts a thunk returning an already-built Promise<IResultOfT<T, E>>', () => {
        const pending: Promise<IResultOfT<number, string>> = Promise.resolve(ok(42));
        const ar: AsyncResult<number, string> = { run: () => pending };
        expectTypeOf(ar.run()).toEqualTypeOf<Promise<IResultOfT<number, string>>>();
    });

    it('accepts a failure-only thunk because err() infers TValue as never', () => {
        const ar: AsyncResult<number, string> = { run: async () => err('boom') };
        expectTypeOf(ar).toEqualTypeOf<AsyncResult<number, string>>();
    });

    // ---------------------------------------------------------------------
    // Negative constraints
    // ---------------------------------------------------------------------

    it('rejects a run that returns a synchronous IResultOfT instead of a Promise', () => {
        // @ts-expect-error run must return a Promise, not a settled result
        const _ar: AsyncResult<number, string> = { run: () => ok(42) as IResultOfT<number, string> };
    });

    it('rejects a run that returns a bare thenable rather than a Promise', () => {
        const thenable = {
            then(onFulfilled: (value: IResultOfT<number, string>) => void): void {
                onFulfilled(ok(42));
            },
        };
        // @ts-expect-error run must return a Promise, not an arbitrary thenable
        const _ar: AsyncResult<number, string> = { run: () => thenable };
    });

    it('rejects a mismatched value type', () => {
        // @ts-expect-error the resolved value type must be number, not string
        const _ar: AsyncResult<number, string> = { run: async () => ok('42') };
    });

    it('rejects a mismatched error type', () => {
        // @ts-expect-error the resolved error type must be string, not number
        const _ar: AsyncResult<number, string> = { run: async () => err(404) };
    });

    it('rejects an object without run', () => {
        // @ts-expect-error the carrier requires a run member
        const _ar: AsyncResult<number, string> = {};
    });

    // ---------------------------------------------------------------------
    // Variance
    // ---------------------------------------------------------------------

    it('AsyncResult is covariant in T and E', () => {
        expectTypeOf<AsyncResult<number, string>>().toExtend<AsyncResult<number | boolean, string>>();
        expectTypeOf<AsyncResult<number, string>>().toExtend<AsyncResult<number, string | Error>>();
        expectTypeOf<AsyncResult<number | boolean, string>>().not.toExtend<AsyncResult<number, string>>();
        expectTypeOf<AsyncResult<never, never>>().toExtend<AsyncResult<number, string>>();
    });
});
