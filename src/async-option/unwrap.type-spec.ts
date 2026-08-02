import { describe, it, expectTypeOf } from 'vitest';
import { unwrap } from './unwrap.js';
import { ofSome } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('unwrap types', () => {
    it('returns Promise<T>', () => {
        const p = unwrap(ofSome(42));
        expectTypeOf(p).toEqualTypeOf<Promise<number>>();
    });

    it('preserves T from AsyncOption<T>', () => {
        const p = unwrap(ofSome('hi'));
        expectTypeOf(p).toEqualTypeOf<Promise<string>>();
    });

    it('accepts AsyncOption<T>', () => {
        const ao: AsyncOption<number> = ofSome(42);
        const p = unwrap(ao);
        expectTypeOf(p).toEqualTypeOf<Promise<number>>();
    });
});
