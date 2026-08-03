import { describe, it, expectTypeOf } from 'vitest';
import { fromPromise } from './fromPromise.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('fromPromise types', () => {
    it('returns AsyncOption<T> from a thunk returning Promise<T>', () => {
        const r = fromPromise(() => Promise.resolve(42));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers T from the thunk return', () => {
        const r = fromPromise(() => Promise.resolve('hi'));
        const _check: AsyncOption<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers object T from the thunk return', () => {
        const r = fromPromise(() => Promise.resolve({ id: 1, name: 'a' }));
        const _check: AsyncOption<{ id: number; name: string }> = r;
        expectTypeOf(_check).toBeObject();
    });
});
