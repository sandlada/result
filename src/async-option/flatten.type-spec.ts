import { describe, it, expectTypeOf } from 'vitest';
import { flatten } from './flatten.js';
import { ofSome } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('flatten types', () => {
    it('flattens AsyncOption<AsyncOption<T>> to AsyncOption<T>', () => {
        const r = flatten(ofSome(ofSome(42)));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('handles string-typed inner option', () => {
        const r = flatten(ofSome(ofSome('hi')));
        const _check: AsyncOption<string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
