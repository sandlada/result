import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { mapOrAsyncOption } from './mapOrAsyncOption.js';

describe('promise-result mapOrAsyncOption', () => {
    it('maps Some', async () => {
        const v = await mapOrAsyncOption(-1, (x: number) => x * 2, Promise.resolve(ofSome(21)));
        expect(v).toBe(42);
    });

    it('returns default on None', async () => {
        const v = await mapOrAsyncOption(-1, (x: number) => x * 2, Promise.resolve(ofNone<number>()));
        expect(v).toBe(-1);
    });

    it('catches sync throws and returns default', async () => {
        const v = await mapOrAsyncOption(-1, () => { throw new Error('boom'); }, Promise.resolve(ofSome(1)));
        expect(v).toBe(-1);
    });

    it('supports async fn', async () => {
        const v = await mapOrAsyncOption(-1, async (x: number) => x * 2, Promise.resolve(ofSome(21)));
        expect(v).toBe(42);
    });
});