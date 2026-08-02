import { describe, it, expectTypeOf } from 'vitest';
import { fromThrowable } from './fromThrowable.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('fromThrowable types', () => {
    it('returns a function returning IResultOfT<T, unknown> without errorFn', () => {
        const safe = fromThrowable(JSON.parse);
        type R = ReturnType<typeof safe>;
        expectTypeOf<R>().toExtend<IResultOfT<unknown, unknown>>();
    });

    it('preserves argument types of the wrapped function', () => {
        const safe = fromThrowable((x: number, y: number) => x + y);
        type Args = Parameters<typeof safe>;
        expectTypeOf<Args>().toEqualTypeOf<[number, number]>();
        type R = ReturnType<typeof safe>;
        expectTypeOf<R>().toExtend<IResultOfT<number, unknown>>();
    });

    it('errorFn narrows the error type', () => {
        const safe = fromThrowable(
            (s: string) => JSON.parse(s),
            (e: unknown) => new Error(String(e)),
        );
        type R = ReturnType<typeof safe>;
        expectTypeOf<R>().toExtend<IResultOfT<unknown, Error>>();
    });

    it('errorFn can return any custom error type', () => {
        type AppError = { kind: 'AppError'; message: string };
        const safe = fromThrowable(
            (s: string) => JSON.parse(s),
            (e: unknown): AppError => ({ kind: 'AppError' as const, message: String(e) }),
        );
        type R = ReturnType<typeof safe>;
        const _check: IResultOfT<unknown, AppError> = null as unknown as R;
        expectTypeOf(_check).toBeObject();
    });
});
