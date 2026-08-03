import { describe, it, expectTypeOf } from 'vitest';
import { match } from './match.js';
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('match types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => Promise<U>', () => {
        const fn = match({
            ok: (v: number) => `got ${v}`,
            err: (e: string) => `error: ${e}`,
        });
        const _check: (ar: AsyncResult<number, string>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<U>', () => {
        const r = match(
            { ok: (x: number) => `got ${x}`, err: (e: string) => `error: ${e}` },
            fromResult(ok(42) as unknown as IResultOfT<number, string>),
        );
        expectTypeOf(r).toEqualTypeOf<Promise<string>>();
    });

    it('requires a single U across ok and err handlers (no union inference)', () => {
        // CONTRACT GAP (pinned): `match<T, E, U>` binds one `U` for both
        // handlers. Handlers returning different types do NOT unify into
        // `U1 | U2` — inference locks `U` to the `ok` handler's return and the
        // `err` handler then fails to assign. Callers must widen `U` themselves
        // (explicit type argument or a widened return annotation). Pinned
        // rather than "fixed" because changing this would alter the public API.
        match(
            {
                ok: (x: number) => x.toString(),
                // @ts-expect-error (e: string) => number is not assignable when U is fixed to string
                err: (e: string) => e.length,
            },
            fromResult(ok(42) as IResultOfT<number, string>),
        );

        // Supplying the union as U explicitly is the supported way to mix.
        const widened = match<number, string, string | number>(
            { ok: (x: number) => x.toString(), err: (e: string) => e.length },
            fromResult(ok(42) as IResultOfT<number, string>),
        );
        expectTypeOf(widened).toEqualTypeOf<Promise<string | number>>();
    });

    it('accepts Promise<U> return types from handlers', () => {
        // Same single-`U` rule applies to the `U | Promise<U>` form.
        match(
            {
                ok: (x: number) => Promise.resolve(x.toString()),
                // @ts-expect-error Promise<number> is not assignable when U is fixed to string
                err: (e: string) => Promise.resolve(e.length),
            },
            fromResult(ok(1) as IResultOfT<number, string>),
        );

        // Homogeneous Promise-returning handlers are accepted and unwrap to Promise<U>.
        const r = match(
            { ok: (x: number) => Promise.resolve(x.toString()), err: (e: string) => Promise.resolve(e) },
            fromResult(ok(1) as IResultOfT<number, string>),
        );
        expectTypeOf(r).toEqualTypeOf<Promise<string>>();
    });
});
