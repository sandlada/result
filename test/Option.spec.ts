import { describe, it, expect } from 'vitest';
import { Option } from '../src/Option.js';
import type { IOption, IOptionSome, IOptionNone } from '../src/Option.js';
import {
    ofSome,
    ofNone,
    map,
    andThen,
    orElse,
    match,
    tap,
    unwrapOr,
} from '../src/fp/option/index.js';

// ─── Static factories ───────────────────────────────────────────────────────

describe('Option.Some(value)', () => {
    it('returns a Some variant', () => {
        const opt = Option.Some(42);
        expect(opt.isSome).toBe(true);
        expect(opt.isNone).toBe(false);
    });

    it('carries the value', () => {
        const opt = Option.Some('hello');
        if (opt.isSome) expect(opt.value).toBe('hello');
    });

    it('conforms to IOptionSome<T>', () => {
        const opt: IOptionSome<number> = Option.Some(42) as IOptionSome<number>;
        expect(opt.isSome).toBe(true);
    });

    it('conforms to IOption<T>', () => {
        const opt: IOption<number> = Option.Some(42);
        expect(opt.isSome).toBe(true);
    });
});

describe('Option.None()', () => {
    it('returns a None variant', () => {
        const opt = Option.None();
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
    });

    it('conforms to IOptionNone', () => {
        const opt: IOptionNone = Option.None() as unknown as IOptionNone;
        expect(opt.isSome).toBe(false);
    });

    it('conforms to IOption<never>', () => {
        const opt: IOption<never> = Option.None();
        expect(opt.isSome).toBe(false);
    });
});

// ─── value getter ───────────────────────────────────────────────────────────

describe('value getter', () => {
    it('returns the value on Some', () => {
        const opt = Option.Some({ name: 'Alice', age: 30 });
        if (opt.isSome) {
            expect(opt.value.name).toBe('Alice');
            expect(opt.value.age).toBe(30);
        }
    });

    it('throws TypeError on None', () => {
        const opt = Option.None();
        expect(() => opt.value).toThrow(TypeError);
        expect(() => opt.value).toThrow(
            'Cannot access value on None',
        );
    });
});

// ─── map ────────────────────────────────────────────────────────────────────

describe('Option.map', () => {
    it('transforms the value on Some', () => {
        const result = Option.Some(5).map(x => x * 2);
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(10);
    });

    it('passes through None unchanged', () => {
        const result = Option.None().map((x: number) => x * 2);
        expect(result.isSome).toBe(false);
    });

    it('chains multiple maps', () => {
        const result = Option.Some(5)
            .map(x => x * 2)
            .map(x => x.toString())
            .map(s => s + 'px');
        if (result.isSome) expect(result.value).toBe('10px');
    });
});

// ─── andThen (monadic bind) ─────────────────────────────────────────────────

describe('Option.andThen', () => {
    it('chains an Option-returning function on Some', () => {
        const result = Option.Some(5).andThen(x => Option.Some(x * 2));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(10);
    });

    it('can return None from the chain', () => {
        const result = Option.Some(5).andThen(() => Option.None());
        expect(result.isSome).toBe(false);
    });

    it('passes through None unchanged', () => {
        const result = Option.None().andThen((x: number) => Option.Some(x * 2));
        expect(result.isSome).toBe(false);
    });

    it('chains multiple andThen calls', () => {
        const result = Option.Some(5)
            .andThen(x => Option.Some(x * 2))
            .andThen(x => Option.Some(x + 3))
            .andThen(x => Option.Some(x.toString()));
        if (result.isSome) expect(result.value).toBe('13');
    });

    it('short-circuits on first None', () => {
        let called = false;
        const result = Option.Some(5)
            .andThen(() => Option.None())
            .andThen(() => {
                called = true;
                return Option.Some(42);
            });
        expect(result.isSome).toBe(false);
        expect(called).toBe(false);
    });
});

// ─── orElse ─────────────────────────────────────────────────────────────────

describe('Option.orElse', () => {
    it('passes through Some unchanged', () => {
        const result = Option.Some(5).orElse(() => Option.Some(10));
        if (result.isSome) expect(result.value).toBe(5);
    });

    it('falls back to the alternative on None', () => {
        const result = Option.None().orElse(() => Option.Some(42));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(42);
    });

    it('returns None if the fallback also returns None', () => {
        const result = Option.None().orElse(() => Option.None());
        expect(result.isSome).toBe(false);
    });

    it('does not call fallback on Some (lazy evaluation)', () => {
        let called = false;
        const result = Option.Some(5).orElse(() => {
            called = true;
            return Option.Some(10);
        });
        expect(called).toBe(false);
        if (result.isSome) expect(result.value).toBe(5);
    });
});

// ─── match ─────────────────────────────────────────────────────────────────

describe('Option.match', () => {
    it('calls onSome on a Some', () => {
        const result = Option.Some(5).match(
            v => `got ${v}`,
            () => 'missing',
        );
        expect(result).toBe('got 5');
    });

    it('calls onNone on a None', () => {
        const result = Option.None().match(
            (v: number) => `got ${v}`,
            () => 'missing',
        );
        expect(result).toBe('missing');
    });
});

// ─── tap ────────────────────────────────────────────────────────────────────

describe('Option.tap', () => {
    it('calls fn with the value on Some', () => {
        let sideEffect = '';
        const result = Option.Some('hello').tap(v => {
            sideEffect = v;
        });
        expect(sideEffect).toBe('hello');
        // returns this for chaining
        if (result.isSome) expect(result.value).toBe('hello');
    });

    it('does not call fn on None', () => {
        let called = false;
        const result = Option.None().tap(() => {
            called = true;
        });
        expect(called).toBe(false);
        expect(result.isSome).toBe(false);
    });
});

