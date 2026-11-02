import { describe, it, expectTypeOf } from 'vitest';
import { flattenAsync } from './flattenAsync.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('flattenAsync types', () => {
    it('flattens Promise<IOption<IOption<T>>> to Promise<IOption<T>>', () => {
        const r = flattenAsync(Promise.resolve(ofSome(ofSome(42))));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('handles string-typed inner option', () => {
        const r = flattenAsync(Promise.resolve(ofSome(ofSome('hi'))));
        const _check: Promise<IOption<string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('handles outer None', () => {
        const outerNone: IOption<IOption<number>> = ofNone();
        const r = flattenAsync(Promise.resolve(outerNone));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the application', () => {
        const r = flattenAsync(Promise.resolve(ofSome(ofSome(42))));
        expectTypeOf(r).toEqualTypeOf<Promise<IOption<number>>>();
    });

    it('preserves the inner T through the single-step flatten (no widening)', () => {
        // flattenAsync cannot widen or narrow T — the same T comes
        // out as went in.
        const r = flattenAsync(Promise.resolve(ofSome(ofSome('payload'))));
        const _check: Promise<IOption<string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
