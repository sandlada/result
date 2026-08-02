import { describe, it, expectTypeOf } from 'vitest';
import { any } from './any.js';
import { fromResult } from '../async-result/index.js';
import { ok, err } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('any types', () => {
    it('returns AsyncResult<T[], E[]>', () => {
        const r = any([fromResult(ok(1)), fromResult(err('a'))]);
        const _check: AsyncResult<number[], string[]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers T and E from inputs', () => {
        const r = any<boolean, number>([]);
        const _check: AsyncResult<boolean[], number[]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('handles empty input', () => {
        const r = any<number, string>([]);
        const _check: AsyncResult<number[], string[]> = r;
        expectTypeOf(_check).toBeObject();
    });
});
