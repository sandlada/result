import { describe, it, expectTypeOf } from 'vitest';
import { asyncErr } from './asyncErr.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncErr types', () => {
    it('returns Promise<IResultOfT<never, E>>', () => {
        const p = asyncErr('boom');
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<never, string>>>();
    });

    it('infers E from argument', () => {
        const p = asyncErr(new Error('fail'));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<never, Error>>>();
    });

    it('preserves complex error types', () => {
        type AppError = { kind: 'AppError'; message: string };
        const p = asyncErr<AppError>({ kind: 'AppError', message: 'x' });
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<never, AppError>>>();
    });

    // ─── Async policy ──────────────────────────────────────────────────────

    it('does not require a callback argument — the function takes exactly one error', () => {
        const p = asyncErr(1);
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<never, number>>>();
        // @ts-expect-error asyncErr does not accept a callback
        asyncErr('x', () => {});
    });

    it('preserves primitive error types', () => {
        const s = asyncErr('s' as const);
        expectTypeOf(s).toEqualTypeOf<Promise<IResultOfT<never, 's'>>>();
        const n = asyncErr(42 as const);
        expectTypeOf(n).toEqualTypeOf<Promise<IResultOfT<never, 42>>>();
    });

    it('preserves class-based error types through inference', () => {
        class CustomError extends Error {
            public readonly code = 'E_CUSTOM';
        }
        const p = asyncErr(new CustomError('oops'));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<never, CustomError>>>();
    });

    it('the success branch is not reachable on the asyncErr result', async () => {
        // asyncErr always resolves to the failure variant. The union still has a
        // success arm structurally, but its payload type is `never`, so nothing
        // can inhabit it.
        const p = asyncErr('x');
        expectTypeOf<Awaited<typeof p>>().toEqualTypeOf<IResultOfT<never, string>>();
        const r = await p;
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<never>();
        }
    });
});