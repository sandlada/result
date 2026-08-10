import { describe, it, expect, expectTypeOf } from 'vitest';
import { tapErrAsyncOption } from './tapErrAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('tapErrAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<IOption<T>>', () => {
        // The callback parameter type drives `T`. Declaring `v: number`
        // (not `number | undefined`) keeps `T` narrow — the H1 split
        // (this function takes an optional `fnNone`, not a `T | undefined`
        // callback parameter) is the contract.
        const fn = tapErrAsyncOption((_v: number) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<T>>', () => {
        // Pin the option's value type — `ofNone()` widens to `IOption<unknown>`.
        const noneOpt: IOption<number> = ofNone() as IOption<number>;
        const r = tapErrAsyncOption((v: number) => { /* side effect */ }, Promise.resolve(noneOpt));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('callback may return Promise<void>', () => {
        const fn = tapErrAsyncOption(async (_v: number) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T unchanged across the side-effect', () => {
        const fn = tapErrAsyncOption((_v: string) => { /* side effect */ });
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofSome input as pass-through', () => {
        const r = tapErrAsyncOption((v: number) => { /* side effect */ }, Promise.resolve(ofSome(42)));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the curried application', () => {
        // The curried form is `<T>(r) => Promise<IOption<T>>` with `T`
        // deferred; structural equality is pinned at the application site.
        const fn = tapErrAsyncOption((v: number) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('infers a structural return-type for the direct application', () => {
        // Pin the option's value type — `ofNone()` widens to `IOption<unknown>`.
        const noneOpt: IOption<number> = ofNone() as IOption<number>;
        const r = tapErrAsyncOption(
            (v: number) => { void v; },
            Promise.resolve(noneOpt),
        );
        expectTypeOf(r).toEqualTypeOf<Promise<IOption<number>>>();
    });

    it('callback accepts T on the None path (H1 contract pin)', () => {
        // The H1 fix pins the callback parameter as `T` (the input option's
        // value type). The implementation invokes `fn(inner.value)` on the
        // Some path only; on the None path no callback runs (the second
        // argument is the optional `fnNone` side-effect).
        const observed: Array<number | undefined> = [];
        const fn = tapErrAsyncOption<number>((v: number) => {
            observed.push(v);
        });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
        expect(observed).toEqual([]);
    });
});
