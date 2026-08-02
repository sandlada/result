import { describe, it, expectTypeOf } from 'vitest';
import { swapAsync } from './swapAsync.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('swapAsync types', () => {
    it('returns AsyncResult<E, T>', () => {
        const r = swapAsync(fromResult(ok(5) as unknown as IResultOfT<number, string>));
        const _check: AsyncResult<string, number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
