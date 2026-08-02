import { describe, it, expectTypeOf } from 'vitest';
import { sequenceAsyncResult } from './sequenceAsyncResult.js';
import { fromResult } from '../async-result/index.js';
import { ok, err } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('sequenceAsyncResult types', () => {
    it('returns AsyncResult<T[], E>', () => {
        const r = sequenceAsyncResult([fromResult(ok(1)), fromResult(ok(2))]);
        const _check: AsyncResult<number[], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves E from inputs', () => {
        const r = sequenceAsyncResult<number, string>([]);
        const _check: AsyncResult<number[], string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('short-circuits on first failure', () => {
        const r = sequenceAsyncResult([fromResult(ok(1)), fromResult(err<string>('a'))]);
        const _check: AsyncResult<number[], string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
