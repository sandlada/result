import { describe, it, expect, vi } from 'vitest';
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

    it('positional direct — covers all five overload forms (Group A)', () => {
        // (1) positional curried (callable) - re-checked
        const curried = match(
            (v: number) => `got ${v}`,
            () => 'missing',
        );
        expect(curried(ofSome(1))).toBe('got 1');
        expect(curried(ofNone())).toBe('missing');

        // (2) positional direct - third arg
        expect(match(
            (v: number) => `got ${v}`,
            () => 'missing',
            ofSome(2),
        )).toBe('got 2');
    });

    it('object direct — covers all five overload forms (Group A)', () => {
        // (3) object curried
        const objCurried = match({
            some: (v: number) => `got ${v}`,
            none: () => 'missing',
        });
        expect(objCurried(ofSome(3))).toBe('got 3');
        expect(objCurried(ofNone())).toBe('missing');

        // (4) object direct - second arg
        expect(match(
            { some: (v: number) => `got ${v}`, none: () => 'missing' },
            ofSome(4),
        )).toBe('got 4');
        expect(match(
            { some: (v: number) => `got ${v}`, none: () => 'missing' },
            ofNone(),
        )).toBe('missing');
    });

    it('no-r variant — positional curried with no third arg, applied later (Group A)', () => {
        const matcher = match(
            (v: number) => `got ${v}`,
            () => 'missing',
        );
        expect(matcher(ofSome(11))).toBe('got 11');
        expect(matcher(ofNone())).toBe('missing');
    });

    it('no-r variant — object curried with no third arg (Group A)', () => {
        const matcher = match({
            some: (v: number) => `got ${v}`,
            none: () => 'missing',
        });
        expect(matcher(ofSome(12))).toBe('got 12');
        expect(matcher(ofNone())).toBe('missing');
    });

    it('does NOT call onNone on Some — short-circuit (Group C)', () => {
        const onSome = vi.fn(() => 'ok');
        const onNone = vi.fn(() => 'no');
        match(onSome, onNone, ofSome(1));
        expect(onSome).toHaveBeenCalledTimes(1);
        expect(onNone).toHaveBeenCalledTimes(0);
    });

    it('does NOT call onSome on None — short-circuit (Group C)', () => {
        const onSome = vi.fn(() => 'ok');
        const onNone = vi.fn(() => 'no');
        match(onSome, onNone, ofNone());
        expect(onSome).toHaveBeenCalledTimes(0);
        expect(onNone).toHaveBeenCalledTimes(1);
    });

    it('handlers may return different types — TS infers a union', () => {
        const result = match(
            (_v: number): 123 | 'error' => 123 as const,
            (): 123 | 'error' => 'error' as const,
            ofSome(42),
        );
        expect(result).toBe(123);
        const result2 = match(
            (_v: number): 123 | 'error' => 123 as const,
            (): 123 | 'error' => 'error' as const,
            ofNone(),
        );
        expect(result2).toBe('error');
    });
});
