import { describe, it, expect, vi, expectTypeOf } from 'vitest';
import { bind, ofSome, ofNone } from './index.js';
import { pipe } from '../composition/index.js';
import type { IOption } from '../../src/types/Option.js';

describe('bind', () => {
    it('chains an Option-returning function on Some', () => {
        const result = bind((x: number) => ofSome(x * 2))(ofSome(5));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(10);
    });

    it('can return None from the chain', () => {
        const result = bind(() => ofNone())(ofSome(5));
        expect(result.isSome).toBe(false);
    });

    it('passes through None unchanged', () => {
        const result = bind((x: number) => ofSome(x * 2))(ofNone());
        expect(result.isSome).toBe(false);
    });

    it('chains multiple bind calls', () => {
        const result = pipe(
            ofSome(5),
            bind((x: number) => ofSome(x * 2)),
            bind((x: number) => ofSome(x + 3)),
            bind((x: number) => ofSome(x.toString())),
        );
        if (result.isSome) expect(result.value).toBe('13');
    });

    it('short-circuits on first None', () => {
        let called = false;
        const result = pipe(
            ofSome(5),
            bind(() => ofNone()),
            bind(() => {
                called = true;
                return ofSome(42);
            }),
        );
        expect(result.isSome).toBe(false);
        expect(called).toBe(false);
    });

    it('returns None if the chained function throws an error', () => {
        const result = bind(() => {
            throw new Error('test error');
        })(ofSome(5));
        expect(result.isSome).toBe(false);
    });

    it('does NOT call fn on None — short-circuit (Group C)', () => {
        const fn = vi.fn((x: number) => ofSome(x));
        bind(fn)(ofNone() as IOption<number>);
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('calls fn exactly once on Some — single invocation (Group C)', () => {
        const fn = vi.fn((x: number) => ofSome(x));
        bind(fn)(ofSome(7));
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('stops calling fn after first None in pipeline (Group C)', () => {
        const fn2 = vi.fn((x: number) => ofSome(x));
        const result = pipe(
            ofSome(1),
            bind(() => ofNone()),
            bind(fn2),
        );
        expect(result.isSome).toBe(false);
        expect(fn2).toHaveBeenCalledTimes(0);
    });

    it('U is determined by the inner function return — chained types (Group B)', () => {
        const r = bind((s: string) => ofSome(s.length))(ofSome('abc'));
        if (r.isSome) expectTypeOf(r.value).toEqualTypeOf<number>();
    });

    it('catches callback throw and converts to None (Group D)', () => {
        const result = bind((_x: number) => { throw new Error('bind-boom'); })(ofSome(1));
        expect(result.isNone).toBe(true);
    });
});
