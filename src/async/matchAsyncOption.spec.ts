import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, matchAsyncOption } from '../../src/index.js';

describe('matchAsyncOption', () => {
    it('calls onSome on Some (curried)', async () => {
        const matcher = matchAsyncOption(
            (v: number) => `got ${v}`,
            () => 'missing',
        );
        const r = await matcher(Promise.resolve(ofSome(42)));
        expect(r).toBe('got 42');
    });

    it('calls onSome on Some (direct)', async () => {
        const r = await matchAsyncOption(
            (v: number) => `got ${v}`,
            () => 'missing',
            Promise.resolve(ofSome(42)),
        );
        expect(r).toBe('got 42');
    });

    it('calls onNone on None', async () => {
        const r = await matchAsyncOption(
            (v: number) => `got ${v}`,
            () => 'missing',
            Promise.resolve(ofNone()),
        );
        expect(r).toBe('missing');
    });

    it('works with async callbacks', async () => {
        const r = await matchAsyncOption(
            async (v: number) => `got ${v}`,
            async () => 'missing',
            Promise.resolve(ofSome(42)),
        );
        expect(r).toBe('got 42');
    });
});
