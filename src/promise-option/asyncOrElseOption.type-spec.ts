import { describe, it, expectTypeOf } from 'vitest';
import { asyncOrElseOption } from './asyncOrElseOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('asyncOrElseOption types', () => {
    it('curried form returns (o: IOption<T>) => Promise<IOption<T>>', () => {
        const fn = asyncOrElseOption<number>(async () => ofSome(0));
        const _check: (o: IOption<number>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<T>>', () => {
        const r = asyncOrElseOption<number>(async () => ofSome(0), ofNone());
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T across the recovery path', () => {
        const fn = asyncOrElseOption<string>(async () => ofSome('default'));
        const _check: (o: IOption<string>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofSome input as pass-through', () => {
        const r = asyncOrElseOption<number>(async () => ofSome(0), ofSome(42));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = asyncOrElseOption<number>(async () => ofSome(0));
        expectTypeOf(fn).toEqualTypeOf<(o: IOption<number>) => Promise<IOption<number>>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const r = asyncOrElseOption<number>(async () => ofSome(0), ofNone());
        expectTypeOf(r).toEqualTypeOf<Promise<IOption<number>>>();
    });

    it('preserves T in the recovery (no widening on T across the recovery callback)', () => {
        // The recovery callback's return type drives T — confirm T is locked
        // and propagated correctly across the curried application.
        const fn = asyncOrElseOption<string>(async () => ofSome('default'));
        const _check: (o: IOption<string>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toEqualTypeOf<(o: IOption<string>) => Promise<IOption<string>>>();
    });
});
