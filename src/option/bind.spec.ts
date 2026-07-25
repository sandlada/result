import { describe, it, expect } from 'vitest';
import { bind, ofSome, ofNone } from './index.js';
import { pipe } from '../composition/index.js';

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
});
