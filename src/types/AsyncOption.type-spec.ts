import { describe, it, expectTypeOf } from 'vitest';
import type { AsyncOption } from './AsyncOption.js';
import type { IOption } from './Option.js';
import { ofSome, ofNone } from '../option/index.js';

describe('AsyncOption types', () => {
    it('run() returns Promise<IOption<T>>', () => {
        type AO = AsyncOption<number>;
        type R = ReturnType<AO['run']>;
        const _check: Promise<IOption<number>> = null as unknown as R;
        expectTypeOf(_check).toBeObject();
    });

    it('structural compatibility: a plain object with .run() is AsyncOption', () => {
        const ao: AsyncOption<string> = {
            run: () => Promise.resolve(ofSome('hi')),
        };
        expectTypeOf(ao.run).toEqualTypeOf<() => Promise<IOption<string>>>();
    });

    it('run() returns Promise that resolves to IOption', () => {
        const ao: AsyncOption<number> = {
            run: () => Promise.resolve(ofSome(42)),
        };
        const result = ao.run();
        expectTypeOf(result).toBeObject();
    });
});
