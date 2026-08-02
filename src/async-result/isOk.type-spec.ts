import { describe, it, expectTypeOf } from 'vitest';
import { isOk } from './isOk.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('isOk types', () => {
    it('returns Promise<boolean>', () => {
        const r = isOk(fromResult(ok(42) as unknown as IResultOfT<number, string>));
        expectTypeOf(r).toEqualTypeOf<Promise<boolean>>();
    });
});
