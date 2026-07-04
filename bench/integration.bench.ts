import { bench, describe } from 'vitest';
import {
    ok, err, map, bind, orElse, match, pipe, composeK,
    traverseArray, combine, combineWithAllErrors,
} from '../src/index.js';
import type { IResultOfT } from '../src/index.js';

// ── Full pipeline: ok → map → bind → orElse → match ───────────────────────
describe('full pipeline', () => {
    const pipeline = [
        map((x: number) => x * 2),
        bind((x: number) => x > 50 ? ok(x) : err('too small')),
        orElse((_e: string) => ok(0)),
        match((v: number) => `OK: ${v}`, (_e: string) => 'FAIL'),
    ] as const;

    bench('success path (ok → map → bind → orElse → match)', () => {
        pipe(ok(42), ...pipeline);
    });

    bench('failure path (bind short-circuits, orElse recovers)', () => {
        pipe(ok(10), ...pipeline);
    });
});

// ── Deep composeK (4 Kleisli arrows) ───────────────────────────────────────
describe('deep composeK', () => {
    const workflow = composeK(
        (x: number) => ok(x * 2),
        (x: number) => ok(x + 1),
        (x: number) => x > 0 ? ok(x) : err('negative'),
        (x: number) => ok(`result: ${x}`),
    );

    bench('composeK — 4 fns, success path', () => {
        workflow(5);
    });

    bench('composeK — 4 fns, short-circuit on failure', () => {
        workflow(-1);
    });
});

// ── Nested bind chain (10× bind in pipeline) ──────────────────────────────
describe('nested bind chain', () => {
    const inc = (x: number) => ok(x + 1);

    bench('10× bind chain (all success)', () => {
        pipe(
            ok(0),
            bind(inc), bind(inc), bind(inc), bind(inc), bind(inc),
            bind(inc), bind(inc), bind(inc), bind(inc), bind(inc),
        );
    });
});

// ── traverseArray + combine pattern ────────────────────────────────────────
describe('traverseArray + combine', () => {
    const items50 = Array.from({ length: 50 }, (_, i) => i);
    const fnOk = (x: number) => ok(x * 2);

    bench('traverseArray — 50 items, all pass', () => {
        traverseArray(fnOk, items50);
    });
});

// ── combineWithAllErrors validation pattern ────────────────────────────────
describe('combineWithAllErrors validation pattern', () => {
    function validate(items: { value: number; label: string }[]): IResultOfT<number[], string> {
        return combineWithAllErrors(
            items.map(item =>
                item.value >= 0
                    ? ok(item.value)
                    : err(`Invalid: ${item.label}`),
            ),
        );
    }

    const validItems = Array.from({ length: 20 }, (_, i) => ({ value: i, label: `item${i}` }));
    const partialFailItems = Array.from({ length: 20 }, (_, i) => ({
        value: i % 4 === 0 ? -1 : i,
        label: `item${i}`,
    }));

    bench('validation — 20 items, all valid', () => {
        validate(validItems);
    });

    bench('validation — 20 items, 5 invalid', () => {
        validate(partialFailItems);
    });
});
