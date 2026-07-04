import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, andThen, pipe } from '../../src/index.js';

describe('andThen', () => {
    it('chains an Option-returning function on Some', () => {
        const result = andThen((x: number) => ofSome(x * 2))(ofSome(5));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(10);
    });

    it('can return None from the chain', () => {
        const result = andThen(() => ofNone())(ofSome(5));
        expect(result.isSome).toBe(false);
    });

    it('passes through None unchanged', () => {
        const result = andThen((x: number) => ofSome(x * 2))(ofNone());
        expect(result.isSome).toBe(false);
    });

    it('chains multiple andThen calls', () => {
        const result = pipe(
            ofSome(5),
            andThen((x: number) => ofSome(x * 2)),
            andThen((x: number) => ofSome(x + 3)),
            andThen((x: number) => ofSome(x.toString())),
        );
        if (result.isSome) expect(result.value).toBe('13');
    });

    it('short-circuits on first None', () => {
        let called = false;
        const result = pipe(
            ofSome(5),
            andThen(() => ofNone()),
            andThen(() => {
                called = true;
                return ofSome(42);
            }),
        );
        expect(result.isSome).toBe(false);
        expect(called).toBe(false);
    });
});
