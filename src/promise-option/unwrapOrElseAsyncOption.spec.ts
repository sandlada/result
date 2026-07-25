import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { unwrapOrElseAsyncOption } from './unwrapOrElseAsyncOption.js';

describe('promise-result unwrapOrElseAsyncOption', () => {
    it('returns value on Some without calling onNone', async () => {
        const onNone = vi.fn(() => 0);
        const v = await unwrapOrElseAsyncOption(onNone, Promise.resolve(ofSome(42)));
        expect(v).toBe(42);
        expect(onNone).not.toHaveBeenCalled();
    });

    it('calls onNone on None', async () => {
        const v = await unwrapOrElseAsyncOption(() => 0, Promise.resolve(ofNone<number>()));
        expect(v).toBe(0);
    });

    it('supports async onNone', async () => {
        const v = await unwrapOrElseAsyncOption(async () => 99, Promise.resolve(ofNone<number>()));
        expect(v).toBe(99);
    });
});