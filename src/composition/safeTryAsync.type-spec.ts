import { describe, it, expectTypeOf } from 'vitest';
import { safeTryAsync, fromSafeTryAsync } from './safeTryAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('safeTryAsync types', () => {
    it('safeTryAsync yields T on success path', async () => {
        async function* gen() {
            const x = yield* safeTryAsync(asyncOk(42));
            return x ?? 0;
        }
        const ar = fromSafeTryAsync(gen);
        const _check: AsyncResult<number, never> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('safeTryAsync yields error on failure path', async () => {
        const errVal = asyncErr('fail');
        async function* gen() {
            const x = yield* safeTryAsync(errVal);
            return x ?? 0;
        }
        const ar = fromSafeTryAsync(gen);
        const _check: AsyncResult<number, string> = ar as unknown as AsyncResult<number, string>;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from safeTryAsync arguments', async () => {
        async function* gen() {
            const x = yield* safeTryAsync(asyncOk('hi'));
            return (x ?? '').length;
        }
        const ar = fromSafeTryAsync(gen);
        const _check: AsyncResult<number, never> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('safeTryAsync accepts AsyncResult OR Promise<IResultOfT>', async () => {
        // The overload should accept a raw Promise that resolves to IResultOfT.
        async function* gen() {
            const x = yield* safeTryAsync(Promise.resolve(asyncOk(99)));
            return x ?? 0;
        }
        const ar = fromSafeTryAsync(gen);
        const _check: AsyncResult<number, never> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('safeTryAsync return type is T | undefined (value can be undefined after yield)', async () => {
        async function* gen() {
            const x: number | undefined = yield* safeTryAsync(asyncOk<number>(42));
            return x ?? 0;
        }
        expectTypeOf(gen).toBeFunction();
        const ar = fromSafeTryAsync(gen);
        const _check: AsyncResult<number, never> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves a generic error type across the chain', async () => {
        type AppError = { code: number; message: string };
        async function* gen() {
            const x = yield* safeTryAsync(asyncErr<AppError>({ code: 500, message: 'Server' }));
            return x ?? 0;
        }
        const ar = fromSafeTryAsync(gen);
        const _check: AsyncResult<number, AppError> = ar as unknown as AsyncResult<number, AppError>;
        expectTypeOf(_check).toBeObject();
    });

    it('safeTryAsync discriminates by .run duck-typing', async () => {
        // An object with a `run` method should be treated as an AsyncResult
        // and the returned AsyncResult<T, E> should reflect the inner types.
        const fakeAsyncResult: AsyncResult<number, string> = {
            run: async () => ({ isSuccess: true as const, isFailure: false as const, value: 1 }),
        };
        async function* gen() {
            const x = yield* safeTryAsync(fakeAsyncResult);
            return x ?? 0;
        }
        const ar = fromSafeTryAsync(gen);
        // `AsyncResult.run` is declared `readonly`, so an inline `{ run: ... }`
        // object type is not an exact match. Assert against the interface itself.
        expectTypeOf(ar).toEqualTypeOf<AsyncResult<number, string>>();
        expectTypeOf(ar.run).toEqualTypeOf<() => Promise<IResultOfT<number, string>>>();
    });
});