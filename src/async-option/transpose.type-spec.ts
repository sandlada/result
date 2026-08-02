import { describe, it, expectTypeOf } from 'vitest';
import { transpose } from './transpose.js';
import { fromResult } from '../async-result/index.js';
import { ok, err } from '../factories/index.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('transpose types', () => {
    it('returns AsyncResult<AsyncOption<T>, E>', () => {
        const r = transpose(ofSome(fromResult(ok(42))));
        const _check: AsyncResult<AsyncOption<number>, unknown> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E', () => {
        const r = transpose<string, string>(ofSome(fromResult(err('boom'))));
        const _check: AsyncResult<AsyncOption<string>, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('handles None input', () => {
        const r = transpose(ofNone<AsyncResult<number, unknown>>());
        const _check: AsyncResult<AsyncOption<number>, unknown> = r;
        expectTypeOf(_check).toBeObject();
    });
});
