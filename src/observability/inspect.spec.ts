import { describe, it, expect } from 'vitest';
import { ok, err } from '../index.js';
import { inspect } from './index.js';

describe('inspect', () => {
    it('returns {kind: ok, value} for success', () => {
        const r = inspect(ok(42));
        expect(r).toEqual({ kind: 'ok', value: 42 });
    });

    it('returns {kind: err, error} for failure', () => {
        const r = inspect(err('boom'));
        expect(r).toEqual({ kind: 'err', error: 'boom' });
    });

    it('preserves complex values', () => {
        const v = { a: 1 };
        const r = inspect(ok(v));
        expect(r).toEqual({ kind: 'ok', value: { a: 1 } });
    });

    it('typeguards the union discriminator', () => {
        const r = inspect(ok(1));
        expect(r.kind === 'ok').toBe(true);
        if (r.kind === 'err') {
            // @ts-expect-error — narrowing works
            r.error;
        }
    });
});