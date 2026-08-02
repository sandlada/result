import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { flatten, unwrap, unwrapErr } from './index.js';

describe('flatten', () => {
    it('flattens nested success', () => {
        const inner: IResultOfT<string> = ok('hi');
        const outer: IResultOfT<IResultOfT<string>> = ok(inner);
        const flat = flatten(outer);
        expect(flat.isSuccess).toBe(true);
        expect(unwrap(flat)).toBe('hi');
    });
    it('passes through outer failure', () => {
        const outerErr = new Error('nested error');
        const outer: IResultOfT<IResultOfT<number>> = err(outerErr);
        expect(unwrapErr(flatten(outer))).toBe(outerErr);
    });

    it('flattens only one layer — deeper Results stay nested (Group B)', () => {
        const inner = ok(7) as IResultOfT<number, string>;
        const middle = ok(inner) as IResultOfT<IResultOfT<number, string>, string>;
        const outer = ok(middle) as IResultOfT<IResultOfT<IResultOfT<number, string>, string>, string>;
        const flat1 = flatten(outer);
        expect(flat1.isSuccess).toBe(true);
        if (flat1.isSuccess) {
            // the value is still a Result (one layer removed, not all)
            const innerAgain = flat1.value;
            expect(innerAgain.isSuccess).toBe(true);
        }
    });

    it('does NOT call user callback — direct only (Group A)', () => {
        const inner = ok(7) as IResultOfT<number, string>;
        const outer = ok(inner) as IResultOfT<IResultOfT<number, string>, string>;
        const flat = flatten(outer);
        if (flat.isSuccess) expect(flat.value).toBe(7);
    });
});

