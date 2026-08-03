import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOrAsyncOption } from './unwrapOrAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('unwrapOrAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<T>', () => {
        const fn = unwrapOrAsyncOption(0);
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<T>', () => {
        const p = unwrapOrAsyncOption(0, Promise.resolve(ofSome(42)));
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('defaultValue may be Promise<T>', () => {
        const fn = unwrapOrAsyncOption(Promise.resolve(0));
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input — returns default', () => {
        const noneOpt: IOption<number> = ofNone();
        const p = unwrapOrAsyncOption(0, Promise.resolve(noneOpt));
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T for non-number types', () => {
        const fn = unwrapOrAsyncOption('fallback');
        const _check: (r: Promise<IOption<string>>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = unwrapOrAsyncOption(0);
        expectTypeOf(fn).toEqualTypeOf<(r: Promise<IOption<number>>) => Promise<number>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const p = unwrapOrAsyncOption(0, Promise.resolve(ofSome(42)));
        expectTypeOf(p).toEqualTypeOf<Promise<number>>();
    });

    it('infers T from the defaultValue literal when Some value is provided later', () => {
        // The defaultValue drives T when the outer Promise hasn't been
        // observed. We assert the type-level relationship rather than the
        // exact structural equality (literal widening is config-dependent).
        const fn = unwrapOrAsyncOption('fallback');
        const _check: (r: Promise<IOption<string>>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
