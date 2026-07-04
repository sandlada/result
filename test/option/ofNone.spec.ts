import { describe, it, expect } from 'vitest';
import { ofNone } from '../../src/index.js';
import type { IOptionNone, IOption } from '../../src/types/Option.js';

describe('ofNone()', () => {
    it('returns a None variant', () => {
        const opt = ofNone();
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
    });

    it('conforms to IOptionNone', () => {
        const opt: IOptionNone = ofNone() as unknown as IOptionNone;
        expect(opt.isSome).toBe(false);
    });

    it('conforms to IOption<never>', () => {
        const opt: IOption<never> = ofNone();
        expect(opt.isSome).toBe(false);
    });
});
