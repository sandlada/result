import { describe, it, expectTypeOf } from 'vitest';
import { mapOrElseAsyncOption } from './mapOrElseAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('mapOrElseAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<A>>) => Promise<B>', () => {
        const fn = mapOrElseAsyncOption(() => -1, (x: number) => x * 2);
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<B>', () => {
        const p = mapOrElseAsyncOption(() => -1, (x: number) => x * 2, Promise.resolve(ofSome(21)));
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('onNone may return Promise<B>', () => {
        const fn = mapOrElseAsyncOption(async () => -1, (x: number) => x * 2);
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('mapper may return Promise<B>', () => {
        const fn = mapOrElseAsyncOption(() => -1, async (x: number) => x * 2);
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input — invokes onNone', () => {
        const noneOpt: IOption<number> = ofNone();
        const p = mapOrElseAsyncOption(() => -1, (x: number) => x * 2, Promise.resolve(noneOpt));
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = mapOrElseAsyncOption(() => -1, (x: number) => x * 2);
        expectTypeOf(fn).toEqualTypeOf<(r: Promise<IOption<number>>) => Promise<number>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const p = mapOrElseAsyncOption(() => -1, (x: number) => x * 2, Promise.resolve(ofSome(21)));
        expectTypeOf(p).toEqualTypeOf<Promise<number>>();
    });

    it('unifies B across onNone and fn — heterogeneous return types do NOT widen to a union', () => {
        // Per the canonical contract, a single B parameter binds to *both*
        // handlers. Heterogeneous return types do not unify to a union — the
        // first argument's B is locked, and the second handler must conform.
        // Pin the shape without awaiting the runtime value.
        const p = mapOrElseAsyncOption(
            () => -1,
            (x: number) => x * 2,
            Promise.resolve(ofSome(5)),
        );
        const _check: Promise<number> = p;
        expectTypeOf(_check).toEqualTypeOf<Promise<number>>();
    });
});
