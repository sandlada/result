import { describe, it, expectTypeOf } from 'vitest';
import { containsAsyncOption } from './containsAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('containsAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<boolean>', () => {
        const fn = containsAsyncOption(42);
        const _check: (r: Promise<IOption<number>>) => Promise<boolean> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<boolean>', () => {
        const p = containsAsyncOption(42, Promise.resolve(ofSome(42)));
        const _check: Promise<boolean> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T for the value parameter', () => {
        const fn = containsAsyncOption('hello');
        const _check: (r: Promise<IOption<string>>) => Promise<boolean> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input', () => {
        const noneOpt: IOption<number> = ofNone();
        const p = containsAsyncOption(0, Promise.resolve(noneOpt));
        const _check: Promise<boolean> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = containsAsyncOption(42);
        expectTypeOf(fn).toEqualTypeOf<(r: Promise<IOption<number>>) => Promise<boolean>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const p = containsAsyncOption(42, Promise.resolve(ofSome(42)));
        expectTypeOf(p).toEqualTypeOf<Promise<boolean>>();
    });
});
