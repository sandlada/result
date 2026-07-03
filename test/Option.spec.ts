import { describe, it, expect } from 'vitest';
import type { IOption, IOptionSome, IOptionNone } from '../src/types/Option.js';
import {
    ofSome,
    ofNone,
    mapOption,
    andThen,
    orElseOption,
    matchOption,
    tapOption,
    unwrapOrOption,
    pipe,
} from '../src/index.js';

// ─── Static factories ───────────────────────────────────────────────────────

describe('ofSome(value)', () => {
    it('returns a Some variant', () => {
        const opt = ofSome(42);
        expect(opt.isSome).toBe(true);
        expect(opt.isNone).toBe(false);
    });

    it('carries the value', () => {
        const opt = ofSome('hello');
        if (opt.isSome) expect(opt.value).toBe('hello');
    });

    it('conforms to IOptionSome<T>', () => {
        const opt: IOptionSome<number> = ofSome(42) as IOptionSome<number>;
        expect(opt.isSome).toBe(true);
    });

    it('conforms to IOption<T>', () => {
        const opt: IOption<number> = ofSome(42);
        expect(opt.isSome).toBe(true);
    });
});

describe('ofNone()', () => {
    it('returns a None variant', () => {
        const opt = ofNone();
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
    });

    it('conforms to IOptionNone', () => {
        const opt: IOptionNone = ofNone() as unknown as IOptionNone;
        expect(opt.isSome).toBe(false);
    });

    it('conforms to IOption<never>', () => {
        const opt: IOption<never> = ofNone();
        expect(opt.isSome).toBe(false);
    });
});

// ─── value getter ───────────────────────────────────────────────────────────

describe('value getter', () => {
    it('returns the value on Some', () => {
        const opt = ofSome({ name: 'Alice', age: 30 });
        if (opt.isSome) {
            expect(opt.value.name).toBe('Alice');
            expect(opt.value.age).toBe(30);
        }
    });

    it('returns undefined on None', () => {
        const opt = ofNone();
        expect(opt.value).toBeUndefined();
    });
});

// ─── mapOption ──────────────────────────────────────────────────────────────

describe('mapOption', () => {
    it('transforms the value on Some', () => {
        const result = mapOption((x: number) => x * 2)(ofSome(5));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(10);
    });

    it('passes through None unchanged', () => {
        const result = mapOption((x: number) => x * 2)(ofNone());
        expect(result.isSome).toBe(false);
    });

    it('chains multiple maps via pipe', () => {
        const result = pipe(
            ofSome(5),
            mapOption((x: number) => x * 2),
            mapOption((x: number) => x.toString()),
            mapOption((s: string) => s + 'px'),
        );
        if (result.isSome) expect(result.value).toBe('10px');
    });
});

// ─── andThen (monadic bind) ─────────────────────────────────────────────────

describe('andThen', () => {
    it('chains an Option-returning function on Some', () => {
        const result = andThen((x: number) => ofSome(x * 2))(ofSome(5));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(10);
    });

    it('can return None from the chain', () => {
        const result = andThen(() => ofNone())(ofSome(5));
        expect(result.isSome).toBe(false);
    });

    it('passes through None unchanged', () => {
        const result = andThen((x: number) => ofSome(x * 2))(ofNone());
        expect(result.isSome).toBe(false);
    });

    it('chains multiple andThen calls', () => {
        const result = pipe(
            ofSome(5),
            andThen((x: number) => ofSome(x * 2)),
            andThen((x: number) => ofSome(x + 3)),
            andThen((x: number) => ofSome(x.toString())),
        );
        if (result.isSome) expect(result.value).toBe('13');
    });

    it('short-circuits on first None', () => {
        let called = false;
        const result = pipe(
            ofSome(5),
            andThen(() => ofNone()),
            andThen(() => {
                called = true;
                return ofSome(42);
            }),
        );
        expect(result.isSome).toBe(false);
        expect(called).toBe(false);
    });
});

// ─── orElseOption ────────────────────────────────────────────────────────────

describe('orElseOption', () => {
    it('passes through Some unchanged', () => {
        const result = orElseOption(() => ofSome(10))(ofSome(5));
        if (result.isSome) expect(result.value).toBe(5);
    });

    it('falls back to the alternative on None', () => {
        const result = orElseOption(() => ofSome(42))(ofNone());
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(42);
    });

    it('returns None if the fallback also returns None', () => {
        const result = orElseOption(() => ofNone())(ofNone());
        expect(result.isSome).toBe(false);
    });

    it('does not call fallback on Some (lazy evaluation)', () => {
        let called = false;
        const result = orElseOption(() => {
            called = true;
            return ofSome(10);
        })(ofSome(5));
        expect(called).toBe(false);
        if (result.isSome) expect(result.value).toBe(5);
    });
});

// ─── matchOption ────────────────────────────────────────────────────────────

describe('matchOption', () => {
    it('calls onSome on a Some', () => {
        const result = matchOption(
            (v: number) => `got ${v}`,
            () => 'missing',
        )(ofSome(5));
        expect(result).toBe('got 5');
    });

    it('calls onNone on a None', () => {
        const result = matchOption(
            (v: number) => `got ${v}`,
            () => 'missing',
        )(ofNone());
        expect(result).toBe('missing');
    });
});

