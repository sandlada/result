import { describe, it, expectTypeOf } from 'vitest';
import { expect as expectAr } from './expect.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('expect types', () => {
    it('returns Promise<T>', () => {
        const r = expectAr('config must be valid', fromResult(ok(42) as unknown as IResultOfT<number, string>));
        expectTypeOf(r).toEqualTypeOf<Promise<number>>();
    });
});
