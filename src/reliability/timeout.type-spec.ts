import { describe, it, expectTypeOf } from 'vitest';
import { timeout, type TimeoutError } from './timeout.js';
import { fromResult } from '../async-result/index.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('timeout types', () => {
    it('returns AsyncResult<T, E | TimeoutError>', () => {
        const ar = timeout(1000, fromResult(ok(42)));
        const _check: AsyncResult<number, never | TimeoutError> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input', () => {
        const ar = timeout<string, Error>(1000, fromResult(ok('hi')));
        const _check: AsyncResult<string, Error | TimeoutError> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('onTimeout factory can return custom TOE type', () => {
        type CustomError = { kind: 'CustomTimeout'; ms: number };
        const ar = timeout<number, never, CustomError>(
            1000,
            fromResult(ok(42)),
            (ms): CustomError => ({ kind: 'CustomTimeout', ms }),
        );
        const _check: AsyncResult<number, never | CustomError> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('TimeoutError has a literal kind: "Timeout" discriminant', () => {
        const e: TimeoutError = { kind: 'Timeout', ms: 100 };
        expectTypeOf(e.kind).toEqualTypeOf<'Timeout'>();
        expectTypeOf(e.ms).toEqualTypeOf<number>();
    });

    it('onTimeout factory parameter is the configured ms (number)', () => {
        let observed: number | undefined;
        timeout(2000, fromResult(ok(1)), (ms): TimeoutError => {
            observed = ms;
            return { kind: 'Timeout', ms };
        });
        // observed captured at call site, not invoked — but the type is verified by inference.
        expectTypeOf(observed).toEqualTypeOf<number | undefined>();
    });

    it('onTimeout is optional — defaults to the built-in TimeoutError factory', () => {
        const ar = timeout(1000, fromResult(ok(42)));
        // The default factory yields TimeoutError.
        const _check: AsyncResult<number, never | TimeoutError> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves literal error types through the union E | TOE', () => {
        type Err = 'boom';
        const ar = timeout<number, Err, TimeoutError>(1000, fromResult(ok(42)));
        const _check: AsyncResult<number, Err | TimeoutError> = ar;
        expectTypeOf(_check).toEqualTypeOf<AsyncResult<number, Err | TimeoutError>>();
    });
});
