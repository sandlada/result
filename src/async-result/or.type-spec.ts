import { describe, it, expectTypeOf } from 'vitest';
import { or } from './or.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('or types', () => {
    it('returns AsyncResult<T, E | F>', () => {
        const r = or(fromResult(ok(1) as unknown as IResultOfT<number, string>), fromResult(ok(2) as unknown as IResultOfT<number, number>));
        const _check: AsyncResult<number, string | number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T from both inputs', () => {
        const r = or(fromResult(ok('a') as unknown as IResultOfT<string, string>), fromResult(ok('b') as unknown as IResultOfT<string, number>));
        const _check: AsyncResult<string, string | number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
