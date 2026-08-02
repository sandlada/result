import { describe, it, expectTypeOf } from 'vitest';
import { mapAsyncOption } from './mapAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('mapAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<IOption<U>>', () => {
        const fn = mapAsyncOption((x: number) => x.toString());
        const _check: (r: Promise<IOption<number>>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<U>>', () => {
        const r = mapAsyncOption((x: number) => x * 2, Promise.resolve(ofSome(21)));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('mapper may return Promise<U>', () => {
        const fn = mapAsyncOption(async (s: string) => s.length);
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves U from the mapper', () => {
        const fn = mapAsyncOption((s: string) => s.length);
        const _check: (r: Promise<IOption<string>>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input as None', () => {
        const noneOpt: IOption<number> = ofNone();
        const r = mapAsyncOption((x: number) => x, Promise.resolve(noneOpt));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
