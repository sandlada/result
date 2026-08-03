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

    it('the input is readonly AsyncResult<T, E>[]', () => {
        // The source declares `readonly AsyncResult<T, E>[]` — verify that
        // a mutable array also satisfies the parameter.
        const mutable: AsyncResult<number, string>[] = [fromResult(ok(1))];
        const r = race(mutable);
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves literal error types', () => {
        type Err = 'upstream-failure';
        const r = race<number, Err>([fromResult(ok(1))]);
        const _check: AsyncResult<number, Err> = r;
        expectTypeOf(_check).toEqualTypeOf<AsyncResult<number, Err>>();
    });

    it('returns AsyncResult for an empty input (typed correctly)', () => {
        const r = race<number, string>([]);
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check.run).toBeFunction();
    });
});
