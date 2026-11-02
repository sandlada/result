import { describe, it, expectTypeOf } from 'vitest';
import { tapAsync } from './tapAsync.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('tapAsync types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<IOption<T>>', () => {
        const fn = tapAsync((x: number) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<T>>', () => {
        const r = tapAsync((v: number) => { /* side effect */ }, Promise.resolve(ofSome(42)));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('callback may return Promise<void>', () => {
        const fn = tapAsync(async (x: number) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T unchanged on the success track', () => {
        const fn = tapAsync((s: string) => { /* side effect */ });
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = tapAsync((x: number) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(r: Promise<IOption<number>>) => Promise<IOption<number>>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const r = tapAsync((v: number) => { /* side effect */ }, Promise.resolve(ofSome(42)));
        expectTypeOf(r).toEqualTypeOf<Promise<IOption<number>>>();
    });

    it('preserves T in the input carrier (no widening on the carrier)', () => {
        // tapAsync takes T in and gives T back — there is no way for
        // the callback's return value to leak into T.
        const fn = tapAsync((s: string) => { /* uses s but returns void */ void s; });
        const _carrier: Promise<IOption<string>> = Promise.resolve(ofSome('hi'));
        void _carrier;
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
