import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { ofSome, ofNone } from '../option/index.js';
import { cond } from './cond.js';
import { sequence } from './sequence.js';
import { reduce } from './reduce.js';

describe('Primitives', () => {
    describe('cond()', () => {
        // @ts-ignore
    bench('cond (true)', () => {
            cond(true as any, 42, 'error');
        });

        // @ts-ignore
    bench('cond (false)', () => {
            cond(false as any, 42, 'error');
        });

        // @ts-ignore
    bench('baseline: manual ternary (true)', () => {
            const condition = true;
            return (condition ? { isSuccess: true, isFailure: false, value: 42 } : { isSuccess: false, isFailure: true, error: 'error' }) as any;
        });

        // @ts-ignore
    bench('baseline: manual ternary (false)', () => {
            const condition = false;
            return (condition ? { isSuccess: true, isFailure: false, value: 42 } : { isSuccess: false, isFailure: true, error: 'error' }) as any;
        });
    });

    describe('sequence()', () => {
        const arr = Array.from({ length: 10 }, (_, i) => ofSome(i));
        const arrWithNone = [...arr, ofNone()];

        // @ts-ignore
    bench('sequence (all some)', () => {
            sequence(arr as any);
        });

        // @ts-ignore
    bench('sequence (with none)', () => {
            sequence(arrWithNone as any);
        });

        // @ts-ignore
    bench('baseline: manual array loop (all some)', () => {
            const out = new Array(arr.length);
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i]!;
                if (item.isNone) return { isSome: false, isNone: true } as any;
                out[i] = item.value;
            }
            return { isSome: true, isNone: false, value: out } as any;
        });
    });

    describe('reduce()', () => {
        const arr = Array.from({ length: 10 }, (_, i) => i);
        const reducer = (acc: number, val: number) => ok(acc + val);

        // @ts-ignore
    bench('reduce (10 items)', () => {
            reduce(reducer as any, 0, arr as any);
        });

        // @ts-ignore
    bench('baseline: manual native loop reduce', () => {
            let acc = 0;
            for (let i = 0; i < arr.length; i++) {
                const r = reducer(acc, arr[i]! as any);
                if (!r.isSuccess) return r;
                acc = r.value;
            }
            return { isSuccess: true, value: acc } as any;
        });
    });
});
