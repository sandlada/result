import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { mapOrElseAsyncOption } from './mapOrElseAsyncOption.js';

describe('promise-result mapOrElseAsyncOption', () => {
    it('maps Some', async () => {
        const v = await mapOrElseAsyncOption(() => -1, (x: number) => x * 2, Promise.resolve(ofSome(21)));
        expect(v).toBe(42);
    });

    it('uses onNone on None', async () => {
        const v = await mapOrElseAsyncOption(() => -1, (x: number) => x * 2, Promise.resolve(ofNone<number>()));
        expect(v).toBe(-1);
    });

    it('does not call onNone on Some', async () => {
        const onNone = vi.fn(() => -1);
        await mapOrElseAsyncOption(onNone, (x: number) => x * 2, Promise.resolve(ofSome(1)));
        expect(onNone).not.toHaveBeenCalled();
    });
});