/**
 * Type-level tests for IOption<T> contract.
 * These verify compile-time behavior only.
 */
import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/index.js';
import type { IOptionSome, IOptionNone, IOption } from '../../src/types/Option.js';

describe('IOption — discriminated union', () => {
    it('ofSome(value) is IOptionSome<T>', () => {
        const opt = ofSome(42);
        expect(opt.isSome).toBe(true);
        expect(opt.isNone).toBe(false);
        if (opt.isSome) expect(opt.value).toBe(42);
    });

    it('ofNone() is IOptionNone', () => {
        const opt = ofNone();
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
    });

    it('narrows via isSome', () => {
        const opt: IOption<number> = Math.random() > 0.5 ? ofSome(1) : ofNone();
        if (opt.isSome) {
            expect(opt.value).toBe(1);
        } else {
            expect(opt.isNone).toBe(true);
        }
    });

    it('narrows via isNone', () => {
        const opt: IOption<string> = Math.random() > 0.5 ? ofSome('hi') : ofNone();
        if (opt.isNone) {
            expect(opt.isSome).toBe(false);
        } else {
            expect(opt.value).toBe('hi');
        }
    });
});
