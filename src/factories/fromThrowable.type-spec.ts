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

    // ─── Default-error and mapper contract ─────────────────────────────────

    it('default E is `unknown` when errorFn is omitted', () => {
        const safe = fromThrowable((x: number) => x);
        type R = ReturnType<typeof safe>;
        expectTypeOf<R>().toExtend<IResultOfT<number, unknown>>();
    });

    it('the wrapper preserves zero-argument function shape', () => {
        const safe = fromThrowable(() => 42);
        type Args = Parameters<typeof safe>;
        expectTypeOf<Args>().toEqualTypeOf<[]>();
        type R = ReturnType<typeof safe>;
        expectTypeOf<R>().toExtend<IResultOfT<number, unknown>>();
    });

    it('the wrapper preserves rest-argument function shape', () => {
        const safe = fromThrowable((...args: number[]) => args.reduce((a, b) => a + b, 0));
        type Args = Parameters<typeof safe>;
        expectTypeOf<Args>().toEqualTypeOf<number[]>();
        type R = ReturnType<typeof safe>;
        expectTypeOf<R>().toExtend<IResultOfT<number, unknown>>();
    });

    it('errorFn argument is implicitly `unknown`', () => {
        const safe = fromThrowable(
            () => 1,
            (e) => String(e), // e is implicitly unknown here
        );
        type R = ReturnType<typeof safe>;
        expectTypeOf<R>().toExtend<IResultOfT<number, string>>();
    });

    it('rejects a mapper that returns the wrong error type when E is fixed', () => {
        type AppErr = { kind: 'App'; message: string };
        // @ts-expect-error mapper must return AppErr, not string
        fromThrowable<[], number, AppErr>(() => 1, (): string => 'wrong');
    });

    it('the wrapper function preserves the original function\'s return type', () => {
        interface User { id: number; name: string; }
        const safe = fromThrowable((id: number): User => ({ id, name: 'Alice' }));
        type R = ReturnType<typeof safe>;
        expectTypeOf<R>().toExtend<IResultOfT<User, unknown>>();
    });
});