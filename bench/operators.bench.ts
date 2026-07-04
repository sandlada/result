import { bench, describe } from 'vitest';
import {
    ok, err,
    map, mapErr, bind, orElse, match,
    tap, tapErr,
    unwrapOr, unwrapOrElse, unwrap,
    flatten, and, or, contains, exists,
    bimap, mapOr, mapOrElse,
    separate, traverseArray, filterOrElse,
} from '../src/index.js';

// ── Data fixtures ──────────────────────────────────────────────────────────
const double = (x: number) => x * 2;
const toUpper = (s: string) => s.toUpperCase();
const asFailed = (e: string) => err(e);

const success = ok(42);
const failure = err<string>('error');

// ── map ────────────────────────────────────────────────────────────────────
describe('map', () => {
    bench('map (curried) — success path', () => {
        map(double)(success);
    });
    bench('map (direct) — success path', () => {
        map(double, success);
    });
    bench('map — failure pass-through', () => {
        map(double, failure);
    });
});

// ── mapErr ─────────────────────────────────────────────────────────────────
describe('mapErr', () => {
    bench('mapErr (curried) — failure path', () => {
        mapErr(toUpper)(failure);
    });
    bench('mapErr — success pass-through', () => {
        mapErr(toUpper, success);
    });
});

// ── bind (flatMap) ─────────────────────────────────────────────────────────
describe('bind', () => {
    const chain = (x: number) => ok(x * 2);

    bench('bind (curried) — success path', () => {
        bind(chain)(success);
    });
    bench('bind (direct) — success path', () => {
        bind(chain, success);
    });
    bench('bind — failure short-circuit', () => {
        bind(chain, failure);
    });
});

// ── orElse ─────────────────────────────────────────────────────────────────
describe('orElse', () => {
    const recover = (_e: string) => ok('recovered');

    bench('orElse (curried) — recovery on failure', () => {
        orElse(recover)(failure);
    });
    bench('orElse — success pass-through', () => {
        orElse(recover, success);
    });
});

// ── match ──────────────────────────────────────────────────────────────────
describe('match', () => {
    const onOk = (v: number) => v * 2;
    const onErr = (_e: string) => -1;

    bench('match (curried) — success path', () => {
        match(onOk, onErr)(success);
    });
    bench('match (direct) — success path', () => {
        match(onOk, onErr, success);
    });
    bench('match — failure path', () => {
        match(onOk, onErr, failure);
    });
});

// ── tap / tapErr ───────────────────────────────────────────────────────────
describe('tap / tapErr', () => {
    let _acc = 0;
    const sideEffect = (x: number) => { _acc += x; };
    const errSideEffect = (_e: string) => { /* noop */ };

    bench('tap (curried) — success path', () => {
        tap(sideEffect)(success);
    });
    bench('tapErr (curried) — failure path', () => {
        tapErr(errSideEffect)(failure);
    });
});

// ── unwrapOr / unwrapOrElse / unwrap ──────────────────────────────────────
describe('unwrapping', () => {
    bench('unwrapOr — success (returns value)', () => {
        unwrapOr(0, success);
    });
    bench('unwrapOr — failure (returns default)', () => {
        unwrapOr(0, failure);
    });
    bench('unwrapOrElse — success', () => {
        unwrapOrElse(() => 0, success);
    });
    bench('unwrapOrElse — failure', () => {
        unwrapOrElse(() => 0, failure);
    });
    bench('unwrap — success (no panic)', () => {
        unwrap(success);
    });
});

// ── flatten ────────────────────────────────────────────────────────────────
describe('flatten', () => {
    const nested = ok(ok(42));

    bench('flatten — nested success', () => {
        flatten(nested);
    });
});

// ── and / or ───────────────────────────────────────────────────────────────
describe('and / or', () => {
    const other = ok(99);

    bench('and — both success', () => {
        and(other, success);
    });
    bench('or — first success', () => {
        or(other, success);
    });
    bench('or — first failure', () => {
        or(other, failure);
    });
});

// ── contains / exists ──────────────────────────────────────────────────────
describe('contains / exists', () => {
    bench('contains — matching value', () => {
        contains(42, success);
    });
    bench('exists — predicate true', () => {
        exists((x: number) => x > 0, success);
    });
});

// ── bimap ──────────────────────────────────────────────────────────────────
describe('bimap', () => {
    const f = (x: number) => x * 2;
    const g = (e: string) => e.toUpperCase();

    bench('bimap — success path', () => {
        bimap(f, g, success);
    });
    bench('bimap — failure path', () => {
        bimap(f, g, failure);
    });
});

// ── mapOr / mapOrElse ─────────────────────────────────────────────────────
describe('mapOr / mapOrElse', () => {
    bench('mapOr — success path', () => {
        mapOr(-1, double, success);
    });
    bench('mapOr — failure path (fallback)', () => {
        mapOr(-1, double, failure as unknown as typeof success);
    });
    bench('mapOrElse — success path', () => {
        mapOrElse(() => -1, double, success);
    });
    bench('mapOrElse — failure path', () => {
        mapOrElse(() => -1, double, failure as unknown as typeof success);
    });
});

// ── filterOrElse ──────────────────────────────────────────────────────────
describe('filterOrElse', () => {
    const isPositive = (x: number) => x > 0;

    bench('filterOrElse — predicate true', () => {
        filterOrElse(isPositive, () => 'not positive', success);
    });
    bench('filterOrElse — predicate false', () => {
        filterOrElse(isPositive, () => 'not positive', ok(-1));
    });
});

// ── separate ───────────────────────────────────────────────────────────────
describe('separate', () => {
    const mixed: Array<typeof success> = [
        ok(1), err('a'), ok(2), err('b'), ok(3),
    ] as unknown as typeof success[];

    bench('separate — 5 mixed items', () => {
        separate(mixed);
    });
});

// ── traverseArray ──────────────────────────────────────────────────────────
describe('traverseArray', () => {
    const items10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const fnOk = (x: number) => ok(x * 2);

    bench('traverseArray — 10 items, all success', () => {
        traverseArray(fnOk, items10);
    });
    const failAt = (x: number) => x === 5 ? err('bad') : ok(x);

    bench('traverseArray — 10 items, short-circuit', () => {
        traverseArray(failAt, items10);
    });
});

// ── andTee ─────────────────────────────────────────────────────────────────
describe('andTee', () => {
    const teeFn = (v: number) => { void v; return ok('ignored'); };

    bench('andTee — success path', () => {
        andTee(teeFn, success);
    });
    bench('andTee — failure pass-through', () => {
        andTee(teeFn, failure);
    });
});

// ── orTee ──────────────────────────────────────────────────────────────────
describe('orTee', () => {
    const teeFn = (e: string) => { void e; return ok(0); };

    bench('orTee — failure path', () => {
        orTee(teeFn, failure);
    });
    bench('orTee — success pass-through', () => {
        orTee(teeFn, success);
    });
});

// ── andThrough ─────────────────────────────────────────────────────────────
describe('andThrough', () => {
    const throughFn = (v: number) => { void v; return ok('ok'); };

    bench('andThrough — success path (fn returns ok)', () => {
        andThrough(throughFn, success);
    });
    bench('andThrough — failure pass-through', () => {
        andThrough(throughFn, failure);
    });
});

// ── unsafeUnwrap / unsafeUnwrapErr ────────────────────────────────────────
describe('unsafe unwrapping', () => {
    bench('unsafeUnwrap — success', () => {
        unsafeUnwrap(success);
    });
    bench('unsafeUnwrapErr — failure', () => {
        unsafeUnwrapErr(failure);
    });
});
