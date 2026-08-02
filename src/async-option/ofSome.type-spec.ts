import { describe, it, expectTypeOf } from 'vitest';
import { ofSome } from './ofSome.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('ofSome types', () => {
    it('returns AsyncOption<T> from value', () => {
        const r = ofSome(42);
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers T from argument', () => {
        const r = ofSome('hi');
        const _check: AsyncOption<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves complex object types', () => {
        const r = ofSome({ id: 1, name: 'Alice' });
        const _check: AsyncOption<{ id: number; name: string }> = r;
        expectTypeOf(_check).toBeObject();
    });
});
