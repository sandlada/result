import { describe, it, expectTypeOf } from 'vitest';
import { reduce } from './reduce.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('reduce types', () => {
    it('returns IResultOfT<Acc, E>', () => {
        const r = reduce<number, string, number>(
            (sum, n) => ok(sum + n),
            0,
            [ok(1), ok(2), ok(3)],
        );
        const _check: IResultOfT<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves Acc from initial', () => {
        const r = reduce<string, never, { count: number }>(
            (acc) => ok(acc),
            { count: 0 },
            [],
        );
        const _check: IResultOfT<{ count: number }, never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('reducer can return Err to short-circuit', () => {
        const r = reduce<number, string, number>(
            (sum, n) => n === 0 ? err<string>('zero not allowed') : ok(sum + n),
            0,
            [ok(1), ok(0)],
        );
        const _check: IResultOfT<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
