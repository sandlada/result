import { describe, it, expectTypeOf } from 'vitest';
import { existsAsync } from './existsAsync.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('existsAsync types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<boolean>', () => {
        const fn = existsAsync((x: number) => x > 0);
        const _check: (r: Promise<IOption<number>>) => Promise<boolean> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<boolean>', () => {
        const p = existsAsync((x: number) => x > 0, Promise.resolve(ofSome(42)));
        const _check: Promise<boolean> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('predicate may return Promise<boolean>', () => {
        const fn = existsAsync(async (x: number) => x > 0);
        const _check: (r: Promise<IOption<number>>) => Promise<boolean> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input', () => {
        const noneOpt: IOption<number> = ofNone();
        const p = existsAsync((x: number) => x > 0, Promise.resolve(noneOpt));
        const _check: Promise<boolean> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = existsAsync((x: number) => x > 0);
        expectTypeOf(fn).toEqualTypeOf<(r: Promise<IOption<number>>) => Promise<boolean>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const p = existsAsync((x: number) => x > 0, Promise.resolve(ofSome(42)));
        expectTypeOf(p).toEqualTypeOf<Promise<boolean>>();
    });
});
