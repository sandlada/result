import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { asyncMapOption } from './asyncMapOption.js';

describe('promise-result asyncMapOption', () => {
    it('maps Some via async fn', async () => {
        const o = await asyncMapOption(async (x: number) => x * 2, ofSome(21));
        expect(o.isSome).toBe(true);
        if (o.isSome) expect(o.value).toBe(42);
    });

    it('passes None through', async () => {
        const o = await asyncMapOption(async (x: number) => x * 2, ofNone<number>());
        expect(o.isNone).toBe(true);
    });

    it('is curried', async () => {
        const o = await asyncMapOption(async (x: number) => x * 2)(ofSome(21));
        if (o.isSome) expect(o.value).toBe(42);
    });
});