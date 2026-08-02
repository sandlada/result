import { describe, it, expectTypeOf } from 'vitest';
import { unwrapErr } from './unwrapErr.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unwrapErr types', () => {
    it('returns Promise<E>', () => {
        const r = unwrapErr(fromResult(ok(42) as unknown as IResultOfT<number, string>));
        expectTypeOf(r).toEqualTypeOf<Promise<string>>();
    });
});
