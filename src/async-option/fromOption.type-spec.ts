import { describe, it, expectTypeOf } from 'vitest';
import { fromOption } from './fromOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('fromOption types', () => {
    it('returns AsyncOption<T> from IOption<T>', () => {
        const r = fromOption(ofSome(42));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers T from the option', () => {
        const r = fromOption(ofSome('hi'));
        const _check: AsyncOption<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('handles IOption<never> from ofNone', () => {
        const r = fromOption(ofNone());
        const _check: AsyncOption<never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves generic T (union types survive the lift)', () => {
        // Verify the lift does not widen T — the inferred T matches the input.
        type Status = 'ok' | 'err';
        const r = fromOption(ofSome<Status>('ok'));
        const _check: AsyncOption<Status> = r;
        expectTypeOf(_check).toBeObject();
    });
});
