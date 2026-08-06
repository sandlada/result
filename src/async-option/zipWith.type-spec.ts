import { describe, it, expectTypeOf } from 'vitest';
import { zipWith } from './zipWith.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('zipWith types', () => {
    it('curried form returns (ao1: AsyncOption<A>, ao2: AsyncOption<B>) => AsyncOption<C>', () => {
        const fn = zipWith((a: number, b: string) => `${a}-${b}`);
        const _check: (ao1: AsyncOption<number>, ao2: AsyncOption<string>) => AsyncOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncOption<C>', () => {
        const r = zipWith((a: number, b: number) => a + b, ofSome(1), ofSome(2));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('fn may return Promise<C>', () => {
        const fn = zipWith(async (a: number, b: number) => a + b);
        const _check: (ao1: AsyncOption<number>, ao2: AsyncOption<number>) => AsyncOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('handles None source', () => {
        const r = zipWith((a: number, b: number) => a + b, ofNone<number>(), ofSome(2));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });
});

describe('zipWith variadic types', () => {
    it('arity 3: per-position types preserved', () => {
        const fn = zipWith(
            (a: number, b: string, c: boolean) => `${a}-${b}-${c}`,
        );
        const _check: (
            ao1: AsyncOption<number>, ao2: AsyncOption<string>, ao3: AsyncOption<boolean>,
        ) => AsyncOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('arity 5: per-position types preserved', () => {
        const fn = zipWith(
            (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e,
        );
        const _check: (
            ao1: AsyncOption<number>, ao2: AsyncOption<number>, ao3: AsyncOption<number>,
            ao4: AsyncOption<number>, ao5: AsyncOption<number>,
        ) => AsyncOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('arity 7: heterogeneous types preserved', () => {
        const fn = zipWith(
            (a: number, b: string, c: boolean, d: number, e: string, f: boolean, g: number) =>
                `${a}-${b}-${c}-${d}-${e}-${f}-${g}`,
        );
        const _check: (
            ao1: AsyncOption<number>, ao2: AsyncOption<string>, ao3: AsyncOption<boolean>,
            ao4: AsyncOption<number>, ao5: AsyncOption<string>, ao6: AsyncOption<boolean>,
            ao7: AsyncOption<number>,
        ) => AsyncOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('rejects arity-1 callbacks at the application step', () => {
        // Arity-1 is rejected when the curried result is applied with too few
        // operands. The curried form itself is accepted (function-type
        // bivariance lets a 1-arg fn match the arity-2 curried signature with
        // T padded to [unknown, unknown]); the type error fires on the
        // application `ofSome(1)` — the returned function expects 2 args.
        // @ts-expect-error — arity 1 is not allowed (application step rejects 1 operand)
        const _bad = zipWith((x: number) => x)(ofSome(1));
        void _bad;
    });

    it('documents the bivariance limitation', () => {
        // TypeScript's function-type bivariance means a 0-arg `fn` is assignable
        // to `(a, b) => R` (extra params ignored). This means the arity-2
        // curried overload accepts `() => 42` at the type level. The runtime
        // guard `if (aos.length < 2) return { run: async () => ofNone() }`
        // catches misuse.
        //
        // The arity constraint IS enforced for the *operands* count: passing
        // 0 operands to a direct-form call, or 1 operand to a curried result
        // expecting 2, are both type errors. See the arity-1 test above.
        const fn = zipWith(() => 42);
        // Runtime: this returns a curried function (no error at the type level).
        // Calling it with 2 operands would return AsyncOption<number>:
        const r = fn(ofSome(1), ofSome(2));
        expectTypeOf(r).toEqualTypeOf<AsyncOption<number>>();
    });
});
