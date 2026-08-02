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

    it('without an errorFn, E defaults to unknown (confirmed by IResultOfT<B, unknown>)', () => {
        const safe = switchFn((x: number) => x);
        type R = ReturnType<typeof safe>;
        expectTypeOf<R>().toEqualTypeOf<IResultOfT<number, unknown>>();
    });

    it('errorFn can return a numeric error type', () => {
        const safe = switchFn(
            (x: number) => x,
            (_e: unknown): number => 42,
        );
        expectTypeOf(safe).toEqualTypeOf<(a: number) => IResultOfT<number, number>>();
    });

    it('errorFn receives the thrown `unknown` argument', () => {
        // Compile-time check only — errorFn(e: unknown) must compile without an `any` cast at the call site.
        const safe = switchFn(
            (x: number) => x,
            (e: unknown): string => (e instanceof Error ? e.message : String(e)),
        );
        expectTypeOf(safe).toEqualTypeOf<(a: number) => IResultOfT<number, string>>();
    });

    it('returns IResultOfT union (success or failure) at the call site', () => {
        const safe = switchFn((x: number) => x * 2);
        const r: IResultOfT<number, unknown> = safe(2);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, unknown>>();
    });

    it('errorFn with generic E inferred from the literal return type', () => {
        // Pinned via explicit generic so inference is checked at the call site.
        const safe = switchFn<number, number, 'BAD'>(
            (x) => x,
            () => 'BAD' as const,
        );
        expectTypeOf(safe).toEqualTypeOf<(a: number) => IResultOfT<number, 'BAD'>>();
    });
});
