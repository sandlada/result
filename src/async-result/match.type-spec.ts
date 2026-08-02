import { describe, it, expectTypeOf } from 'vitest';
import { match } from './match.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('match types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => Promise<U>', () => {
        const fn = match({
            ok: (v: number) => `got ${v}`,
            err: (e: string) => `error: ${e}`,
        });
        const _check: (ar: AsyncResult<number, string>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<U>', () => {
        const r = match(
            { ok: (x: number) => `got ${x}`, err: (e: string) => `error: ${e}` },
            fromResult(ok(42) as unknown as IResultOfT<number, string>),
        );
        expectTypeOf(r).toEqualTypeOf<Promise<string>>();
    });
});
