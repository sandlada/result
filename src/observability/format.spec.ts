import { describe, it, expect } from 'vitest';
import { ok, err } from '../index.js';
import { format } from './index.js';

describe('format', () => {
    it('renders Ok with primitive value', () => {
        expect(format(ok(42))).toBe('Ok(42)');
        expect(format(ok('hi'))).toBe('Ok("hi")');
        expect(format(ok(true))).toBe('Ok(true)');
    });

    it('renders Err with primitive value', () => {
        expect(format(err('boom'))).toBe('Err("boom")');
        expect(format(err(404))).toBe('Err(404)');
    });

    it('renders Err with Error object', () => {
        const r = err(new Error('boom'));
        expect(format(r)).toBe('Err(Error: boom)');
    });

    it('renders Error.stack on subsequent line when includeStack is true', () => {
        const e = new Error('boom');
        const out = format(err(e), { includeStack: true }).split('\n');
        expect(out[0]).toBe('Err(Error: boom)');
        expect(out.slice(1).join('\n')).toBe(e.stack ?? '');
    });

    it('does not include stack by default', () => {
        const e = new Error('boom');
        expect(format(err(e)).includes('at')).toBe(false);
    });

    it('truncates nested values at maxDepth', () => {
        const r = ok({ a: 1, b: { c: 2 } });
        // maxDepth=1 means depth-0 still renders but its object children are summarized.
        expect(format(r, { maxDepth: 1 })).toBe('Ok({"a": 1, "b": {...}})');
        // maxDepth=0 collapses the root immediately.
        expect(format(r, { maxDepth: 0 })).toBe('Ok({...})');
    });

    it('renders arrays at depth', () => {
        expect(format(ok([1, 2, 3]))).toBe('Ok([1, 2, 3])');
        expect(format(ok([]))).toBe('Ok([])');
    });

    it('handles null and undefined', () => {
        expect(format(ok(null))).toBe('Ok(null)');
        expect(format(ok(undefined))).toBe('Ok(undefined)');
    });

    it('does not quote strings when quoteStrings=false', () => {
        expect(format(ok('hi'), { quoteStrings: false })).toBe('Ok(hi)');
    });

    it('handles circular references gracefully', () => {
        type Cycle = { name: string; self?: Cycle };
        const a: Cycle = { name: 'root' };
        a.self = a;
        expect(format(ok(a)).includes('Unserializable') || format(ok(a)).includes('name')).toBe(true);
    });
});