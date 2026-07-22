import { describe, it, expect } from 'vitest';
import { ok, err } from '../index.js';
import { sequence } from './index.js';
import { combine } from '../combine/index.js';

describe('sequence', () => {
    it('matches combine byte-for-byte for a uniform-success list', () => {
        const input = [ok(1), ok(2), ok(3)];
        expect(sequence(input)).toEqual(combine(input));
    });

    it('short-circuits on first failure', () => {
        const r = sequence([ok(1), err('a'), ok(3)]);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('a');
    });

    it('returns Ok([]) on empty input', () => {
        const r = sequence([]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });
});