import { describe, it, expectTypeOf } from 'vitest';
import { sequence } from './sequence.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('sequence types', () => {
    it('returns IResultOfT<T[], E>', () => {
        const r = sequence([ok(1), ok(2), ok(3)]);
        const _check: IResultOfT<number[], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves E from inputs', () => {
        const r = sequence<number, string>([]);
        const _check: IResultOfT<number[], string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns failure when any element is Err', () => {
        const r = sequence([ok(1), err<string>('a'), ok(3)]);
        const _check: IResultOfT<number[], string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns IResultOfT<T[], E> on empty input with explicit generics', () => {
        const r = sequence<number, string>([]);
        const _check: IResultOfT<readonly number[], string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('accepts readonly array input — type-shape', () => {
        const input: readonly IResultOfT<number, never>[] = [ok(1), ok(2)];
        const r = sequence(input);
        const _check: IResultOfT<readonly number[], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves E type verbatim — heterogeneous aggregation (Step 14.2 — error channel)', () => {
        const r = sequence<number, Error>([ok(1), err<Error>(new Error('boom'))]);
        const _check: IResultOfT<number[], Error> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('narrowing on the inner element type through T[] is consistent', () => {
        const r = sequence([ok(1), ok(2)]);
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number[]>();
        } else {
            expectTypeOf(r.error).toEqualTypeOf<never>();
        }
    });

    it('explicit T type parameter narrows the value type', () => {
        const r = sequence<string, string>([ok('a'), ok('b')]);
        const _check: IResultOfT<string[], string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
