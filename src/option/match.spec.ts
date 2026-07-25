import { describe, it, expect } from 'vitest';
import { match, ofSome, ofNone } from './index.js';

describe('match', () => {
    it('calls onSome on a Some', () => {
        const result = match(
            (v: number) => `got ${v}`,
            () => 'missing',
        )(ofSome(5));
        expect(result).toBe('got 5');
    });

    it('calls onNone on a None', () => {
        const result = match(
            (v: number) => `got ${v}`,
            () => 'missing',
        )(ofNone());
        expect(result).toBe('missing');
    });

    it('object form: calls some handler on Some', () => {
        const result = match(
            { some: (v: number) => `got ${v}`, none: () => 'missing' },
            ofSome(7),
        );
        expect(result).toBe('got 7');
    });

    it('object form: calls none handler on None', () => {
        const result = match(
            { some: (v: number) => `got ${v}`, none: () => 'missing' },
            ofNone(),
        );
        expect(result).toBe('missing');
    });

    it('object form: curried', () => {
        const matcher = match({
            some: (v: number) => `got ${v}`,
            none: () => 'missing',
        });
        expect(matcher(ofSome(9))).toBe('got 9');
        expect(matcher(ofNone())).toBe('missing');
    });
});
