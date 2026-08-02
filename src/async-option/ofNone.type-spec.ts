import { describe, it, expectTypeOf } from 'vitest';
import { ofNone } from './ofNone.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('ofNone types', () => {
    it('returns AsyncOption<never> by default', () => {
        const r = ofNone();
        const _check: AsyncOption<never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('accepts T parameter for typed AsyncOption<T>', () => {
        const r = ofNone<number>();
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
