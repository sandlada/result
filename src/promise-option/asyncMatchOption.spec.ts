import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { asyncMatchOption } from './asyncMatchOption.js';

describe('promise-result asyncMatchOption', () => {
    it('calls some on Some', async () => {
        const v = await asyncMatchOption({
            some: (x: number) => `some ${x}`,
            none: () => 'none',
        }, ofSome(42));
        expect(v).toBe('some 42');
    });

    it('calls none on None', async () => {
        const v = await asyncMatchOption({
            some: (x: number) => `some ${x}`,
            none: () => 'none',
        }, ofNone<number>());
        expect(v).toBe('none');
    });

    it('supports async handlers', async () => {
        const v = await asyncMatchOption({
            some: async (x: number) => `some ${x}`,
            none: async () => 'none',
        }, ofSome(42));
        expect(v).toBe('some 42');
    });
});