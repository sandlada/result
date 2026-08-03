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

    it('curried form accepts async callback', () => {
        const fn = tapErrContext<number, string>(async (e) => {
            // async callback is allowed; its return is awaited.
            expectTypeOf(e).toEqualTypeOf<string>();
        });
        expectTypeOf(fn).toBeFunction();
    });

    it('ErrContext.path is ReadonlyArray (cannot mutate)', () => {
        const ctx: ErrContext = { path: ['a', 'b'] };
        // The compiler rejects mutating methods on PathStack.
        // @ts-expect-error - readonly arrays do not support push
        ctx.path.push('c');
        // @ts-expect-error - readonly arrays do not support splice
        ctx.path.splice(0, 1);
        // Index access works but produces PathSegment (which can be undefined).
        const first = ctx.path[0];
        if (first !== undefined) {
            expectTypeOf(first).toEqualTypeOf<string | number>();
        }
    });

    it('preserves narrowed generic types in callback', () => {
        type CustomErr = { kind: 'network'; status: number };
        const errVal: IResultOfT<string, CustomErr> = err({ kind: 'network', status: 500 }) as IResultOfT<string, CustomErr>;
        tapErrContext((e) => {
            // The error parameter type is narrowed to CustomErr.
            expectTypeOf(e.kind).toEqualTypeOf<'network'>();
            expectTypeOf(e.status).toBeNumber();
        }, errVal);
    });
});
