import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { asyncOrElseOption } from './asyncOrElseOption.js';

describe('promise-result asyncOrElseOption', () => {
    it('recovers on None', async () => {
        const o = await asyncOrElseOption(async () => ofSome(0), ofNone<number>());
        expect(o.isSome).toBe(true);
        if (o.isSome) expect(o.value).toBe(0);
    });

    it('passes Some through without calling f', async () => {
        const o = await asyncOrElseOption(async () => ofSome(0), ofSome(42));
        expect(o.isSome).toBe(true);
        if (o.isSome) expect(o.value).toBe(42);
    });
});