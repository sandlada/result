import { describe, it, expect } from 'vitest';
import { ofSome } from '../../src/index.js';
import type { IOptionSome, IOption } from '../../src/types/Option.js';

describe('ofSome(value)', () => {
    it('returns a Some variant', () => {
        const opt = ofSome(42);
        expect(opt.isSome).toBe(true);
        expect(opt.isNone).toBe(false);
    });

    it('carries the value', () => {
        const opt = ofSome('hello');
        if (opt.isSome) expect(opt.value).toBe('hello');
    });

    it('conforms to IOptionSome<T>', () => {
        const opt: IOptionSome<number> = ofSome(42) as IOptionSome<number>;
        expect(opt.isSome).toBe(true);
    });

    it('conforms to IOption<T>', () => {
        const opt: IOption<number> = ofSome(42);
        expect(opt.isSome).toBe(true);
    });
});
