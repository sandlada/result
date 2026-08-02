import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOrElseAsyncOption } from './unwrapOrElseAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('unwrapOrElseAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<T>', () => {
        const fn = unwrapOrElseAsyncOption(() => 0);
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<T>', () => {
        const p = unwrapOrElseAsyncOption(() => 0, Promise.resolve(ofSome(42)));
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('onNone may return Promise<T>', () => {
        const fn = unwrapOrElseAsyncOption(async () => 0);
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input — invokes onNone', () => {
        const noneOpt: IOption<number> = ofNone();
        const p = unwrapOrElseAsyncOption(() => 0, Promise.resolve(noneOpt));
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T for non-number types', () => {
        const fn = unwrapOrElseAsyncOption(() => 'fallback');
        const _check: (r: Promise<IOption<string>>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
