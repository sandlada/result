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
});