// ─── tapOption ──────────────────────────────────────────────────────────────

describe('tapOption', () => {
    it('calls fn with the value on Some', () => {
        let sideEffect = '';
        const result = tapOption((v: string) => {
            sideEffect = v;
        })(ofSome('hello'));
        expect(sideEffect).toBe('hello');
        if (result.isSome) expect(result.value).toBe('hello');
    });

    it('returns the same None', () => {
        let called = false;
        const result = tapOption(() => {
            called = true;
        })(ofNone());
        expect(called).toBe(false);
        expect(result.isSome).toBe(false);
    });
});

// ─── unwrapOrOption ─────────────────────────────────────────────────────────

describe('unwrapOrOption', () => {
    it('extracts the value on Some', () => {
        const val = unwrapOrOption(0)(ofSome(42));
        expect(val).toBe(42);
    });

    it('returns the default on None', () => {
        const val = unwrapOrOption(42)(ofNone());
        expect(val).toBe(42);
    });

    it('works with object defaults', () => {
        const defaultUser = { name: 'Guest' };
        const val = unwrapOrOption(defaultUser)(ofNone());
        expect(val).toBe(defaultUser);
    });
});

// ─── toJSON — Option type is plain data, JSON.stringify gives the raw shape ──

describe('Option toJSON', () => {
    it('JSON.stringify on Some gives { isSome: true, isNone: false, value }', () => {
        const str = JSON.stringify(ofSome('hello'));
        expect(str).toBe('{"isSome":true,"isNone":false,"value":"hello"}');
    });

    it('JSON.stringify on None gives { isSome: false, isNone: true }', () => {
        const str = JSON.stringify(ofNone());
        expect(str).toBe('{"isSome":false,"isNone":true}');
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
        expect(getValue(ofSome(5))).toBe(5);
        expect(getValue(ofNone())).toBeNull();
    });

    it('narrows to None via isNone check', () => {
        function description(opt: IOption<unknown>): string {
            if (opt.isNone) {
                return 'empty';
            }
            return `has value: ${opt.value}`;
        }
        expect(description(ofSome(5))).toBe('has value: 5');
        expect(description(ofNone())).toBe('empty');
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
    describe('mapOption', () => {
        it('transforms Some value', () => {
            const result = mapOption((x: number) => x * 2)(ofSome(5));
            if (result.isSome) expect(result.value).toBe(10);
        });

        it('passes through None', () => {
            const result = mapOption((x: number) => x * 2)(ofNone());
            expect(result.isSome).toBe(false);
        });
    });

    describe('andThen', () => {
        it('chains Some', () => {
            const result = andThen((x: number) => ofSome(x * 2))(ofSome(5));
            if (result.isSome) expect(result.value).toBe(10);
        });

        it('passes through None', () => {
            const result = andThen((x: number) => ofSome(x * 2))(ofNone());
            expect(result.isSome).toBe(false);
        });

        it('can chain to None', () => {
            const result = andThen(() => ofNone())(ofSome(5));
            expect(result.isSome).toBe(false);
        });
    });

    describe('orElseOption', () => {
        it('passes through Some', () => {
            const result = orElseOption(() => ofSome(99))(ofSome(5));
            if (result.isSome) expect(result.value).toBe(5);
        });

        it('falls back on None', () => {
            const result = orElseOption(() => ofSome(42))(ofNone());
            if (result.isSome) expect(result.value).toBe(42);
        });
    });

    describe('matchOption', () => {
        it('calls onSome for Some', () => {
            const fn = matchOption(
                (v: number) => `num: ${v}`,
                () => 'none',
            );
            expect(fn(ofSome(5))).toBe('num: 5');
        });

        it('calls onNone for None', () => {
            const fn = matchOption(
                (v: number) => `num: ${v}`,
                () => 'none',
            );
            expect(fn(ofNone())).toBe('none');
        });
    });

    describe('tapOption', () => {
        it('calls side-effect on Some', () => {
            let val = 0;
            const result = tapOption((x: number) => { val = x; })(ofSome(42));
            expect(val).toBe(42);
            if (result.isSome) expect(result.value).toBe(42);
        });

        it('does not call side-effect on None', () => {
            let called = false;
            tapOption(() => { called = true; })(ofNone());
            expect(called).toBe(false);
        });
    });

    describe('unwrapOrOption', () => {
        it('returns value on Some', () => {
            expect(unwrapOrOption(0)(ofSome(42))).toBe(42);
        });

        it('returns default on None', () => {
            expect(unwrapOrOption(99)(ofNone())).toBe(99);
        });
    });
});

// ─── None is a singleton-like concept (multiple None() calls are structurally equal) ──

describe('Option.None structural behavior', () => {
    it('multiple None() calls are both None variants', () => {
        const a = ofNone();
        const b = ofNone();
        expect(a.isSome).toBe(false);
        expect(b.isSome).toBe(false);
        expect(a.isNone).toBe(true);
        expect(b.isNone).toBe(true);
    });
});

