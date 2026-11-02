import { describe, expect, it } from 'vitest';
import { err, ok } from '../../factories/index.js';
import { ofNone, ofSome } from '../../option/index.js';
import * as ar from '../../async-result/index.js';
import * as ao from '../../async-option/index.js';
import type { AsyncResult } from '../../types/AsyncResult.js';
import type { AsyncOption } from '../../types/AsyncOption.js';

/**
 * The `AsyncResult` / `AsyncOption` contracts declare `run: () => Promise<...>`,
 * but nothing enforces that at runtime. A hand-rolled carrier can return a
 * plain Result / Option, or throw synchronously.
 *
 * The terminals must survive both: they return a Promise, and a synchronous
 * carrier failure becomes a **rejection** - never a synchronous throw that
 * escapes a function which promised a Promise.
 */

type ResultTerminal = {
    readonly name: string;
    readonly invoke: (carrier: AsyncResult<number, string>) => Promise<unknown>;
};

type OptionTerminal = {
    readonly name: string;
    readonly invoke: (carrier: AsyncOption<number>) => Promise<unknown>;
};

const resultTerminals: readonly ResultTerminal[] = [
    { name: 'contains', invoke: (c) => ar.contains(1, c) },
    { name: 'containsErr', invoke: (c) => ar.containsErr('boom', c) },
    { name: 'exists', invoke: (c) => ar.exists(() => true, c) },
    { name: 'expect', invoke: (c) => ar.expect('boom', c) },
    { name: 'expectErr', invoke: (c) => ar.expectErr('boom', c) },
    { name: 'isErr', invoke: (c) => ar.isErr(c) },
    { name: 'isOk', invoke: (c) => ar.isOk(c) },
    { name: 'mapOr', invoke: (c) => ar.mapOr(0, (v) => v, c) },
    { name: 'mapOrElse', invoke: (c) => ar.mapOrElse(() => 0, (v) => v, c) },
    { name: 'match', invoke: (c) => ar.match({ ok: (v) => v, err: () => 0 }, c) },
    { name: 'unwrap', invoke: (c) => ar.unwrap(c) },
    { name: 'unwrapErr', invoke: (c) => ar.unwrapErr(c) },
    { name: 'unwrapOr', invoke: (c) => ar.unwrapOr(0, c) },
    { name: 'unwrapOrElse', invoke: (c) => ar.unwrapOrElse(() => 0, c) },
];

const optionTerminals: readonly OptionTerminal[] = [
    { name: 'contains', invoke: (c) => ao.contains(1, c) },
    { name: 'exists', invoke: (c) => ao.exists(() => true, c) },
    { name: 'isNone', invoke: (c) => ao.isNone(c) },
    { name: 'isSome', invoke: (c) => ao.isSome(c) },
    { name: 'mapOr', invoke: (c) => ao.mapOr(0, (v) => v, c) },
    { name: 'mapOrElse', invoke: (c) => ao.mapOrElse(() => 0, (v) => v, c) },
    { name: 'match', invoke: (c) => ao.match({ some: (v) => v, none: () => 0 }, c) },
    { name: 'unwrap', invoke: (c) => ao.unwrap(c) },
    { name: 'unwrapOr', invoke: (c) => ao.unwrapOr(0, c) },
    { name: 'unwrapOrElse', invoke: (c) => ao.unwrapOrElse(() => 0, c) },
];

const plainResultCarrier = { run: () => ok(1) } as unknown as AsyncResult<number, string>;
const plainOptionCarrier = { run: () => ofSome(1) } as unknown as AsyncOption<number>;
const syncThrowingCarrier = {
    run: () => {
        throw new Error('carrier-boom');
    },
} as unknown as AsyncResult<number, string>;
const syncThrowingOptionCarrier = {
    run: () => {
        throw new Error('carrier-boom');
    },
} as unknown as AsyncOption<number>;

describe('carrier run contract', () => {
    describe('async-result terminals', () => {
        it.each(resultTerminals)('$name returns a Promise when the carrier resolves with a plain Result', async ({ invoke }) => {
            let returned: Promise<unknown> | undefined;
            expect(() => {
                returned = invoke(plainResultCarrier);
            }).not.toThrow();
            expect(returned).toBeInstanceOf(Promise);
            // The outcome depends on the terminal - `unwrap` on an Ok value
            // rejects, `isOk` resolves `false`. Attach a handler so the
            // rejection is observed instead of surfacing as an unhandled one.
            await returned?.catch(() => undefined);
        });

        it.each(resultTerminals)('$name turns a synchronous carrier throw into a rejection', async ({ invoke }) => {
            let returned: Promise<unknown> | undefined;
            expect(() => {
                returned = invoke(syncThrowingCarrier);
            }).not.toThrow();
            expect(returned).toBeInstanceOf(Promise);
            await expect(returned).rejects.toThrow('carrier-boom');
        });
    });

    describe('async-option terminals', () => {
        it.each(optionTerminals)('$name returns a Promise when the carrier resolves with a plain Option', async ({ invoke }) => {
            let returned: Promise<unknown> | undefined;
            expect(() => {
                returned = invoke(plainOptionCarrier);
            }).not.toThrow();
            expect(returned).toBeInstanceOf(Promise);
            await returned?.catch(() => undefined);
        });

        it.each(optionTerminals)('$name turns a synchronous carrier throw into a rejection', async ({ invoke }) => {
            let returned: Promise<unknown> | undefined;
            expect(() => {
                returned = invoke(syncThrowingOptionCarrier);
            }).not.toThrow();
            expect(returned).toBeInstanceOf(Promise);
            await expect(returned).rejects.toThrow('carrier-boom');
        });
    });

    describe('library-built carriers keep working', () => {
        it('resolves a Result carrier through the terminals', async () => {
            const carrier = ar.fromResult(ok(1));
            await expect(ar.isOk(carrier)).resolves.toBe(true);
            await expect(ar.unwrap(carrier)).resolves.toBe(1);
            await expect(ar.unwrapOr(0, ar.fromResult(err('boom')))).resolves.toBe(0);
        });

        it('resolves an Option carrier through the terminals', async () => {
            const carrier = ao.fromOption(ofSome(1));
            await expect(ao.isSome(carrier)).resolves.toBe(true);
            await expect(ao.unwrap(carrier)).resolves.toBe(1);
            await expect(ao.unwrapOr(0, ao.fromOption(ofNone()))).resolves.toBe(0);
        });
    });
});
