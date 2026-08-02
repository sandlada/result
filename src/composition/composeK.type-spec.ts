import { describe, it, expectTypeOf } from 'vitest';
import { composeK } from './composeK.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('composeK types', () => {
    it('composes 2 functions: (A) => IResultOfT<C, E>', () => {
        const f = composeK(
            (x: number) => ok(x * 2),
            (x: number) => x > 50 ? ok(x) : err<string>('too small'),
        );
        const _check: (a: number) => IResultOfT<number, string> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('composes 3 functions', () => {
        const f = composeK(
            (x: number) => ok(x * 2),
            (x: number) => ok(x + 1),
            (x: number) => ok(x.toString()),
        );
        const _check: (a: number) => IResultOfT<string, never> = f;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves E across all composed functions', () => {
        type AppError = { kind: 'AppError'; message: string };
        const f1 = (x: number): IResultOfT<number, AppError> => ok(x * 2) as IResultOfT<number, AppError>;
        const f2 = (x: number): IResultOfT<number, AppError> => ok(x + 1) as IResultOfT<number, AppError>;
        const f = composeK(f1, f2);
        const _check: (a: number) => IResultOfT<number, AppError> = f;
        expectTypeOf(_check).toBeFunction();
    });
});
