import { describe, it, expectTypeOf } from 'vitest';
import { map } from './map.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('map types', () => {
    it('curried form returns (o: IOption<A>) => Promise<IOption<B>>', () => {
        const fn = map(async (x: number) => x.toString());
        const _check: (o: IOption<number>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<B>>', () => {
        const r = map(async (x: number) => x * 2, ofSome(21));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves B from the mapper', () => {
        const fn = map(async (s: string) => s.length);
        const _check: (o: IOption<string>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input', () => {
        const r = map(async (x: number) => x, ofNone());
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = map(async (x: number) => x.toString());
        expectTypeOf(fn).toEqualTypeOf<(o: IOption<number>) => Promise<IOption<string>>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const r = map(async (x: number) => x * 2, ofSome(21));
        expectTypeOf(r).toEqualTypeOf<Promise<IOption<number>>>();
    });

    it('preserves A in the input carrier (no narrowing on A)', () => {
        const fn = map(async (s: string) => s.length);
        const _check: (o: IOption<string>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toEqualTypeOf<(o: IOption<string>) => Promise<IOption<number>>>();
    });
});
