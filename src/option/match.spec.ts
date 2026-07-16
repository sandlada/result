import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, matchOption } from '../../src/index.js';

describe('matchOption', () => {
    it('calls onSome on a Some', () => {
        const result = matchOption(
            (v: number) => `got ${v}`,
            () => 'missing',
        )(ofSome(5));
        expect(result).toBe('got 5');
    });

    it('calls onNone on a None', () => {
        const result = matchOption(
            (v: number) => `got ${v}`,
            () => 'missing',
        )(ofNone());
        expect(result).toBe('missing');
    });
});
