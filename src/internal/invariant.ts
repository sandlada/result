import { NONE } from './sentinel.js';

/**
 * Asserts the Result mutual-exclusivity invariant.
 *
 * - `isSuccess && error !== NONE` → **throw** (success must not carry a real error)
 * - `!isSuccess && error === NONE` → **throw** (failure must carry a real error)
 *
 * @throws {TypeError} If the invariant is violated.
 *
 * @internal
 */
export function assertResultInvariant<TError>(isSuccess: boolean, error: TError): void {
    if (isSuccess && error !== (NONE as unknown as TError)) {
        throw new TypeError(
            'Result invariant violated: success must not carry a real error.',
        );
    }
    if (!isSuccess && error === (NONE as unknown as TError)) {
        throw new TypeError(
            'Result invariant violated: failure must carry a real error.',
        );
    }
}
