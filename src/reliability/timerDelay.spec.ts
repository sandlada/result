import { describe, expect, it } from 'vitest';
import { MAX_TIMER_DELAY_MS, clampTimerDelay } from './timerDelay.js';

describe('clampTimerDelay', () => {
    it('passes a representable delay through unchanged', () => {
        expect(clampTimerDelay(0)).toBe(0);
        expect(clampTimerDelay(1)).toBe(1);
        expect(clampTimerDelay(1000)).toBe(1000);
        expect(clampTimerDelay(MAX_TIMER_DELAY_MS)).toBe(MAX_TIMER_DELAY_MS);
    });

    it('collapses a negative delay to zero', () => {
        expect(clampTimerDelay(-1)).toBe(0);
        expect(clampTimerDelay(-100_000)).toBe(0);
    });

    it('caps an infinite delay at the maximum timer interval', () => {
        // Node clamps a delay it cannot express to 1 ms and emits a
        // `TimeoutOverflowWarning`, so the value has to be capped here.
        expect(clampTimerDelay(Number.POSITIVE_INFINITY)).toBe(MAX_TIMER_DELAY_MS);
    });

    it('collapses a NaN delay to zero', () => {
        expect(clampTimerDelay(Number.NaN)).toBe(0);
    });

    it('caps a delay above the maximum timer interval', () => {
        expect(clampTimerDelay(MAX_TIMER_DELAY_MS + 1)).toBe(MAX_TIMER_DELAY_MS);
        expect(clampTimerDelay(Number.MAX_SAFE_INTEGER)).toBe(MAX_TIMER_DELAY_MS);
    });
});
