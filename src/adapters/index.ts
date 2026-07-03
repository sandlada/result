/**
 * Adapters — barrel export.
 *
 * Re-exports adapter/interop functions for bridging between Result and other patterns.
 */

export { switchFn } from './switchFn.js';
export { switchFnAsync } from './switchFnAsync.js';
export { liftMap } from './liftMap.js';
export { tee } from './tee.js';
export { teeAsync } from './teeAsync.js';
export { toOption } from './toOption.js';
export { fromOption } from './fromOption.js';
