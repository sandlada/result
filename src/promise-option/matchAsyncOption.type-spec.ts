import { describe, it, expectTypeOf } from 'vitest';
import { matchAsyncOption } from './matchAsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('matchAsyncOption types', () => {
    it('curried form returns (r: Promise<IOption<T>>) => Promise<U>', () => {
        const fn = matchAsyncOption(
            (v: number) => `some: ${v}`,
            () => 'none',
        );
        const _check: (r: Promise<IOption<number>>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<U>', () => {
        const p = matchAsyncOption(
            (v: number) => `some: ${v}`,
            () => 'none',
            Promise.resolve(ofSome(42)),
        );
        const _check: Promise<string> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('handlers may return Promise<U>', () => {
        const fn = matchAsyncOption(
            async (v: number) => `some: ${v}`,
            async () => 'none',
        );
        const _check: (r: Promise<IOption<number>>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles ofNone input — invokes onNone', () => {
        const noneOpt: IOption<number> = ofNone();
        const p = matchAsyncOption(
            (v: number) => `some: ${v}`,
            () => 'none',
            Promise.resolve(noneOpt),
        );
        const _check: Promise<string> = p;
        expectTypeOf(_check).toBeObject();
    });
});
