import { bench, describe } from 'vitest';
import { ofSome, ofNone, map as optionMap, andThen, orElse, match, flatten } from '../src/option/index.js';
import { pipe } from '../src/index.js';

// ── Construction ──────────────────────────────────────────────────────────
describe('option construction', () => {
    bench('ofSome(number) — create Some value', () => {
        ofSome(42);
    });

    bench('ofNone() — create None', () => {
        ofNone();
    });
});

// ── map ────────────────────────────────────────────────────────────────────
describe('option map', () => {
    const double = (x: number) => x * 2;
    const some = ofSome(21);
    const none = ofNone() as ReturnType<typeof ofSome<number>>;

    bench('map — Some path (transform)', () => {
        optionMap(double)(some);
    });

    bench('map — None path (pass-through)', () => {
        optionMap(double)(none);
    });
});

// ── andThen ────────────────────────────────────────────────────────────────
describe('option andThen', () => {
    const chain = (x: number) => ofSome(x * 2);
    const some = ofSome(21);
    const none = ofNone() as ReturnType<typeof ofSome<number>>;

    bench('andThen — Some path', () => {
        andThen(chain)(some);
    });

    bench('andThen — None path (short-circuit)', () => {
        andThen(chain)(none);
    });
});

// ── orElse ─────────────────────────────────────────────────────────────────
describe('option orElse', () => {
    const fallback = () => ofSome(0);
    const some = ofSome(42);
    const none = ofNone() as ReturnType<typeof ofSome<number>>;

    bench('orElse — Some (pass-through)', () => {
        orElse(fallback)(some);
    });

    bench('orElse — None (recovery)', () => {
        orElse(fallback)(none);
    });
});

// ── match ──────────────────────────────────────────────────────────────────
describe('option match', () => {
    const onSome = (x: number) => x * 2;
    const onNone = () => -1;
    const some = ofSome(42);
    const none = ofNone() as ReturnType<typeof ofSome<number>>;

    bench('match — Some path', () => {
        match(onSome, onNone)(some);
    });

    bench('match — None path', () => {
        match(onSome, onNone)(none);
    });
});

// ── flatten ────────────────────────────────────────────────────────────────
describe('option flatten', () => {
    const nested = ofSome(ofSome(42));

    bench('flatten — nested Some', () => {
        flatten(nested);
    });
});
