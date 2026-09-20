import { describe, expect, it } from 'vitest';
import * as adapters from '../../adapters/index.js';
import * as asyncOption from '../../async-option/index.js';
import * as asyncResult from '../../async-result/index.js';
import * as combine from '../../combine/index.js';
import * as composition from '../../composition/index.js';
import * as factories from '../../factories/index.js';
import * as observability from '../../observability/index.js';
import * as operators from '../../operators/index.js';
import * as option from '../../option/index.js';
import * as primitives from '../../primitives/index.js';
import * as promiseOption from '../../promise-option/index.js';
import * as promiseResult from '../../promise-result/index.js';
import * as reliability from '../../reliability/index.js';
import { CHANNEL_PROBES, UNPROBED_EXPORTS, type ChannelOutcome, type ChannelProbe } from './behavior-matrix.js';

const BARRELS: Readonly<Record<string, Record<string, unknown>>> = {
    adapters,
    'async-option': asyncOption,
    'async-result': asyncResult,
    combine,
    composition,
    factories,
    observability,
    operators,
    option,
    primitives,
    'promise-option': promiseOption,
    'promise-result': promiseResult,
    reliability,
};

const runProbe = async (probe: ChannelProbe): Promise<ChannelOutcome> => {
    try {
        return await probe.run();
    } catch {
        return 'propagate';
    }
};

describe('behavior policy conformance', () => {
    it('classifies every runtime export of every public barrel', () => {
        const missing: string[] = [];
        for (const [module, ns] of Object.entries(BARRELS)) {
            const probed = new Set(CHANNEL_PROBES.filter((p) => p.module === module).map((p) => p.api));
            const unprobed = new Set(UNPROBED_EXPORTS[module] ?? []);
            for (const [name, value] of Object.entries(ns)) {
                if (typeof value !== 'function') continue;
                if (!probed.has(name) && !unprobed.has(name)) missing.push(`${module}/${name}`);
            }
        }
        expect(missing).toEqual([]);
    });

    for (const probe of CHANNEL_PROBES) {
        it(`${probe.module}/${probe.api} — ${probe.scenario} → ${probe.policy}`, async () => {
            expect(await runProbe(probe)).toBe(probe.policy);
        });
    }
});
