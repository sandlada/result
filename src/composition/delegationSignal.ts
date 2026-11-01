import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Internal signal thrown by a `safeTry` / `safeTryAsync` delegation when it is
 * resumed past the failure it yielded.
 *
 * The delegation yields the failure and then throws this signal. A runner
 * that resumes the delegation therefore ends the generator instead of running
 * the body after the failed `yield*` - the short-circuit contract holds
 * without any bookkeeping that would have to be attributed to one specific
 * run.
 *
 * The attribution travels with the exception, so it cannot be misattributed:
 * two concurrent runs that delegate the very same Result object each get
 * their own signal, and a delegation that is driven manually leaves no mark
 * behind that a later run could mistake for its own.
 *
 * @internal
 */
export class SafeTryShortCircuit extends Error {
    /** The failure the delegation yielded. */
    readonly result: IResultOfT<unknown, unknown>;

    constructor(result: IResultOfT<unknown, unknown>) {
        super(
            'safeTry: the failure was resumed past. Drive the delegation with ' +
            '`fromSafeTry` / `fromSafeTryAsync`, which consume the failure.',
        );
        this.name = 'SafeTryShortCircuit';
        this.result = result;
    }
}
