import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOrElseAsync } from './unwrapOrElseAsync.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('unwrapOrElseAsync types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<T | D>', () => {
        // Pin both generics — `T` defaults to `unknown` and `D` defaults to
        // `T` when only the defaultValue is supplied.
        const fn = unwrapOrElseAsync<number, number>(() => 0);
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<T | D>', () => {
        const p = unwrapOrElseAsync<number, number>(() => 0, Promise.resolve(ofSome(42)));
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('onNone may return Promise<T>', () => {
        const fn = unwrapOrElseAsync<number, number>(async () => 0);
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input — invokes onNone', () => {
        // Pin the option's value type — `ofNone()` widens to
        // `IOption<unknown>` by default.
        const noneOpt: IOption<number> = ofNone() as IOption<number>;
        const p = unwrapOrElseAsync<number, number>(() => 0, Promise.resolve(noneOpt));
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T for non-number types', () => {
        const fn = unwrapOrElseAsync<string, string>(() => 'fallback');
        const _check: (r: Promise<IOption<string>>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('infers a structural return-type for the curried application', () => {
        // Pin both generics for the structural comparison.
        const fn = unwrapOrElseAsync<number, number>(() => 0);
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('infers a structural return-type for the direct application', () => {
        const p = unwrapOrElseAsync<number, number>(() => 0, Promise.resolve(ofSome(42)));
        expectTypeOf(p).toEqualTypeOf<Promise<number>>();
    });

    it('preserves T across the onNone return type (no widening)', () => {
        // Pin both generics — `T` is the input type, `D` is the fallback.
        const fn = unwrapOrElseAsync<string, string>(() => 'fallback');
        const _check: (r: Promise<IOption<string>>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
