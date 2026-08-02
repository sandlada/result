import { describe, it, expectTypeOf } from 'vitest';
import { asyncMapOption } from './asyncMapOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('asyncMapOption types', () => {
    it('curried form returns (o: IOption<A>) => Promise<IOption<B>>', () => {
        const fn = asyncMapOption(async (x: number) => x.toString());
        const _check: (o: IOption<number>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<B>>', () => {
        const r = asyncMapOption(async (x: number) => x * 2, ofSome(21));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves B from the mapper', () => {
        const fn = asyncMapOption(async (s: string) => s.length);
        const _check: (o: IOption<string>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input', () => {
        const r = asyncMapOption(async (x: number) => x, ofNone());
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
