import { describe, it, expect, expectTypeOf } from 'vitest';
import { tapErrAsyncOption } from './tapErrAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('tapErrAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<IOption<T>>', () => {
        const fn = tapErrAsyncOption((v: number | undefined) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<T>>', () => {
        const noneOpt: IOption<number> = ofNone();
        const r = tapErrAsyncOption((v: number | undefined) => { /* side effect */ }, Promise.resolve(noneOpt));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('callback may return Promise<void>', () => {
        const fn = tapErrAsyncOption(async (v: number | undefined) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T unchanged across the side-effect', () => {
        const fn = tapErrAsyncOption((v: string | undefined) => { /* side effect */ });
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofSome input as pass-through', () => {
        const r = tapErrAsyncOption((v: number | undefined) => { /* side effect */ }, Promise.resolve(ofSome(42)));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = tapErrAsyncOption((v: number | undefined) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(r: Promise<IOption<number>>) => Promise<IOption<number>>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const noneOpt: IOption<number> = ofNone();
        const r = tapErrAsyncOption(
            (v: number | undefined) => { void v; },
            Promise.resolve(noneOpt),
        );
        expectTypeOf(r).toEqualTypeOf<Promise<IOption<number>>>();
    });

    it('callback accepts T | undefined on the None path (H1 contract pin)', () => {
        // The H1 fix pins the callback parameter as `T | undefined`. The
        // implementation passes `undefined` on the None path, so the
        // callback must accept that value type at the type level.
        const observed: Array<number | undefined> = [];
        const fn = tapErrAsyncOption<number>((v: number | undefined) => {
            observed.push(v);
        });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
        expect(observed).toEqual([]);
    });
});
