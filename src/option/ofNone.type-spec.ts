import { describe, it, expectTypeOf } from 'vitest';
import { ofNone } from './ofNone.js';
import type { IOption, IOptionNone } from '../types/Option.js';

describe('ofNone types', () => {
    it('returns IOption<never>', () => {
        const opt = ofNone();
        const _check: IOption<never> = opt;
        expectTypeOf(_check).toBeObject();
    });

    it('assignable to IOption<T> for any T', () => {
        const opt = ofNone();
        const _checkNum: IOption<number> = opt;
        const _checkStr: IOption<string> = opt;
        expectTypeOf(_checkNum).toBeObject();
        expectTypeOf(_checkStr).toBeObject();
    });

    it('narrows to IOptionNone', () => {
        const opt = ofNone();
        if (opt.isNone) {
            const _check: IOptionNone = opt;
            expectTypeOf(_check).toBeObject();
        }
    });
});
