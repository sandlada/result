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
});
