import { describe, it, expectTypeOf } from 'vitest';
import { fromPromise } from './fromPromise.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('fromPromise types', () => {
    it('returns AsyncResult<T, E> from () => Promise<T>', () => {
        const ar = fromPromise<number, string>(() => Promise.resolve(42), () => 'boom');
        const _check: AsyncResult<number, string> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('returns AsyncResult<T> defaulting E to unknown', () => {
        const ar = fromPromise(() => Promise.resolve(42));
        const _check: AsyncResult<number> = ar;
        expectTypeOf(_check).toBeObject();
    });
});
