import { describe, it, expectTypeOf } from 'vitest';
import { pipe } from './pipe.js';

describe('pipe types', () => {
    it('returns A when only value passed', () => {
        const r = pipe(42);
        const _check: number = r;
        expectTypeOf(_check).toBeNumber();
    });

    it('chains 2 functions: (A) => B', () => {
        const r = pipe(42, (x: number) => x.toString());
        const _check: string = r;
        expectTypeOf(_check).toBeString();
    });

    it('chains 3 functions: (A) => B => C', () => {
        const r = pipe(42, (x: number) => x * 2, (y: number) => y.toString());
        const _check: string = r;
        expectTypeOf(_check).toBeString();
    });

    it('chains 4 functions', () => {
        const r = pipe('42', (s: string) => Number(s), (n: number) => n * 2, (n: number) => n.toString());
        const _check: string = r;
        expectTypeOf(_check).toBeString();
    });

    it('preserves generic types', () => {
        type Box<T> = { value: T };
        const r = pipe(42, (x: number): Box<number> => ({ value: x }));
        const _check: Box<number> = r;
        expectTypeOf(_check).toMatchObjectType<{ value: number }>();
    });
});
