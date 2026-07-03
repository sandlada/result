import { describe, it, expect } from 'vitest';
import { asyncOk, asyncErr } from '../src/index.js';
import {
    mapAsync,
    mapErrAsync,
    bindAsync,
    orElseAsync,
    matchAsync,
    tapAsync,
    tapErrAsync,
    unwrapOrAsync,
} from '../src/index.js';
import { composeKAsync, pipeAsync } from '../src/index.js';
import { switchFnAsync, teeAsync } from '../src/index.js';
import { ok, err } from '../src/index.js';
import { unwrap } from '../src/index.js';
import type { IResultOfT } from '../src/types/IResultOfT.js';

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

// ─── mapAsync ──────────────────────────────────────────────────────────────

describe('FP async mapAsync', () => {
    it('maps success value (curried)', async () => {
        const double = mapAsync((x: number) => x * 2);
        const r = await double(asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('maps success value (direct)', async () => {
        const r = await mapAsync((x: number) => x * 2, asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through failure', async () => {
        const r = await mapAsync((x: number) => x * 2, asyncErr<string>('fail'));
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

// ─── mapErrAsync ───────────────────────────────────────────────────────────

describe('FP async mapErrAsync', () => {
    it('maps error (curried)', async () => {
        const wrap = mapErrAsync((e: string) => `wrapped: ${e}`);
        const r = await wrap(asyncErr<string>('raw'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('wrapped: raw');
    });

    it('passes through success', async () => {
        const r = await mapErrAsync((e: string) => `wrapped: ${e}`, asyncOk(42));
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

// ─── bindAsync ────────────────────────────────────────────────────────────

describe('FP async bindAsync', () => {
    it('chains to AsyncResult (curried)', async () => {
        const chain = bindAsync((x: number) => asyncOk(x * 2));
        const r = await chain(asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('chains to sync IResultOfT', async () => {
        const r = await bindAsync(
            (s: string) => ok(s.length),
            asyncOk('hello'),
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('short-circuits on failure', async () => {
        const r = await bindAsync(
            (x: number) => asyncOk(x * 2),
            asyncErr<string>('fail'),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });
});

// ─── orElseAsync ──────────────────────────────────────────────────────────

describe('FP async orElseAsync', () => {
    it('recovers from failure (curried)', async () => {
        const recover = orElseAsync(() => asyncOk(42));
        const r = await recover(asyncErr<string>('down'));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through success', async () => {
        const r = await orElseAsync(() => asyncOk(99), asyncOk(10));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(10);
    });
});

// ─── matchAsync ───────────────────────────────────────────────────────────

describe('FP async matchAsync', () => {
    it('matches on success (curried)', async () => {
        const m = matchAsync(
            (v: number) => `ok: ${v}`,
            (e: string) => `err: ${e}`,
        );
        const result = await m(asyncOk(42));
        expect(result).toBe('ok: 42');
    });

    it('matches on failure', async () => {
        const result = await matchAsync(
            (v: number) => `ok: ${v}`,
            (e: string) => `err: ${e}`,
            asyncErr<string>('bad'),
        );
        expect(result).toBe('err: bad');
    });
});

// ─── tapAsync / tapErrAsync ───────────────────────────────────────────────

describe('FP async tapAsync', () => {
    it('calls side-effect on success', async () => {
        let side = 0;
        const r = await tapAsync((v: number) => { side = v; }, asyncOk(5));
        expect(side).toBe(5);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('does not call on failure', async () => {
        let side = 0;
        await tapAsync((v: number) => { side = v; }, asyncErr<string>('err'));
        expect(side).toBe(0);
    });
});

describe('FP async tapErrAsync', () => {
    it('calls side-effect on failure', async () => {
        let side = '';
        const r = await tapErrAsync((e: string) => { side = e; }, asyncErr<string>('oops'));
        expect(side).toBe('oops');
    });
});

// ─── unwrapOrAsync ────────────────────────────────────────────────────────

describe('FP async unwrapOrAsync', () => {
    it('returns value on success', async () => {
        const v = await unwrapOrAsync(0, asyncOk(42));
        expect(v).toBe(42);
    });

    it('returns default on failure', async () => {
        const v = await unwrapOrAsync(99, asyncErr<string>('err'));
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
            mapAsync((x: number) => x * 2),
            mapAsync((x: number) => x + 1),
            matchAsync<string, number, string>(
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
            bindAsync((_x: number) => asyncErr<string>('pipeline fail')),
            mapAsync((x: number) => x * 2),
            matchAsync<string, number, string>(
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

// ─── Integration: FP async + sync ────────────────────────────────────────

describe('FP async ←→ sync integration', () => {
    it('chains FP async operators from sync Results', async () => {
        const sync = ok(5);
        const ar = asyncOk(sync);
        const r = await mapAsync((x: IResultOfT<number>) => unwrap(x) * 10, ar);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(50);
    });
});

