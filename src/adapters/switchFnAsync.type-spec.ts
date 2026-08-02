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
});
