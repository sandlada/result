import { describe, it, expect } from 'vitest';
import { pipe } from '../composition/index.js';
import { ok, err } from '../factories/index.js';
import { ctx, getPath, withPath } from './index.js';

describe('withPath', () => {
    const inScope = <T>(fn: () => T): T => ctx.run(fn);

    it('pushes segment to ctx synchronously even without a result', () => {
        inScope(() => {
            withPath('test-segment');
            expect(getPath()).toEqual(['test-segment']);
        });
    });

    it('returns undefined when no result is passed', () => {
        inScope(() => {
            const result = withPath('test-segment');
            expect(result).toBeUndefined();
        });
    });

    it('passes through and returns the same success result unmodified', () => {
        inScope(() => {
            const successResult = ok(42);
            const returnedResult = withPath('success-segment', successResult);
            expect(returnedResult).toBe(successResult);
            expect(returnedResult.isSuccess).toBe(true);
            expect(getPath()).toEqual(['success-segment']);
        });
    });

    it('passes through and returns the same failure result unmodified', () => {
        inScope(() => {
            const failureResult = err('boom');
            const returnedResult = withPath('fail-segment', failureResult);
            expect(returnedResult).toBe(failureResult);
            expect(returnedResult.isFailure).toBe(true);
            expect(getPath()).toEqual(['fail-segment']);
        });
    });

    it('works correctly within a pipe composition', () => {
        inScope(() => {
            const result = pipe(
                err('x'),
                (x) => withPath('first', x),
                (x) => withPath('second', x),
            );
            expect(result.isFailure).toBe(true);
            expect(getPath()).toEqual(['first', 'second']);
        });
    });

    it('is a silent no-op outside any ctx.run scope', () => {
        // Regression for the documented JSDoc leak warning: withPath now is a
        // silent no-op outside ctx.run — the segment is discarded and
        // getPath() remains empty. There is no process-global stack to leak
        // into; this test pins the actual behavior.
        expect(getPath()).toEqual([]);
        const r1 = withPath('orphan-1');
        expect(r1).toBeUndefined();
        expect(getPath()).toEqual([]);
        const r2 = withPath('orphan-2');
        expect(r2).toBeUndefined();
        expect(getPath()).toEqual([]);
    });

    it('pass-through with result outside ctx.run is also a no-op for the path', () => {
        // Passing a result outside any scope does not push anything either —
        // the segment is discarded, but the result is still returned as-is.
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
