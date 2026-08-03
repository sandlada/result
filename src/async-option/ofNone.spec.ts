import { describe, it, expect } from 'vitest';
import { ofNone } from '../../src/async-option/ofNone.js';

describe('AsyncOption ofNone', () => {
    it('returns None', async () => {
        const ao = ofNone<number>();
        const opt = await ao.run();
        expect(opt.isNone).toBe(true);
    });

    it('is independent per call', async () => {
        const a = ofNone<string>();
        const b = ofNone<string>();
        const [o1, o2] = await Promise.all([a.run(), b.run()]);
        expect(o1.isNone).toBe(true);
        expect(o2.isNone).toBe(true);
    });

    it('is reusable: many run() calls all yield None', async () => {
        const ao = ofNone<number>();
        const results = await Promise.all([ao.run(), ao.run(), ao.run()]);
        for (const r of results) {
            expect(r.isNone).toBe(true);
        }
    });
});