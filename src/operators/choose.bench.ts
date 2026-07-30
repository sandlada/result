import { describe, bench } from 'vitest';
import { choose } from './choose.js';
import { ok, err } from '../factories/index.js';

describe('choose benchmark', () => {
    const data = Array.from({ length: 1000 }, (_, i) => i);
    const parse = (x: number) => (x % 2 === 0 ? ok(x * 2) : err('odd'));

    bench('choose - direct', () => {
        choose(parse, data);
    });

    const curried = choose(parse);
    bench('choose - curried', () => {
        curried(data);
    });
});
