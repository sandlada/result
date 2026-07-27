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
});
