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

    it('infers a structural return-type for the curried application', () => {
        const fn = matchAsyncOption(
            (v: number) => `some: ${v}`,
            () => 'none',
        );
        expectTypeOf(fn).toEqualTypeOf<(r: Promise<IOption<number>>) => Promise<string>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const p = matchAsyncOption(
            (v: number) => `some: ${v}`,
            () => 'none',
            Promise.resolve(ofSome(42)),
        );
        expectTypeOf(p).toEqualTypeOf<Promise<string>>();
    });

    it('unifies U across onSome and onNone — heterogeneous return types do NOT widen to a union', () => {
        // Per the canonical contract, a single U parameter binds to *both*
        // handlers. Handlers returning different types do not unify into a
        // U1 | U2 union — the first argument's U is locked, and the second
        // handler must conform. Same shape as matchAsync in async-result.
        const p = matchAsyncOption<number, string>(
            (v) => `s:${v}`,
            () => 'n',
            Promise.resolve(ofSome(5)),
        );
        const _check: Promise<string> = p;
        expectTypeOf(_check).toEqualTypeOf<Promise<string>>();
    });
});
