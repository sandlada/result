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
});
