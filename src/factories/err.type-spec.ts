import { describe, it, expectTypeOf } from 'vitest';
import { err } from './err.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('err types', () => {
    it('err(error) returns IResultOfT<never, E>', () => {
        const r = err('boom');
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, string>>();
    });

    it('infers E from argument', () => {
        const r = err(new Error('fail'));
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, Error>>();
    });

    it('preserves complex error types', () => {
        type AppError = { kind: 'NotFound'; id: string };
        const r = err<AppError>({ kind: 'NotFound', id: 'x' });
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, AppError>>();
    });

    it('narrowing yields error on failure variant', () => {
        const r = err('boom');
        if (!r.isSuccess) {
            expectTypeOf(r.error).toEqualTypeOf<string>();
        }
    });

    it('discriminated union error types are preserved', () => {
        type E = { kind: 'A' } | { kind: 'B' };
        const r = err<E>({ kind: 'A' });
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, E>>();
    });

    it('class-based error types are preserved', () => {
        class CustomError extends Error {}
        const r = err(new CustomError('custom'));
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, CustomError>>();
    });

    // ─── Value-branch accessibility ────────────────────────────────────────

    it('the success branch is not reachable for err()', () => {
        // err() always returns the failure variant; the success branch of the
        // union is empty at the call site, so `.value` cannot be reached
        // through the success discriminator.
        const r = err('boom');
        if (r.isSuccess) {
            // @ts-expect-error the success branch is empty for err() — no value
            r.value;
        }
    });

    it('explicit <never> TValue argument produces IResultOfT<never, E>', () => {
        // The error type parameter is what callers actually want to vary;
        // supplying `TValue = never` explicitly documents that the success
        // branch is intentionally absent.
        const r = err<never, string>('boom');
        expectTypeOf(r).toEqualTypeOf<IResultOfT<never, string>>();
    });

    it('preserves primitive error types', () => {
        // Primitives must round-trip without widening to `string` or `number`.
        const s = err('s' as const);
        expectTypeOf(s).toMatchTypeOf<IResultOfT<never, 's'>>();
        const n = err(42 as const);
        expectTypeOf(n).toMatchTypeOf<IResultOfT<never, 42>>();
        const b = err(true as const);
        expectTypeOf(b).toMatchTypeOf<IResultOfT<never, true>>();
    });

    it('preserves the literal error key on the failure variant', () => {
        const r = err('boom');
        if (!r.isSuccess) {
            expectTypeOf(r.error).toEqualTypeOf<string>();
            // @ts-expect-error the failure variant has no `value` property
            r.value;
        }
    });
});