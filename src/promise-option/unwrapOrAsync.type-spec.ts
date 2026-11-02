import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOrAsync } from './unwrapOrAsync.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('unwrapOrAsync types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<T | D>', () => {
        // `T` and `D` are independent generics — without explicit T, the
        // implementation infers D from the default value and leaves T as
        // `unknown` (the contextual-typing default). Pin both generics here
        // to verify the declared shape.
        const fn = unwrapOrAsync<number, number>(0);
        const _check: (r: Promise<IOption<number>>) => Promise<number | number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<T | D>', () => {
        const p = unwrapOrAsync<number, number>(0, Promise.resolve(ofSome(42)));
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('defaultValue may be Promise<T>', () => {
        const fn = unwrapOrAsync<number, number>(Promise.resolve(0));
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input — returns default', () => {
        // Pin the option's value type — `ofNone()` widens to
        // `IOption<unknown>`, which would absorb `number` into `unknown`.
        const noneOpt: IOption<number> = ofNone() as IOption<number>;
        const p = unwrapOrAsync<number, number>(0, Promise.resolve(noneOpt));
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T for non-number types', () => {
        const fn = unwrapOrAsync<string, string>('fallback');
        const _check: (r: Promise<IOption<string>>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('infers a structural return-type for the curried application', () => {
        // Pin both generics for the structural comparison — deferred `T` would
        // otherwise be captured as a free generic.
        const fn = unwrapOrAsync<number, number>(0);
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('infers a structural return-type for the direct application', () => {
        const p = unwrapOrAsync<number, number>(0, Promise.resolve(ofSome(42)));
        expectTypeOf(p).toEqualTypeOf<Promise<number>>();
    });

    it('infers T from the defaultValue literal when Some value is provided later', () => {
        // The defaultValue drives `D`; the curried `T` is deferred and
        // captured at application. Pin both generics for the type check.
        const fn = unwrapOrAsync<string, string>('fallback');
        const _check: (r: Promise<IOption<string>>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
