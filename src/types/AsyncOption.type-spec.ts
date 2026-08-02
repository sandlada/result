import { describe, it, expectTypeOf } from 'vitest';
import type { AsyncOption } from './AsyncOption.js';
import type { AsyncResult } from './AsyncResult.js';
import type { IOption, IOptionSome, IOptionNone } from './Option.js';
import { ofSome, ofNone } from '../option/index.js';

describe('AsyncOption types', () => {
    it('run() returns Promise<IOption<T>>', () => {
        type AO = AsyncOption<number>;
        type R = ReturnType<AO['run']>;
        const _check: Promise<IOption<number>> = null as unknown as R;
        expectTypeOf(_check).toBeObject();
    });

    it('structural compatibility: a plain object with .run() is AsyncOption', () => {
        const ao: AsyncOption<string> = {
            run: () => Promise.resolve(ofSome('hi')),
        };
        expectTypeOf(ao.run).toEqualTypeOf<() => Promise<IOption<string>>>();
    });

    it('run() returns Promise that resolves to IOption', () => {
        const ao: AsyncOption<number> = {
            run: () => Promise.resolve(ofSome(42)),
        };
        const result = ao.run();
        expectTypeOf(result).toBeObject();
    });

    // ---------------------------------------------------------------------
    // Shape
    // ---------------------------------------------------------------------

    it('the carrier has exactly one member, run', () => {
        expectTypeOf<keyof AsyncOption<number>>().toEqualTypeOf<'run'>();
        expectTypeOf<AsyncOption<number>['run']>().toEqualTypeOf<() => Promise<IOption<number>>>();
    });

    it('run is readonly', () => {
        const ao: AsyncOption<number> = { run: () => Promise.resolve(ofSome(42)) };
        // @ts-expect-error run is readonly
        ao.run = () => Promise.resolve(ofNone());
    });

    it('run takes no arguments', () => {
        const ao: AsyncOption<number> = { run: () => Promise.resolve(ofSome(42)) };
        // @ts-expect-error run() accepts zero arguments
        ao.run(1);
    });

    it('AsyncOption has no error type parameter', () => {
        // @ts-expect-error AsyncOption is single-parameter; there is no error channel
        const _ao: AsyncOption<number, string> = { run: () => Promise.resolve(ofSome(42)) };
    });

    // ---------------------------------------------------------------------
    // Awaited resolution
    // ---------------------------------------------------------------------

    it('awaiting run() yields the option union, which still needs narrowing', async () => {
        const ao: AsyncOption<number> = { run: async () => ofSome(42) };
        const settled = await ao.run();
        expectTypeOf(settled).toEqualTypeOf<IOption<number>>();
        if (settled.isSome) {
            expectTypeOf(settled).toEqualTypeOf<IOptionSome<number>>();
            expectTypeOf(settled.value).toEqualTypeOf<number>();
        } else {
            expectTypeOf(settled).toEqualTypeOf<IOptionNone>();
        }
    });

    it('Awaited<ReturnType<run>> is the option union, not a nested promise', () => {
        expectTypeOf<Awaited<ReturnType<AsyncOption<number>['run']>>>().toEqualTypeOf<IOption<number>>();
    });

    // ---------------------------------------------------------------------
    // Accepted run implementations
    // ---------------------------------------------------------------------

    it('accepts an async function that returns an option value directly', () => {
        const ao: AsyncOption<number> = { run: async () => ofSome(42) };
        expectTypeOf(ao).toEqualTypeOf<AsyncOption<number>>();
    });

    it('accepts a None-producing thunk because ofNone() infers IOption<never>', () => {
        const ao: AsyncOption<number> = { run: async () => ofNone() };
        expectTypeOf(ao).toEqualTypeOf<AsyncOption<number>>();
    });

    it('accepts a thunk returning an already-built Promise<IOption<T>>', () => {
        const pending: Promise<IOption<number>> = Promise.resolve(ofSome(42));
        const ao: AsyncOption<number> = { run: () => pending };
        expectTypeOf(ao.run()).toEqualTypeOf<Promise<IOption<number>>>();
    });

    // ---------------------------------------------------------------------
    // Negative constraints
    // ---------------------------------------------------------------------

    it('rejects a run that returns a synchronous IOption instead of a Promise', () => {
        // @ts-expect-error run must return a Promise, not a settled option
        const _ao: AsyncOption<number> = { run: () => ofSome(42) };
    });

    it('rejects a run that returns a bare thenable rather than a Promise', () => {
        const thenable = {
            then(onFulfilled: (value: IOption<number>) => void): void {
                onFulfilled(ofSome(42));
            },
        };
        // @ts-expect-error run must return a Promise, not an arbitrary thenable
        const _ao: AsyncOption<number> = { run: () => thenable };
    });

    it('rejects a mismatched value type', () => {
        // @ts-expect-error the resolved value type must be number, not string
        const _ao: AsyncOption<number> = { run: async () => ofSome('42') };
    });

    it('rejects an object without run', () => {
        // @ts-expect-error the carrier requires a run member
        const _ao: AsyncOption<number> = {};
    });

    // ---------------------------------------------------------------------
    // Variance and carrier separation
    // ---------------------------------------------------------------------

    it('AsyncOption is covariant in T', () => {
        expectTypeOf<AsyncOption<number>>().toExtend<AsyncOption<number | string>>();
        expectTypeOf<AsyncOption<number | string>>().not.toExtend<AsyncOption<number>>();
        expectTypeOf<AsyncOption<never>>().toExtend<AsyncOption<number>>();
    });

    it('AsyncOption and AsyncResult are distinct carriers despite the shared run key', () => {
        expectTypeOf<AsyncOption<number>>().not.toExtend<AsyncResult<number, string>>();
        expectTypeOf<AsyncResult<number, string>>().not.toExtend<AsyncOption<number>>();
    });
});
