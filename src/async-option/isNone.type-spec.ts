import { describe, it, expectTypeOf } from 'vitest';
import { isNone } from './isNone.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('isNone types', () => {
    it('returns Promise<boolean>', () => {
        const p = isNone(ofSome(42));
        expectTypeOf(p).toEqualTypeOf<Promise<boolean>>();
    });

    it('accepts AsyncOption<T>', () => {
        const ao: AsyncOption<number> = ofNone<number>();
        const p = isNone(ao);
        expectTypeOf(p).toEqualTypeOf<Promise<boolean>>();
    });
});
