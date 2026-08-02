import { describe, it, expectTypeOf } from 'vitest';
import { from } from './from.js';
import { ofSome } from '../option/index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('from types', () => {
    it('returns AsyncOption<T> from a thunk returning Promise<IOption<T>>', () => {
        const r = from(() => Promise.resolve(ofSome(42)));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers T from the thunk return', () => {
        const r = from(() => Promise.resolve(ofSome('hi')));
        const _check: AsyncOption<string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
