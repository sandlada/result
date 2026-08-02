import { describe, it, expectTypeOf } from 'vitest';
import { mapOr } from './mapOr.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('mapOr types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => Promise<U>', () => {
        const fn = mapOr(-1, (x: number) => x * 2);
        const _check: (ar: AsyncResult<number, string>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves U from default and fn return', () => {
        const fn = mapOr('default', (s: string) => s.toUpperCase());
        const _check: (ar: AsyncResult<string, number>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<U>', () => {
        const r = mapOr(-1, (x: number) => x * 2, fromResult(ok(21) as unknown as IResultOfT<number, string>));
        expectTypeOf(r).toEqualTypeOf<Promise<number>>();
    });
});
