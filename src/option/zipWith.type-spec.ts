import { describe, it, expectTypeOf } from 'vitest';
import { zipWith } from './zipWith.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

describe('zipWith types', () => {
    it('returns a function from (IOption<A>, IOption<B>) to IOption<C>', () => {
        const fn = zipWith((a: number, b: string) => `${a}-${b}`);
        type Fn = typeof fn;
        expectTypeOf<Fn>().toEqualTypeOf<(a: IOption<number>, b: IOption<string>) => IOption<string>>();
    });

    it('preserves A, B, C from signature', () => {
        const fn = zipWith((a: string, b: number) => a.repeat(b));
        const _check: (a: IOption<string>, b: IOption<number>) => IOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('applied to two Some returns Some<C>', () => {
        const r = zipWith((a: number, b: number) => a + b)(ofSome(1), ofSome(2));
        if (r.isSome) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });

    it('applied to None returns None', () => {
        const r = zipWith((a: number, b: number) => a + b)(ofNone(), ofSome(2));
        expectTypeOf(r.isNone).toBeBoolean();
    });
});

describe('zipWith variadic types', () => {
    it('arity 3: heterogeneous per-position types preserved', () => {
        const fn = zipWith(
            (a: number, b: string, c: boolean) => `${a}-${b}-${c}`,
        );
        const _check: (a: IOption<number>, b: IOption<string>, c: IOption<boolean>) => IOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
        const r = fn(ofSome(1), ofSome('x'), ofSome(true));
        if (r.isSome) expectTypeOf(r.value).toEqualTypeOf<string>();
    });

    it('arity 5: per-position types preserved across the tuple', () => {
        const fn = zipWith(
            (a: number, b: string, c: boolean, d: number, e: string) =>
                [a, b, c, d, e] as const,
        );
        const _check: (
            a: IOption<number>, b: IOption<string>, c: IOption<boolean>,
            d: IOption<number>, e: IOption<string>,
        ) => IOption<readonly [number, string, boolean, number, string]> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('arity 7: heterogeneous types preserved', () => {
        const fn = zipWith(
            (a: number, b: string, c: boolean, d: number, e: string, f: boolean, g: number) =>
                [a, b, c, d, e, f, g] as const,
        );
        const r = fn(ofSome(1), ofSome('a'), ofSome(true), ofSome(2), ofSome('b'), ofSome(false), ofSome(3));
        if (r.isSome) {
            expectTypeOf(r.value).toEqualTypeOf<readonly [number, string, boolean, number, string, boolean, number]>();
        }
    });

    it('rejects arity-1 callbacks at the application step', () => {
        // Arity-1 is rejected when the curried result is applied with too few
        // options. The curried form itself is accepted (function-type
        // bivariance lets a 1-arg fn match the arity-2 curried signature with
        // T padded to [unknown, unknown]); the type error fires on the
        // application `ofSome(1)` — the returned function expects 2 args.
        // @ts-expect-error — arity 1 is not allowed (application step rejects 1 option)
        const _bad = zipWith((x: number) => x)(ofSome(1));
        void _bad;
    });

    it('rejects mismatched IOption type at a position', () => {
        const fn = zipWith((a: number, b: string) => `${a}-${b}`);
        // @ts-expect-error — second slot expects IOption<string>, given IOption<number>
        const _bad = fn(ofSome(1), ofSome(2) as IOption<number>);
        void _bad;
    });

    it('documents the bivariance limitation', () => {
        // TypeScript's function-type bivariance means a 0-arg `fn` is assignable
        // to `(a, b) => R` (extra params ignored). This means the arity-2
        // curried overload accepts `() => 42` at the type level. The runtime
        // guard `if (options.length < 2) return ofNone()` catches misuse.
        //
        // The arity constraint IS enforced for the *options* count: passing
        // 0 options to a direct-form call, or 1 option to a curried result
        // expecting 2, are both type errors. See the arity-1 test above.
        const fn = zipWith(() => 42);
        // Runtime: this returns a curried function (no error at the type level).
        // Calling it with 2 options would return IOption<number>:
        const r = fn(ofSome(1), ofSome(2));
        if (r.isSome) expectTypeOf(r.value).toEqualTypeOf<number>();
    });
});
