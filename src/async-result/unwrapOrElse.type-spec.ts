import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOrElse } from './unwrapOrElse.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unwrapOrElse types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => Promise<T | U>', () => {
        const fn: (ar: AsyncResult<number, string>) => Promise<number | string> = unwrapOrElse<number, string, string>(() => 'fallback');
        expectTypeOf(fn).toBeFunction();
    });

    it('direct form returns Promise<T | U>', () => {
        const r = unwrapOrElse<number, string, string>(
            (e: string) => e,
            fromResult(ok(42) as unknown as IResultOfT<number, string>),
        );
        const _check: Promise<number | string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
