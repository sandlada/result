import { describe, expect, it } from 'vitest';
import { err, ok } from '../../factories/index.js';
import * as operators from '../../operators/index.js';
import * as option from '../../option/index.js';

/**
 * Probe: does every data-last operator accept the direct form the module
 * README promises? Each call below is a compile-time question - a missing
 * direct form is a TypeScript error, not a runtime failure.
 */
describe('PROBE: direct form coverage', () => {
    it('operators accept the direct form', () => {
        operators.map((v: number) => v + 1, ok(1));
        operators.mapErr((e: string) => e.length, err('a'));
        operators.bind((v: number) => ok(v + 1), ok(1));
        operators.bimap((v: number) => v + 1, (e: string) => e, ok(1));
        operators.tap((v: number) => { void v; }, ok(1));
        operators.tapErr((e: string) => { void e; }, err('a'));
        operators.andTee((v: number) => ok(v), ok(1));
        operators.orTee((e: string) => ok(e), err('a'));
        operators.andThrough((v: number) => ok(v), ok(1));
        operators.exists((v: number) => v > 0, ok(1));
        operators.contains(1, ok(1));
        operators.match(() => 1, () => 2, ok(1));
        operators.unwrapOr(0, ok(1));
        operators.unwrapOrElse(() => 0, ok(1));
        operators.orElse(() => ok(1), err('a'));
        operators.mapOr(0, (v: number) => v, ok(1));
        operators.mapOrElse(() => 0, (v: number) => v, ok(1));
        operators.filterOrElse((v: number) => v > 0, () => 'nope', ok(1));
        operators.catchErr((e: string) => e.length, err('a'));
        operators.ap((v: number) => v + 1, ok(1));
        expect(true).toBe(true);
    });

    it('option operators accept the direct form', () => {
        option.map((v: number) => v + 1, option.ofSome(1));
        option.bind((v: number) => option.ofSome(v + 1), option.ofSome(1));
        option.filter((v: number) => v > 0, option.ofSome(1));
        option.tap((v: number) => { void v; }, option.ofSome(1));
        option.okOr('d', option.ofSome(1));
        option.okOrElse(() => 'd', option.ofSome(1));
        option.contains(1, option.ofSome(1));
        expect(true).toBe(true);
    });
});
