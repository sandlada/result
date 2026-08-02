import { describe, it, expectTypeOf } from 'vitest';
import { asyncOk } from './asyncOk.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncOk types', () => {
    it('returns Promise<IResultOfT<T, never>>', () => {
        const p = asyncOk(42);
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, never>>>();
    });

    it('infers T from argument', () => {
        const p = asyncOk('hello');
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<string, never>>>();
    });

    it('preserves complex object types', () => {
        const p = asyncOk({ id: 1, name: 'Alice' });
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<{ id: number; name: string }, never>>>();
    });
});
