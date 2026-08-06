import { describe, it, expect } from 'vitest';
import { pipe } from '../composition/index.js';
import { ok, err } from '../factories/index.js';
import { ctx, getPath, withPath } from './index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('withPath', () => {
    const inScope = <T>(fn: () => T): T => ctx.run(fn);

    it('pushes segment to ctx synchronously even without a result', () => {
        inScope(() => {
            withPath('test-segment');
            expect(getPath()).toEqual(['test-segment']);
        });
    });

    it('returns a curried unary operator when no result is passed', () => {
        inScope(() => {
            const op = withPath('test-segment');
            expect(typeof op).toBe('function');
        });
    });

    it('curried form passes through and returns the same success result unmodified', () => {
        inScope(() => {
            const successResult = ok(42);
            const op = withPath('success-segment');
            const returnedResult = op(successResult);
            expect(returnedResult).toBe(successResult);
            expect(returnedResult.isSuccess).toBe(true);
            expect(getPath()).toEqual(['success-segment']);
        });
    });

    it('curried form passes through failure results', () => {
        inScope(() => {
            const failureResult = err('boom');
            const returnedResult = withPath('fail-segment')(failureResult);
            expect(returnedResult).toBe(failureResult);
            expect(returnedResult.isFailure).toBe(true);
            expect(getPath()).toEqual(['fail-segment']);
        });
    });

    it('direct form passes through and returns the same success result', () => {
        inScope(() => {
            const successResult = ok(42);
            const returnedResult = withPath('success-segment', successResult);
            expect(returnedResult).toBe(successResult);
            expect(getPath()).toEqual(['success-segment']);
        });
    });

    it('direct form passes through failure results', () => {
        inScope(() => {
            const failureResult = err('boom');
            const returnedResult = withPath('fail-segment', failureResult);
            expect(returnedResult).toBe(failureResult);
            expect(getPath()).toEqual(['fail-segment']);
        });
    });

    it('slots directly into pipe without an arrow wrapper', () => {
        inScope(() => {
            const result = pipe(
                err<string, string>('x'),
                withPath('first'),
                withPath('second'),
            );
            expect(result.isFailure).toBe(true);
            expect(getPath()).toEqual(['first', 'second']);
        });
    });

    it('curried form infers T and E from the result at the application site', () => {
        inScope(() => {
            const op = withPath('any');
            const r: IResultOfT<number, string> = err('boom');
            const _check: IResultOfT<number, string> = op(r);
            void _check;
        });
    });

    it('is a silent no-op outside any ctx.run scope', () => {
        expect(getPath()).toEqual([]);
        const op1 = withPath('orphan-1');
        expect(typeof op1).toBe('function');
        expect(getPath()).toEqual([]);
        const op2 = withPath('orphan-2');
        expect(typeof op2).toBe('function');
        expect(getPath()).toEqual([]);
    });

    it('pass-through with result outside ctx.run is also a no-op for the path', () => {
        const r = err('boom');
        expect(getPath()).toEqual([]);
        const returned = withPath('standalone-segment', r);
        expect(returned).toBe(r);
        expect(returned.isFailure).toBe(true);
        expect(getPath()).toEqual([]);
    });

    it('segments pushed inside ctx.run do not leak after scope exit', () => {
        inScope(() => {
            withPath('inside-1');
            withPath('inside-2');
            expect(getPath()).toEqual(['inside-1', 'inside-2']);
        });
        expect(getPath()).toEqual([]);
    });

    it('supports numeric PathSegment values', () => {
        inScope(() => {
            withPath(0);
            withPath(1);
            withPath(42);
            expect(getPath()).toEqual([0, 1, 42]);
        });
    });

    it('preserves insertion order across interleaved calls', () => {
        inScope(() => {
            withPath('a');
            withPath(1);
            withPath('b');
            withPath(2);
            expect(getPath()).toEqual(['a', 1, 'b', 2]);
        });
    });
});