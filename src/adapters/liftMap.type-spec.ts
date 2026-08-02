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
});
