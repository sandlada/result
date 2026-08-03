import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
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
        expect(format(r, { maxDepth: 1 })).toBe('Ok({"a": 1, "b": {...}})');
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
        const out = format(ok(a), { maxDepth: 5 });
        // The first occurrence of `a.self` should reach `name: "root"`; the
        // second should be detected as a cycle and rendered as `[Circular]`.
        expect(out.includes('"root"')).toBe(true);
        expect(out.includes('[Circular]')).toBe(true);
    });

    it('handles mutual references between two objects', () => {
        type Pair = { name: string; peer?: Pair };
        const a: Pair = { name: 'A' };
        const b: Pair = { name: 'B' };
        a.peer = b;
        b.peer = a;
        const out = format(ok(a), { maxDepth: 5 });
        expect(out.includes('"A"')).toBe(true);
        expect(out.includes('"B"')).toBe(true);
        // The cycle must be detected somewhere — either at a.peer.peer.peer... or
        // at b.peer.peer.peer...
        expect(out.includes('[Circular]')).toBe(true);
    });

    it('renders symbol values', () => {
        const s = Symbol('tag');
        expect(format(ok(s))).toBe(`Ok(${String(s)})`);
    });

    it('renders function values', () => {
        expect(format(ok(() => 1))).toBe('Ok([Function])');
    });

    it('renders Error without message', () => {
        const e = new Error('');
        expect(format(err(e))).toBe('Err(Error)');
    });

    it('truncates nested array at maxDepth', () => {
        expect(format(ok([[1]]), { maxDepth: 1 })).toBe('Ok([[...]])');
    });

    it('renders empty object', () => {
        expect(format(ok({}))).toBe('Ok({})');
    });

    it('falls back to [Unserializable] when keys cannot be enumerated', () => {
        const hostile = new Proxy({ name: 'hidden' }, {
            ownKeys() {
                throw new TypeError('cannot list keys');
            },
        });
        expect(format(ok(hostile), { maxDepth: 5 })).toBe('Ok([Unserializable])');
    });

    it('renders bigint values', () => {
        expect(format(ok(9007199254740993n))).toBe('Ok(9007199254740993)');
        expect(format(err(0n))).toBe('Err(0)');
    });

    it('renders nested arrays inside objects at the configured depth', () => {
        expect(format(ok({ list: [1, 2, 3] }), { maxDepth: 2 })).toBe('Ok({"list": [1, 2, 3]})');
        // depth=1: list at depth 1 is at the limit, rendered as '[...]'.
        expect(format(ok({ list: [1, 2, 3] }), { maxDepth: 1 })).toBe('Ok({"list": [...]})');
    });

    it('emits a closing paren before the first newline in a stack trace', () => {
        // Regression: when the body contains '\n' (an Error stack), the
        // closing ')' must come *before* the newline so the stack starts
        // cleanly on its own line.
        const e = new Error('with stack');
        const out = format(err(e), { includeStack: true });
        const newlineIdx = out.indexOf('\n');
        expect(out.substring(newlineIdx - 1, newlineIdx)).toBe(')');
    });

    it('renders arrays containing null and undefined elements', () => {
        expect(format(ok([null, undefined, 1]))).toBe('Ok([null, undefined, 1])');
    });

    it('renders nested empty objects and arrays at depth 1', () => {
        // At depth=1 the empty containers themselves are at the limit and
        // get truncated to their depth markers — depth applies uniformly
        // to objects and arrays regardless of whether they are empty.
        expect(format(ok({ a: {}, b: [] }), { maxDepth: 1 })).toBe('Ok({"a": {...}, "b": [...]})');
        // depth=2 lets the empty containers render fully.
        expect(format(ok({ a: {}, b: [] }), { maxDepth: 2 })).toBe('Ok({"a": {}, "b": []})');
        // depth=0 truncates immediately.
        expect(format(ok({ a: {} }), { maxDepth: 0 })).toBe('Ok({...})');
    });

    it('handles boolean values inside object', () => {
        expect(format(ok({ on: true, off: false }))).toBe('Ok({"on": true, "off": false})');
    });

    it('renders Err containing an Error with includeStack=false', () => {
        const e = new Error('quiet');
        const out = format(err(e), { includeStack: false });
        expect(out).toBe('Err(Error: quiet)');
        expect(out.includes('at')).toBe(false);
    });

    it('renders an Error subclass by its concrete name', () => {
        class CustomError extends Error {
            constructor(msg: string) {
                super(msg);
                this.name = 'CustomError';
            }
        }
        expect(format(err(new CustomError('specific')))).toBe('Err(CustomError: specific)');
    });

    it('does not mutate the input result', () => {
        const r = ok({ a: 1, b: { c: 2 } });
        const before = JSON.stringify(r);
        format(r);
        format(r, { maxDepth: 0 });
        format(r, { maxDepth: 10 });
        expect(JSON.stringify(r)).toBe(before);
    });
});
