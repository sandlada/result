import { describe, it, expectTypeOf } from 'vitest';
import { switchFn } from './switchFn.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('switchFn types', () => {
    it('returns a function from A to IResultOfT<B, unknown> without errorFn', () => {
        const safe = switchFn((x: number) => x * 2);
        expectTypeOf(safe).toEqualTypeOf<(a: number) => IResultOfT<number, unknown>>();
    });

    it('preserves B type from the wrapped function', () => {
        const safe = switchFn((s: string) => s.length);
        expectTypeOf(safe).toEqualTypeOf<(a: string) => IResultOfT<number, unknown>>();
    });

    it('errorFn narrows the error type', () => {
        const safe = switchFn(
            (x: number) => x * 2,
            (e: unknown) => new Error(String(e)),
        );
        expectTypeOf(safe).toEqualTypeOf<(a: number) => IResultOfT<number, Error>>();
    });

    it('errorFn can return any custom error type', () => {
        type AppError = { kind: 'AppError'; message: string };
        const safe = switchFn<number, number, AppError>(
            (x) => x * 2,
            (e) => ({ kind: 'AppError' as const, message: String(e) }),
        );
        expectTypeOf(safe).toEqualTypeOf<(a: number) => IResultOfT<number, AppError>>();
    });

    it('exposes typed input and output on the returned function', () => {
        const safe = switchFn((s: string) => ({ doubled: s + s }));
        type R = ReturnType<typeof safe>;
        expectTypeOf<R>().toMatchTypeOf<IResultOfT<{ doubled: string }, unknown>>();
    });
});
