import { describe, it, expectTypeOf } from 'vitest';
import { from } from './from.js';
import { ok } from '../factories/index.js';
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
});
