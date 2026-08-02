import { describe, it, expectTypeOf } from 'vitest';
import { liftMap } from './liftMap.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('liftMap types', () => {
    it('curried form returns a function mapping IResultOfT<A, E> to IResultOfT<B, E>', () => {
        const fn = liftMap((x: number) => x.toString());
        expectTypeOf(fn).toMatchTypeOf<<E>(r: IResultOfT<number, E>) => IResultOfT<string, E>>();
    });

    it('direct form returns IResultOfT<B, never> for ok source', () => {
        const r = liftMap((x: number) => x * 2, ok(21));
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, never>>();
    });

    it('preserves E across the transformation', () => {
        type AppError = { kind: 'AppError'; message: string };
        const r = liftMap((x: number) => x.toString(), err<AppError>({ kind: 'AppError', message: 'x' }));
        expectTypeOf(r).toMatchTypeOf<IResultOfT<string, AppError>>();
    });

    it('preserves the value type from the wrapped function', () => {
        const r = liftMap((s: string) => s.length, ok('hello'));
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, never>>();
    });

    it('curried form is polymorphic in E', () => {
        const lifted = liftMap((x: number) => x);
        const a = lifted(ok(1));
        const b = lifted(err<string>('e'));
        // a is IResultOfT<number, never>; b is IResultOfT<number, string>
        expectTypeOf(a).toMatchTypeOf<IResultOfT<number, never>>();
        expectTypeOf(b).toMatchTypeOf<IResultOfT<number, string>>();
    });

    it('direct form lifts the result type B from the function return', () => {
        const r = liftMap((_x: number) => ({ doubled: 'two' }), ok(1));
        expectTypeOf(r).toMatchTypeOf<IResultOfT<{ doubled: string }, never>>();
    });

    it('E parameter is preserved across multiple invocations of curried form', () => {
        type AppErr = { code: number };
        const lifted = liftMap((x: number) => x);
        const e1: IResultOfT<number, AppErr> = err<AppErr>({ code: 1 });
        const e2: IResultOfT<number, AppErr> = err<AppErr>({ code: 2 });
        const a = lifted(e1);
        const b = lifted(e2);
        expectTypeOf(a).toMatchTypeOf<IResultOfT<number, AppErr>>();
        expectTypeOf(b).toMatchTypeOf<IResultOfT<number, AppErr>>();
    });

    it('curried form passes through the input ResultOfT failure unchanged', () => {
        const lifted = liftMap((x: number) => x.toString());
        const e: IResultOfT<number, Error> = err(new Error('boom'));
        const out = lifted(e);
        expectTypeOf(out).toMatchTypeOf<IResultOfT<string, Error>>();
    });
});
