import { describe, it, expectTypeOf } from 'vitest';
import { tapErrContext, type ErrContext } from './tapErrContext.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { PathStack } from './ctx.js';

describe('tapErrContext types', () => {
    it('ErrContext has path property', () => {
        const ctx: ErrContext = { path: [] };
        const path: PathStack = ctx.path;
        expectTypeOf(path.length).toBeNumber();
    });

    it('curried form takes (T, E) generics', () => {
        const fn = tapErrContext<number, string>((e) => { /* log */ });
        // Type assignment verifies the function signature.
        const _check: (r: IResultOfT<number, string>) => IResultOfT<number, string> | Promise<IResultOfT<number, string>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns IResultOfT<T, E> | Promise<...>', () => {
        const errVal: IResultOfT<number, string> = err('boom') as IResultOfT<number, string>;
        const r: IResultOfT<number, string> | Promise<IResultOfT<number, string>> = tapErrContext((e: string) => { /* log */ }, errVal);
        expectTypeOf(r).toBeObject();
    });

    it('passes through success unchanged', () => {
        const r = tapErrContext((e: string) => { /* log */ }, ok(42));
        const _check: IResultOfT<number, string> = r as IResultOfT<number, string>;
        expectTypeOf(_check).toBeObject();
    });

    it('callback receives (error, ErrContext)', () => {
        const fn = (e: string, ctx: ErrContext) => {
            expectTypeOf(e).toEqualTypeOf<string>();
            expectTypeOf(ctx.path.length).toBeNumber();
        };
        const errVal: IResultOfT<number, string> = err('boom') as IResultOfT<number, string>;
        tapErrContext(fn, errVal);
    });
});
