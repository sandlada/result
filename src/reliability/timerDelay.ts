/**
 * Shared timer bounds for the `reliability` module.
 *
 * `retry` (backoff delay) and `timeout` (deadline) both hand a user-supplied
 * duration to `setTimeout`. Node clamps anything it cannot express to **1 ms**
 * and emits a `TimeoutOverflowWarning` / `TimeoutNaNWarning`, so a request for
 * `Infinity` would silently become an immediate timer - the opposite of what
 * the caller asked for. Both operators therefore share one clamp.
 *
 * @internal
 */

/**
 * Largest delay a timer can express. Node clamps anything above it to 1 ms and
 * emits a `TimeoutOverflowWarning`, so the value is capped here instead.
 */
export const MAX_TIMER_DELAY_MS = 2_147_483_647;

/**
 * Clamp a requested delay into the range a timer can actually honour.
 *
 * Negative delays collapse to zero. `Infinity` means "as long as possible"
 * and is capped at the maximum timer interval. `NaN` carries no usable
 * duration and collapses to zero as well.
 */
export const clampTimerDelay = (raw: number): number => {
    if (!Number.isFinite(raw)) {
        return raw === Number.POSITIVE_INFINITY ? MAX_TIMER_DELAY_MS : 0;
    }
    return Math.min(Math.max(0, raw), MAX_TIMER_DELAY_MS);
};
