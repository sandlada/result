import { describe, it, expectTypeOf } from 'vitest';
import { mapAsync } from './mapAsync.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('mapAsync types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<IOption<U>>', () => {
        const fn = mapAsync((x: number) => x.toString());
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<U>>', () => {
        const r = mapAsync((x: number) => x * 2, Promise.resolve(ofSome(21)));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('mapper may return Promise<U>', () => {
        const fn = mapAsync(async (s: string) => s.length);
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves U from the mapper', () => {
        const fn = mapAsync((s: string) => s.length);
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input as None', () => {
        const noneOpt: IOption<number> = ofNone();
        const r = mapAsync((x: number) => x, Promise.resolve(noneOpt));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = mapAsync((x: number) => x.toString());
        expectTypeOf(fn).toEqualTypeOf<(r: Promise<IOption<number>>) => Promise<IOption<string>>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const r = mapAsync((x: number) => x * 2, Promise.resolve(ofSome(21)));
        expectTypeOf(r).toEqualTypeOf<Promise<IOption<number>>>();
    });

    it('preserves T in the input carrier across the curried form', () => {
        // T is the carrier type — comes in as `Promise<IOption<T>>`.
        const fn = mapAsync((s: string) => s.length);
        const _carrier: Promise<IOption<string>> = Promise.resolve(ofSome('hi'));
        void _carrier;
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
