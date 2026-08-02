import { describe, it, expectTypeOf } from 'vitest';
import { asyncBindOption } from './asyncBindOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('asyncBindOption types', () => {
    it('curried form returns (opt: IOption<T>) => Promise<IOption<U>>', () => {
        const fn = asyncBindOption(async (x: number) => ofSome(x.toString()));
        const _check: (opt: IOption<number>) => Promise<IOption<string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<IOption<U>>', () => {
        const r = asyncBindOption(async (x: number) => ofSome(x * 2), ofSome(21));
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves U from the wrapped function', () => {
        const fn = asyncBindOption(async (s: string) => ofSome(s.length));
        const _check: (opt: IOption<string>) => Promise<IOption<number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles IOption<never> input from ofNone', () => {
        const r = asyncBindOption(async (x: number) => ofSome(x), ofNone());
        const _check: Promise<IOption<number>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
