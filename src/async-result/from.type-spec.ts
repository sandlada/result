import { describe, it, expectTypeOf } from 'vitest';
import { from } from './from.js';
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('from types', () => {
    it('returns AsyncResult<T, E>', () => {
        const ar = from<number, string>(() => Promise.resolve(ok(42) as IResultOfT<number, string>));
        const _check: AsyncResult<number, string> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('returns AsyncResult<T> defaulting E to unknown', () => {
        const ar = from<number>(() => Promise.resolve(ok(42) as IResultOfT<number, never>));
        const _check: AsyncResult<number> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves E from the inner Promise<IResultOfT>', () => {
        // The factory must propagate the error type carried by the thunk.
        const ar = from<number, string>(() => Promise.resolve(err('boom') as IResultOfT<number, string>));
        expectTypeOf(ar).toEqualTypeOf<AsyncResult<number, string>>();
    });

    it('matches the AsyncResult type produced by fromResult', () => {
        const a = from<number, string>(() => Promise.resolve(ok(42) as IResultOfT<number, string>));
        const b = fromResult(ok(42) as IResultOfT<number, string>);
        expectTypeOf(a).toEqualTypeOf<typeof b>();
    });
});
