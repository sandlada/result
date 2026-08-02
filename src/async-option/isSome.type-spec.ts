import { describe, it, expectTypeOf } from 'vitest';
import { isSome } from './isSome.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('isSome types', () => {
    it('returns Promise<boolean>', () => {
        const p = isSome(ofSome(42));
        expectTypeOf(p).toEqualTypeOf<Promise<boolean>>();
    });

    it('accepts AsyncOption<T>', () => {
        const ao: AsyncOption<number> = ofNone<number>();
        const p = isSome(ao);
        expectTypeOf(p).toEqualTypeOf<Promise<boolean>>();
    });
});
