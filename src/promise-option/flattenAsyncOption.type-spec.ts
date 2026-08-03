import { describe, it, expectTypeOf } from 'vitest';
import { flattenAsyncOption } from './flattenAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('flattenAsyncOption types', () => {
    it('flattens Promise<IOption<IOption<T>>> to Promise<IOption<T>>', () => {
        const r = flattenAsyncOption(Promise.resolve(ofSome(ofSome(42))));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('handles string-typed inner option', () => {
        const r = flattenAsyncOption(Promise.resolve(ofSome(ofSome('hi'))));
        const _check: Promise<IOption<string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('handles outer None', () => {
        const outerNone: IOption<IOption<number>> = ofNone();
        const r = flattenAsyncOption(Promise.resolve(outerNone));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the application', () => {
        const r = flattenAsyncOption(Promise.resolve(ofSome(ofSome(42))));
        expectTypeOf(r).toEqualTypeOf<Promise<IOption<number>>>();
    });

    it('preserves the inner T through the single-step flatten (no widening)', () => {
        // flattenAsyncOption cannot widen or narrow T — the same T comes
        // out as went in.
        const r = flattenAsyncOption(Promise.resolve(ofSome(ofSome('payload'))));
        const _check: Promise<IOption<string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
