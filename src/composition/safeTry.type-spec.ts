import { describe, it, expectTypeOf } from 'vitest';
import { safeTry, fromSafeTry } from './safeTry.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('safeTry types', () => {
    it('safeTry yields T on success path', () => {
        function* gen() {
            const x = yield* safeTry(ok(42));
            return x ?? 0;
        }
        const r = fromSafeTry(gen);
        const _check: IResultOfT<number, never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('safeTry yields error on failure path', () => {
        const errVal: IResultOfT<number, string> = err<string>('fail') as IResultOfT<number, string>;
        function* gen() {
            const x = yield* safeTry(errVal);
            return x ?? 0;
        }
        const r = fromSafeTry(gen);
        const _check: IResultOfT<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T from safeTry arguments', () => {
        function* gen() {
            const x = yield* safeTry(ok('hi'));
            return (x ?? '').length;
        }
        const r = fromSafeTry(gen);
        const _check: IResultOfT<number, never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('safeTry return type is T | undefined (value can be undefined after yield)', () => {
        // The yield* result is typed `T | undefined` because the failure path
        // yields and the success path returns T. The undefined reflects that
        // a generator past the yield without a top-level return evaluates to
        // undefined. This is the documented behavior — not a type lie.
        function* gen() {
            const x: number | undefined = yield* safeTry(ok<number>(42));
            return x ?? 0;
        }
        expectTypeOf(gen).toBeFunction();
        const r = fromSafeTry(gen);
        const _check: IResultOfT<number, never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves a generic error type across the chain', () => {
        type AppError = { code: number; message: string };
        function* gen() {
            const x = yield* safeTry(err<AppError>({ code: 404, message: 'Not Found' }) as IResultOfT<string, AppError>);
            return x ?? '';
        }
        const r = fromSafeTry(gen);
        const _check: IResultOfT<string, AppError> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('safeTry only accepts IResultOfT (not raw values)', () => {
        function* gen() {
            // @ts-expect-error safeTry requires IResultOfT<T, E>, not a bare number
            const x = yield* safeTry(42);
            return x ?? 0;
        }
        void gen;
    });

    it('fromSafeTry narrows E on the returned IResultOfT', () => {
        const errVal = err<string>('fail');
        function* gen() {
            const x = yield* safeTry(errVal);
            return x ?? 0;
        }
        const r = fromSafeTry(gen);
        expectTypeOf(r.isSuccess).toEqualTypeOf<true | false>();
        if (r.isSuccess) {
            expectTypeOf(r.value).toBeNumber();
        } else {
            expectTypeOf(r.error).toBeString();
        }
    });
});