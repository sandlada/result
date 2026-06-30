/**
 * Re-export of {@link ResultOfT} from the main {@link Result} module.
 *
 * The generic class lives alongside {@link Result} in `Result.ts` to avoid
 * circular dependencies. This file keeps it discoverable at the expected path.
 */
export { ResultOfT } from './Result.js';
