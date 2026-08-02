import { describe, it, expectTypeOf } from 'vitest';
import { map } from './map.js';
import { fromOption } from './index.js';
import { ofSome } from '../option/index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('map types', () => {
    it('curried form returns (ao: AsyncOption<T>) => AsyncOption<U>', () => {
        const fn = map((x: number) => x.toString());
        const _check: (ao: AsyncOption<number>) => AsyncOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncOption<U>', () => {
        const r = map((x: number) => x * 2, fromOption(ofSome(21)));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves U from the wrapped function', () => {
        const fn = map((s: string) => s.length);
        const _check: (ao: AsyncOption<string>) => AsyncOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
