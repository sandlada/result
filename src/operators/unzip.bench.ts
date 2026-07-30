import { describe, bench } from 'vitest';
import { unzip } from './unzip.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unzip benchmark', () => {
    const success: IResultOfT<readonly [number, string], string> = ok([42, 'hello'] as const);
    const failure: IResultOfT<readonly [number, string], string> = err('boom');

    bench('unzip success', () => {
        unzip(success);
    });

    bench('unzip failure', () => {
        unzip(failure);
    });
});
