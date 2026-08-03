import { describe, it, expectTypeOf } from 'vitest';
import { bindAsyncOption } from './bindAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('bindAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<IOption<U>>', () => {
        const fn = bindAsyncOption((x: number) => Promise.resolve(ofSome(x * 2)));
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<U>>', () => {
        const r = bindAsyncOption(
            (x: number) => Promise.resolve(ofSome(x * 2)),
            Promise.resolve(ofSome(21)),
        );
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('fn may return IOption<U> synchronously', () => {
        const fn = bindAsyncOption((s: string) => ofSome(s.length));
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves U from the wrapped function', () => {
        const fn = bindAsyncOption((s: string) => Promise.resolve(ofSome(s.length)));
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('infers a structural return-type for the curried application', () => {
        // Ensure the curried result is exactly the documented function shape.
        const fn = bindAsyncOption((x: number) => Promise.resolve(ofSome(x * 2)));
        expectTypeOf(fn).toEqualTypeOf<(r: Promise<IOption<number>>) => Promise<IOption<number>>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const r = bindAsyncOption(
            (x: number) => Promise.resolve(ofSome(x * 2)),
            Promise.resolve(ofSome(21)),
        );
        expectTypeOf(r).toEqualTypeOf<Promise<IOption<number>>>();
    });

    it('preserves T parameter as the input carrier type', () => {
        // The promise input is `Promise<IOption<string>>` — T is independent
        // of the result U.
        const fn = bindAsyncOption((s: string) => Promise.resolve(ofSome(s.length)));
        const _carrier: Promise<IOption<string>> = Promise.resolve(ofSome('hi'));
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<number>> = fn;
        void _carrier;
        expectTypeOf(_check).toBeFunction();
    });
});
