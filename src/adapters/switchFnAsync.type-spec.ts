import { describe, it, expectTypeOf } from 'vitest';
import { switchFnAsync } from './switchFnAsync.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('switchFnAsync types', () => {
    it('returns a function from A to Promise<IResultOfT<B, unknown>> without errorFn', () => {
        const safe = switchFnAsync(async (x: number) => x * 2);
        expectTypeOf(safe).toEqualTypeOf<(a: number) => Promise<IResultOfT<number, unknown>>>();
    });

    it('preserves B type from the wrapped async function', () => {
        const safe = switchFnAsync(async (s: string) => s.length);
        expectTypeOf(safe).toEqualTypeOf<(a: string) => Promise<IResultOfT<number, unknown>>>();
    });

    it('errorFn narrows the error type', () => {
        const safe = switchFnAsync(
            async (x: number) => x * 2,
            (e: unknown) => new Error(String(e)),
        );
        expectTypeOf(safe).toEqualTypeOf<(a: number) => Promise<IResultOfT<number, Error>>>();
    });

    it('accepts sync return values inside the wrapped function', () => {
        const safe = switchFnAsync((x: number) => x * 2);
        expectTypeOf(safe).toEqualTypeOf<(a: number) => Promise<IResultOfT<number, unknown>>>();
    });

    it('errorFn can return any custom error type', () => {
        type AppError = { kind: 'AppError'; message: string };
        const safe = switchFnAsync<number, number, AppError>(
            async (x) => x * 2,
            (e) => ({ kind: 'AppError' as const, message: String(e) }),
        );
        expectTypeOf(safe).toEqualTypeOf<(a: number) => Promise<IResultOfT<number, AppError>>>();
    });

    it('Promise is wrapped exactly once (no double-Promise leakage)', () => {
        const safe = switchFnAsync(async (x: number) => x);
        type R = ReturnType<typeof safe>;
        // ReturnType is Promise<IResultOfT<...>> — not Promise<Promise<IResultOfT<...>>>
        expectTypeOf<R>().toEqualTypeOf<Promise<IResultOfT<number, unknown>>>();
    });

    it('errorFn with literal `as const` return infers literal E', () => {
        const safe = switchFnAsync(
            async (x: number) => x,
            (): 'BOOM' => 'BOOM',
        );
        expectTypeOf(safe).toEqualTypeOf<(a: number) => Promise<IResultOfT<number, 'BOOM'>>>();
    });

    it('the input function signature accepts a single positional argument', () => {
        // Compile-time pin: the produced function takes a single A argument.
        const safe = switchFnAsync(async (x: number) => x);
        // One positional argument is required.
        safe(1);
        // @ts-expect-error Two arguments are not accepted by the produced function.
        safe(1, 2);
        expectTypeOf(safe).toEqualTypeOf<(a: number) => Promise<IResultOfT<number, unknown>>>();
    });
});
