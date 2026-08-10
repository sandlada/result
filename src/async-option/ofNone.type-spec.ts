import { describe, it, expectTypeOf } from 'vitest';
import { ofNone } from './ofNone.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('ofNone types', () => {
    it('returns AsyncOption<unknown> by default (contextual typing widens at use site)', () => {
        // Mirrors the sync `ofNone` design: default `T = unknown` so contextual
        // typing flows (`const x: AsyncOption<number> = ofNone()`); without an
        // explicit generic or contextual target, the bare call resolves to
        // `AsyncOption<unknown>`.
        const r = ofNone();
        const _check: AsyncOption<unknown> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('accepts T parameter for typed AsyncOption<T>', () => {
        const r = ofNone<number>();
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
