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

    it('preserves literal error types as an E[] array', () => {
        type Err = 'upstream' | 'downstream';
        const r = any<number, Err>([fromResult(ok(1))]);
        const _check: AsyncResult<number[], Err[]> = r;
        expectTypeOf(_check).toEqualTypeOf<AsyncResult<number[], Err[]>>();
    });

    it('input is readonly AsyncResult<T, E>[]', () => {
        // The source declares `readonly AsyncResult<T, E>[]`.
        const mutable: AsyncResult<number, string>[] = [fromResult(ok(1))];
        const r = any(mutable);
        const _check: AsyncResult<number[], string[]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('success branch returns T[] (not T)', () => {
        const r = any([fromResult(ok(1)), fromResult(ok(2))]);
        // The success value is an array, even with a single input.
        const _check: AsyncResult<number[], string[]> = r;
        expectTypeOf(_check).toBeObject();
    });
});
