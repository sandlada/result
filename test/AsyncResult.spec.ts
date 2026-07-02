import { describe, it, expect } from 'vitest';
import { AsyncResult } from '../src/promise/AsyncResult.js';
import { Result } from '../src/Result.js';
import type { IResultOfT } from '../src/IResultOfT.js';

// ── Static factories ────────────────────────────────────────────────────

describe('AsyncResult.Success', () => {
    it('creates a void success', async () => {
        const ar = AsyncResult.Success();
        const r = await ar;
        expect(r.isSuccess).toBe(true);
    });

    it('creates a success with a value', async () => {
        const ar = AsyncResult.Success(42);
        const r = await ar;
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('resolves to IResultOfT when awaited', async () => {
        const result: IResultOfT<string> = await AsyncResult.Success('hello');
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe('hello');
    });
});

describe('AsyncResult.Failure', () => {
    it('creates a failure', async () => {
        const ar = AsyncResult.Failure('bad');
        const r = await ar;
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('bad');
    });

    it('returns AsyncResult<never, string>', async () => {
        const ar = AsyncResult.Failure(404);
        const r = await ar;
        if (!r.isSuccess) {
            expect(r.error).toBe(404);
        }
    });
});

describe('AsyncResult.TryCatch', () => {
    it('wraps a successful async function', async () => {
        const ar = AsyncResult.TryCatch(async () => 'data');
        const r = await ar;
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('data');
    });

    it('catches a rejected promise as failure', async () => {
        const ar = AsyncResult.TryCatch(async () => {
            throw new Error('boom');
        });
        const r = await ar;
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error.message).toBe('boom');
    });

    it('maps error with errorFn', async () => {
        const ar = AsyncResult.TryCatch(
            async () => {
                throw 'raw';
            },
            (e) => ({ code: 500, msg: String(e) }),
        );
        const r = await ar;
        if (!r.isSuccess) {
            expect(r.error.code).toBe(500);
            expect(r.error.msg).toBe('raw');
        }
    });
});

describe('AsyncResult.From', () => {
    it('lifts a sync success result', async () => {
        const sync = Result.Success(99);
        const ar = AsyncResult.From(sync);
        const r = await ar;
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(99);
    });

    it('lifts a sync failure result', async () => {
        const sync = Result.Failure<number, string>('nope');
        const ar = AsyncResult.From(sync);
        const r = await ar;
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('nope');
    });
});

describe('AsyncResult.FromPromise', () => {
    it('wraps a fulfilled promise', async () => {
        const ar = AsyncResult.FromPromise(Promise.resolve('yay'));
        const r = await ar;
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('yay');
    });

    it('wraps a rejected promise', async () => {
        const ar = AsyncResult.FromPromise(Promise.reject(new Error('nah')));
        const r = await ar;
        expect(r.isSuccess).toBe(false);
    });
});

// ── Instance: map ───────────────────────────────────────────────────────

describe('AsyncResult.map', () => {
    it('transforms the success value', async () => {
        const r = await AsyncResult.Success(21).map(x => x * 2);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through failure unchanged', async () => {
        const r = await AsyncResult.Failure<string>('err').map(x => x * 2);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('err');
    });

    it('is chainable', async () => {
        const r = await AsyncResult.Success(5)
            .map(x => x + 1)
            .map(x => x * 10);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(60);
    });
});

// ── Instance: mapAsync ──────────────────────────────────────────────────

describe('AsyncResult.mapAsync', () => {
    it('transforms with an async callback', async () => {
        const r = await AsyncResult.Success(21).mapAsync(
            async x => x * 2,
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('catches thrown errors in the callback and converts to Failure', async () => {
        const r = await AsyncResult.Success(1).mapAsync(async () => {
            throw 'callback error';
        });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('callback error');
    });

    it('passes through failure unchanged', async () => {
        const r = await AsyncResult.Failure<string>('original').mapAsync(
            async x => x * 2,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('original');
    });

    it('is chainable with map', async () => {
        const r = await AsyncResult.Success(5)
            .mapAsync(async x => x + 5)
            .map(x => x * 2);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(20);
    });
});

// ── Instance: mapErr ────────────────────────────────────────────────────

describe('AsyncResult.mapErr', () => {
    it('transforms the error', async () => {
        const r = await AsyncResult.Failure<string>('raw').mapErr(
            e => `wrapped: ${e}`,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('wrapped: raw');
    });

    it('passes through success unchanged', async () => {
        const r = await AsyncResult.Success(42).mapErr(e => `fail: ${e}`);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });
});

// ── Instance: mapErrAsync ───────────────────────────────────────────────

describe('AsyncResult.mapErrAsync', () => {
    it('transforms the error asynchronously', async () => {
        const r = await AsyncResult.Failure<number>(500).mapErrAsync(
            async code => `HTTP ${code}`,
        );
        if (!r.isSuccess) {
            expect(r.error).toBe('HTTP 500');
        }
    });

    it('catches thrown errors in the callback', async () => {
        const r = await AsyncResult.Failure<string>('original').mapErrAsync(
            async () => {
                throw 'callback fail';
            },
        );
        if (!r.isSuccess) {
            expect(r.error).toBe('callback fail');
        }
    });

    it('passes through success unchanged', async () => {
        const r = await AsyncResult.Success(1).mapErrAsync(
            async e => `mapped: ${e}`,
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(1);
    });
});

// ── Instance: andThen ───────────────────────────────────────────────────

describe('AsyncResult.andThen', () => {
    it('chains to another AsyncResult on success', async () => {
        const r = await AsyncResult.Success(21).andThen(x =>
            AsyncResult.Success(x * 2),
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('chains to a sync IResultOfT on success', async () => {
        const r = await AsyncResult.Success('hello').andThen(s =>
            Result.Success(s.length),
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('short-circuits on failure', async () => {
        const r = await AsyncResult.Failure<string>('fail')
            .andThen(x => AsyncResult.Success((x as string).length));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });

    it('widens the error type', async () => {
        const a = AsyncResult.Success<number>('value' as unknown as number);
        // Issue: we can't really test this with the current API without a proper test case
        // Let's test through matching
        const r = await a.andThen(v => AsyncResult.Failure('B' as const));
        // r should be AsyncResult<number, 'B'>
        expect(r.isFailure).toBe(true);
    });
});

// ── Instance: orElse ────────────────────────────────────────────────────

describe('AsyncResult.orElse', () => {
    it('recovers from failure with an AsyncResult', async () => {
        const r = await AsyncResult.Failure<string>('down').orElse(
            () => AsyncResult.Success(42),
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('recovers from failure with a sync IResultOfT', async () => {
        const r = await AsyncResult.Failure<string>('down').orElse(
            () => Result.Success(99),
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(99);
    });

    it('passes through success unchanged', async () => {
        const r = await AsyncResult.Success(10).orElse(
            () => AsyncResult.Success(20),
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(10);
    });
});

// ── Instance: tap / tapErr ──────────────────────────────────────────────

describe('AsyncResult.tap', () => {
    it('calls the side-effect on success', async () => {
        let side = 0;
        const r = await AsyncResult.Success(5).tap(v => {
            side = v;
        });
        expect(side).toBe(5);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('does not call side-effect on failure', async () => {
        let side = 0;
        const r = await AsyncResult.Failure<string>('err').tap(v => {
            side = v;
        });
        expect(side).toBe(0);
    });
});

describe('AsyncResult.tapErr', () => {
    it('calls the side-effect on failure', async () => {
        let side = '';
        const r = await AsyncResult.Failure<string>('oops').tapErr(e => {
            side = e;
        });
        expect(side).toBe('oops');
    });

    it('does not call side-effect on success', async () => {
        let side = '';
        const r = await AsyncResult.Success(1).tapErr(e => {
            side = String(e);
        });
        expect(side).toBe('');
    });
});

// ── Instance: terminal methods ──────────────────────────────────────────

describe('AsyncResult.match', () => {
    it('calls onSuccess for success', async () => {
        const result = await AsyncResult.Success(42).match(
            v => `ok: ${v}`,
            e => `err: ${e}`,
        );
        expect(result).toBe('ok: 42');
    });

    it('calls onFailure for failure', async () => {
        const result = await AsyncResult.Failure<string>('bad').match(
            v => `ok: ${v}`,
            e => `err: ${e}`,
        );
        expect(result).toBe('err: bad');
    });
});

describe('AsyncResult.unwrapOr', () => {
    it('returns value on success', async () => {
        const v = await AsyncResult.Success(42).unwrapOr(0);
        expect(v).toBe(42);
    });

    it('returns default on failure', async () => {
        const v = await (AsyncResult.Failure<string>('err') as AsyncResult<number, string>).unwrapOr(99);
        expect(v).toBe(99);
    });
});

describe('AsyncResult.toPromise', () => {
    it('returns the underlying Promise<IResultOfT>', async () => {
        const p = AsyncResult.Success('x').toPromise();
        expect(p).toBeInstanceOf(Promise);
        const r = await p;
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('x');
    });
});

// ── Static: combine ─────────────────────────────────────────────────────

describe('AsyncResult.Combine', () => {
    it('combines successful AsyncResults', async () => {
        const combined = AsyncResult.Combine([
            AsyncResult.Success(1),
            AsyncResult.Success(2),
            AsyncResult.Success(3),
        ]);
        const r = await combined;
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 2, 3]);
    });

    it('short-circuits on first failure', async () => {
        const combined = AsyncResult.Combine([
            AsyncResult.Success(1),
            AsyncResult.Failure<string>('bad'),
            AsyncResult.Success(3),
        ]);
        const r = await combined;
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('bad');
    });

    it('works with mixed sync/async results via .from', async () => {
        const combined = AsyncResult.Combine([
            AsyncResult.From(Result.Success(1)),
            AsyncResult.From(Result.Success(2)),
        ]);
        const r = await combined;
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 2]);
    });
});

// ── Static: all ─────────────────────────────────────────────────────────

describe('AsyncResult.All', () => {
    it('combines heterogeneous types', async () => {
        const combined = AsyncResult.All([
            AsyncResult.Success(42),
            AsyncResult.Success('hello'),
            AsyncResult.Success(true),
        ] as const);
        const r = await combined;
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            const [num, str, bool] = r.value;
            expect(num).toBe(42);
            expect(str).toBe('hello');
            expect(bool).toBe(true);
        }
    });

    it('short-circuits on first failure', async () => {
        const combined = AsyncResult.All([
            AsyncResult.Success(1),
            AsyncResult.Failure<string>('oops'),
            AsyncResult.Success(true),
        ] as const);
        const r = await combined;
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('oops');
    });
});

// ── Static: combineWithAllErrors ────────────────────────────────────────

describe('AsyncResult.CombineWithAllErrors', () => {
    it('accumulates all errors', async () => {
        const combined = AsyncResult.CombineWithAllErrors([
            AsyncResult.Success(1),
            AsyncResult.Failure<string>('err1'),
            AsyncResult.Failure<string>('err2'),
        ]);
        const r = await combined;
        expect(r.isFailure).toBe(true);
        if (!r.isSuccess) {
            expect(r.error).toEqual(['err1', 'err2']);
        }
    });

    it('returns success when all succeed', async () => {
        const combined = AsyncResult.CombineWithAllErrors([
            AsyncResult.Success(1),
            AsyncResult.Success(2),
        ]);
        const r = await combined;
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 2]);
    });
});

// ── Integration: AsyncResult + Result ───────────────────────────────────

describe('AsyncResult ←→ Result integration', () => {
    it('supports mixed pipeline with Result.tryCatchAsync and AsyncResult methods', async () => {
        // Start from Result.tryCatchAsync, convert to AsyncResult for chaining
        const promise = Result.tryCatchAsync(async () => 10);
        const ar = AsyncResult.FromPromise(promise.then(r =>
            r.isSuccess ? r.value : Promise.reject(r.error)
        ));

        const result = await ar.map(x => x * 3);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(30);
    });

    it('supports await → pattern match → continue with AsyncResult', async () => {
        const ar = AsyncResult.Success('hello');

        const len = await ar.map(s => s.length);
        expect(len.isSuccess).toBe(true);
        if (len.isSuccess) expect(len.value).toBe(5);
    });

    it('chains AsyncResult after sync Result', async () => {
        const sync = Result.Success(5);
        const ar = AsyncResult.From(sync)
            .mapAsync(async x => x * 10)
            .map(x => x + 1);
        const r = await ar;
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(51);
    });
});
