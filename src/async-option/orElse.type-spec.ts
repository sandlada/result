import { describe, it, expectTypeOf } from 'vitest';
import { orElse } from './orElse.js';
import { fromOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';
import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';

describe('orElse types', () => {
    it('curried form returns (ao: AsyncOption<T>) => AsyncOption<T | U>', () => {
        // The curried signature is `<T>(ao: AsyncOption<T>) => AsyncOption<T | U>`
        // — the deferred `T` widens with `U` (the fallback's value type).
        const fn = orElse<number>(() => fromOption(ofSome(0)));
        const _check: <T>(ao: AsyncOption<T>) => AsyncOption<T | number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncOption<T | U>', () => {
        // The direct form widens to `T | U` where `T` is the input's value
        // type and `U` is the fallback's value type. Pin the input via
        // `fromOption(ofNone() as IOption<number>)` so `T` narrows to `number`.
        const ao: AsyncOption<number> = fromOption(ofNone() as IOption<number>);
        const r = orElse(() => fromOption(ofSome(0)), ao);
        const _check: AsyncOption<number | number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('fn may return Promise<IOption<T>>', () => {
        const fn = orElse<string>(() => Promise.resolve(ofSome('default')));
        const _check: <T>(ao: AsyncOption<T>) => AsyncOption<T | string> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
