import { describe, it, expectTypeOf } from 'vitest';
import { tapAsyncOption } from './tapAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('tapAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<IOption<T>>', () => {
        const fn = tapAsyncOption((x: number) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<T>>', () => {
        const r = tapAsyncOption((v: number) => { /* side effect */ }, Promise.resolve(ofSome(42)));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('callback may return Promise<void>', () => {
        const fn = tapAsyncOption(async (x: number) => { /* side effect */ });
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T unchanged on the success track', () => {
        const fn = tapAsyncOption((s: string) => { /* side effect */ });
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = tapAsyncOption((x: number) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(r: Promise<IOption<number>>) => Promise<IOption<number>>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const r = tapAsyncOption((v: number) => { /* side effect */ }, Promise.resolve(ofSome(42)));
        expectTypeOf(r).toEqualTypeOf<Promise<IOption<number>>>();
    });

    it('preserves T in the input carrier (no widening on the carrier)', () => {
        // tapAsyncOption takes T in and gives T back — there is no way for
        // the callback's return value to leak into T.
        const fn = tapAsyncOption((s: string) => { /* uses s but returns void */ void s; });
        const _carrier: Promise<IOption<string>> = Promise.resolve(ofSome('hi'));
        void _carrier;
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
