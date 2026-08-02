import { describe, it, expectTypeOf } from 'vitest';
import { race } from './race.js';
import { fromResult } from '../async-result/index.js';
import { ok, err } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('race types', () => {
    it('returns AsyncResult<T, E>', () => {
        const r = race([fromResult(ok(1)), fromResult(err('a'))]);
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from inputs', () => {
        const r = race<boolean, number>([]);
        const _check: AsyncResult<boolean, number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