// ─── unwrapOr ───────────────────────────────────────────────────────────────

describe('Option.unwrapOr', () => {
    it('extracts the value on Some', () => {
        const val = Option.Some(42).unwrapOr(0);
        expect(val).toBe(42);
    });

    it('returns the default on None', () => {
        const val = Option.None().unwrapOr(42);
        expect(val).toBe(42);
    });

    it('works with object defaults', () => {
        const defaultUser = { name: 'Guest' };
        const val = Option.None().unwrapOr(defaultUser);
        expect(val).toBe(defaultUser);
    });
});

// ─── toJSON ─────────────────────────────────────────────────────────────────

describe('Option.toJSON', () => {
    it('serializes Some as { isSome: true, value }', () => {
        const json = Option.Some(42).toJSON();
        expect(json).toEqual({ isSome: true, value: 42 });
    });

    it('serializes None as { isSome: false }', () => {
        const json = Option.None().toJSON();
        expect(json).toEqual({ isSome: false });
    });

    it('works with JSON.stringify on Some', () => {
        const str = JSON.stringify(Option.Some('hello'));
        expect(str).toBe('{"isSome":true,"value":"hello"}');
    });

    it('works with JSON.stringify on None', () => {
        const str = JSON.stringify(Option.None());
        expect(str).toBe('{"isSome":false}');
    });
});

// ─── Discriminated union narrowing ──────────────────────────────────────────

describe('IOption discriminated union narrowing', () => {
    it('narrows to Some via isSome check', () => {
        function getValue(opt: IOption<number>): number | null {
            if (opt.isSome) {
                // Should be narrowed to IOptionSome<number> — value accessible
                return opt.value;
            }
            return null;
        }
        expect(getValue(Option.Some(5))).toBe(5);
        expect(getValue(Option.None())).toBeNull();
    });

    it('narrows to None via isNone check', () => {
        function description(opt: IOption<unknown>): string {
            if (opt.isNone) {
                return 'empty';
            }
            return `has value: ${opt.value}`;
        }
        expect(description(Option.Some(5))).toBe('has value: 5');
        expect(description(Option.None())).toBe('empty');
    });
});

// ─── FP option core ────────────────────────────────────────────────────────

describe('FP option core', () => {
    it('ofSome creates a Some', () => {
        const opt = ofSome(42);
        expect(opt.isSome).toBe(true);
        if (opt.isSome) expect(opt.value).toBe(42);
    });

    it('ofNone creates a None', () => {
        const opt = ofNone();
        expect(opt.isSome).toBe(false);
    });
});

// ─── FP option operators ────────────────────────────────────────────────────

describe('FP option operators', () => {
    describe('map', () => {
        it('transforms Some value', () => {
            const result = map((x: number) => x * 2)(Option.Some(5));
            if (result.isSome) expect(result.value).toBe(10);
        });

        it('passes through None', () => {
            const result = map((x: number) => x * 2)(Option.None());
            expect(result.isSome).toBe(false);
        });
    });

    describe('andThen', () => {
        it('chains Some', () => {
            const fn = andThen((x: number) => Option.Some(x * 2));
            const result = fn(Option.Some(5));
            if (result.isSome) expect(result.value).toBe(10);
        });

        it('passes through None', () => {
            const fn = andThen((x: number) => Option.Some(x * 2));
            const result = fn(Option.None());
            expect(result.isSome).toBe(false);
        });

        it('can chain to None', () => {
            const fn = andThen(() => Option.None());
            const result = fn(Option.Some(5));
            expect(result.isSome).toBe(false);
        });
    });

    describe('orElse', () => {
        it('passes through Some', () => {
            const fn = orElse(() => Option.Some(99));
            const result = fn(Option.Some(5));
            if (result.isSome) expect(result.value).toBe(5);
        });

        it('falls back on None', () => {
            const fn = orElse(() => Option.Some(42));
            const result = fn(Option.None());
            if (result.isSome) expect(result.value).toBe(42);
        });
    });

    describe('match', () => {
        it('calls onSome for Some', () => {
            const fn = match(
                (v: number) => `num: ${v}`,
                () => 'none',
            );
            expect(fn(Option.Some(5))).toBe('num: 5');
        });

        it('calls onNone for None', () => {
            const fn = match(
                (v: number) => `num: ${v}`,
                () => 'none',
            );
            expect(fn(Option.None())).toBe('none');
        });
    });

    describe('tap', () => {
        it('calls side-effect on Some', () => {
            let val = 0;
            const fn = tap((x: number) => { val = x; });
            const result = fn(Option.Some(42));
            expect(val).toBe(42);
            if (result.isSome) expect(result.value).toBe(42);
        });

        it('does not call side-effect on None', () => {
            let called = false;
            const fn = tap(() => { called = true; });
            fn(Option.None());
            expect(called).toBe(false);
        });
    });

    describe('unwrapOr', () => {
        it('returns value on Some', () => {
            const fn = unwrapOr(0);
            expect(fn(Option.Some(42))).toBe(42);
        });

        it('returns default on None', () => {
            const fn = unwrapOr(99);
            expect(fn(Option.None())).toBe(99);
        });
    });
});

// ─── None is a singleton-like concept (multiple None() calls are structurally equal) ──

describe('Option.None structural behavior', () => {
    it('multiple None() calls are both None variants', () => {
        const a = Option.None();
        const b = Option.None();
        expect(a.isSome).toBe(false);
        expect(b.isSome).toBe(false);
        expect(a.isNone).toBe(true);
        expect(b.isNone).toBe(true);
    });
});
