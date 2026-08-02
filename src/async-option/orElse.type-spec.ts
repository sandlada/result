import { describe, it, expectTypeOf } from 'vitest';
import { orElse } from './orElse.js';
import { fromOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('orElse types', () => {
    it('curried form returns (ao: AsyncOption<T>) => AsyncOption<T>', () => {
        const fn = orElse<number>(() => fromOption(ofSome(0)));
        const _check: (ao: AsyncOption<number>) => AsyncOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncOption<T>', () => {
        const r = orElse<number>(() => fromOption(ofSome(0)), fromOption(ofNone()));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('fn may return Promise<IOption<T>>', () => {
        const fn = orElse<string>(() => Promise.resolve(ofSome('default')));
        const _check: (ao: AsyncOption<string>) => AsyncOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
