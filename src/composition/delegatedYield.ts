/**
 * Bookkeeping for values that reached a runner through a `safeTry`
 * delegation.
 *
 * The runner has to know whether the value it received came from a
 * `yield* safeTry(...)` delegation or from a raw `yield` in the user's
 * generator. Only a raw yield may be probed for a second yield: resuming a
 * delegation would run the generator body past the failure and break the
 * short-circuit contract.
 *
 * The attribution is per *value*, not per run. A module-level "currently
 * running generator" flag would be wrong here: two `fromSafeTryAsync` runs
 * can be in flight at the same time, and such a flag would attribute one
 * run's delegation to the other - which makes the other run resume its
 * generator body past its own failure.
 *
 * @internal
 */
const delegatedYields = new WeakSet<object>();

/**
 * Records that `value` is about to be yielded by a `safeTry` delegation.
 */
export const markDelegatedYield = (value: object): void => {
    delegatedYields.add(value);
};

/**
 * Consumes the delegation mark of `value`.
 *
 * Returns `true` when the value came from a `safeTry` delegation. The mark is
 * removed so a later raw yield of the very same Result object is still
 * recognised as a raw yield.
 */
export const consumeDelegatedYield = (value: unknown): boolean => {
    if (typeof value !== 'object' || value === null) return false;
    if (!delegatedYields.has(value)) return false;
    delegatedYields.delete(value);
    return true;
};
