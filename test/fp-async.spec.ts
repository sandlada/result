import { describe, it, expect } from 'vitest';
import { asyncOk, asyncErr } from '../src/fp/promise/core.js';
import {
    map,
    mapAsync,
    mapErr,
    mapErrAsync,
    bind,
    orElse,
    match,
    tap,
    tapErr,
    unwrapOr,
} from '../src/fp/promise/operators.js';
import { composeKAsync, pipeAsync } from '../src/fp/promise/composition.js';
import { switchFnAsync, teeAsync } from '../src/fp/promise/adapters.js';
import { AsyncResult } from '../src/promise/AsyncResult.js';
import { Result } from '../src/Result.js';

// ─── core ─────────────────────────────────────────────────────────────────

describe('FP async core', () => {
    it('asyncOk creates a success AsyncResult', async () => {
        const r = await asyncOk(42);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('asyncErr creates a failure AsyncResult', async () => {
        const r = await asyncErr('bad');
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('bad');
    });
});

// ─── map ──────────────────────────────────────────────────────────────────

describe('FP async map', () => {
    it('maps success value (curried)', async () => {
        const double = map((x: number) => x * 2);
        const r = await double(asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('maps success value (direct)', async () => {
        const r = await map((x: number) => x * 2, asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through failure', async () => {
        const r = await map((x: number) => x * 2, asyncErr<string>('fail'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });
});

// ─── mapAsync ─────────────────────────────────────────────────────────────

describe('FP async mapAsync', () => {
    it('maps with async callback (curried)', async () => {
        const doubleAsync = mapAsync(async (x: number) => x * 2);
        const r = await doubleAsync(asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('catches callback exceptions', async () => {
        const r = await mapAsync(async () => {
            throw 'callback err';
        }, asyncOk(1));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('callback err');
    });
});

// ─── mapErr ───────────────────────────────────────────────────────────────

describe('FP async mapErr', () => {
    it('maps error (curried)', async () => {
        const wrap = mapErr((e: string) => `wrapped: ${e}`);
        const r = await wrap(asyncErr<string>('raw'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('wrapped: raw');
    });

    it('passes through success', async () => {
        const r = await mapErr((e: string) => `wrapped: ${e}`, asyncOk(42));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });
});

// ─── mapErrAsync ──────────────────────────────────────────────────────────

describe('FP async mapErrAsync', () => {
    it('maps error asynchronously', async () => {
        const r = await mapErrAsync(
            async (code: number) => `HTTP ${code}`,
            asyncErr<number>(500),
        );
        if (!r.isSuccess) {
            expect(r.error).toBe('HTTP 500');
        }
    });

    it('catches callback exceptions', async () => {
        const r = await mapErrAsync(
            async () => {
                throw 'mapping failed';
            },
            asyncErr<string>('original'),
        );
        if (!r.isSuccess) {
            expect(r.error).toBe('mapping failed');
        }
    });
});

// ─── bind ─────────────────────────────────────────────────────────────────

describe('FP async bind', () => {
    it('chains to AsyncResult (curried)', async () => {
        const chain = bind((x: number) => asyncOk(x * 2));
        const r = await chain(asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('chains to sync IResultOfT', async () => {
        const r = await bind(
            (s: string) => Result.Success(s.length),
            asyncOk('hello'),
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('short-circuits on failure', async () => {
        const r = await bind(
            (x: number) => asyncOk(x * 2),
            asyncErr<string>('fail'),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });
});

// ─── orElse ───────────────────────────────────────────────────────────────

describe('FP async orElse', () => {
    it('recovers from failure (curried)', async () => {
        const recover = orElse(() => asyncOk(42));
        const r = await recover(asyncErr<string>('down'));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through success', async () => {
        const r = await orElse(() => asyncOk(99), asyncOk(10));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(10);
    });
});

// ─── match ────────────────────────────────────────────────────────────────

describe('FP async match', () => {
    it('matches on success (curried)', async () => {
        const m = match(
            (v: number) => `ok: ${v}`,
            (e: string) => `err: ${e}`,
        );
        const result = await m(asyncOk(42));
        expect(result).toBe('ok: 42');
    });

    it('matches on failure', async () => {
        const result = await match(
            (v: number) => `ok: ${v}`,
            (e: string) => `err: ${e}`,
            asyncErr<string>('bad'),
        );
        expect(result).toBe('err: bad');
    });
});

// ─── tap / tapErr ─────────────────────────────────────────────────────────

describe('FP async tap', () => {
    it('calls side-effect on success', async () => {
        let side = 0;
        const r = await tap((v: number) => { side = v; }, asyncOk(5));
        expect(side).toBe(5);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('does not call on failure', async () => {
        let side = 0;
        await tap((v: number) => { side = v; }, asyncErr<string>('err'));
        expect(side).toBe(0);
    });
});

describe('FP async tapErr', () => {
    it('calls side-effect on failure', async () => {
        let side = '';
        const r = await tapErr((e: string) => { side = e; }, asyncErr<string>('oops'));
        expect(side).toBe('oops');
    });
});

// ─── unwrapOr ─────────────────────────────────────────────────────────────

describe('FP async unwrapOr', () => {
    it('returns value on success', async () => {
        const v = await unwrapOr(0, asyncOk(42));
        expect(v).toBe(42);
    });

    it('returns default on failure', async () => {
        const v = await unwrapOr(99, asyncErr<string>('err'));
        expect(v).toBe(99);
    });
});

// ─── composeKAsync ────────────────────────────────────────────────────────

describe('FP async composeKAsync', () => {
    it('composes two async switch functions', async () => {
        const f1 = (x: number) => asyncOk(x + 1);
        const f2 = (x: number) => asyncOk(x * 2);
        const composed = composeKAsync(f1, f2);

        const r = await composed(10);
        // f1: 10 → 11, f2: 11 → 22
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(22);
    });

    it('short-circuits on first failure', async () => {
        const f1 = (_x: number) => asyncErr<string>('fail');
        const f2 = (x: number) => asyncOk(x * 2);
        const composed = composeKAsync(f1, f2);

        const r = await composed(10);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });
});

// ─── pipeAsync ────────────────────────────────────────────────────────────

describe('FP async pipeAsync', () => {
    it('pipes through async operators', async () => {
        const result = await pipeAsync(
            asyncOk(21),
            map((x: number) => x * 2),
            map((x: number) => x + 1),
            match(
                v => `Value: ${v}`,
                e => `Error: ${e}`,
            ),
        );
        // 21 * 2 = 42, 42 + 1 = 43
        expect(result).toBe('Value: 43');
    });

    it('handles failure in pipeline', async () => {
        const result = await pipeAsync(
            asyncOk(5),
            bind((_x: number) => asyncErr<string>('pipeline fail')),
            map((x: number) => x * 2),
            match(
                v => `ok: ${v}`,
                e => `err: ${e}`,
            ),
        );
        expect(result).toBe('err: pipeline fail');
    });
});

// ─── adapters ─────────────────────────────────────────────────────────────

describe('FP async switchFnAsync', () => {
    it('lifts an async function to async switch', async () => {
        const fetchLen = switchFnAsync(async (s: string) => s.length);
        const r = await fetchLen('hello');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });
});

describe('FP async teeAsync', () => {
    it('calls async side-effect and returns input', async () => {
        let side = '';
        const log = teeAsync(async (s: string) => {
            side = s;
        });
        const result = await log('data');
        expect(side).toBe('data');
        expect(result).toBe('data');
    });
});

// ─── Integration: FP async + OOP ─────────────────────────────────────────

describe('FP async ←→ OOP integration', () => {
    it('mixes FP async operators with AsyncResult methods', async () => {
        const ar = asyncOk(10);
        const r = await ar.map(x => x * 3);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(30);
    });

    it('chains FP async operators from sync Results', async () => {
        const sync = Result.Success(5);
        const ar = AsyncResult.From(sync);
        const r = await map((x: number) => x * 10, ar);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(50);
    });
});
