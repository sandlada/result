import { describe, it, expectTypeOf } from 'vitest';
import { unwrap } from './unwrap.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unwrap types', () => {
    it('returns Promise<T>', () => {
        const r = unwrap(fromResult(ok(42) as unknown as IResultOfT<number, string>));
        expectTypeOf(r).toEqualTypeOf<Promise<number>>();
    });
});
