// Removes the build output directory.
//
// `npm run build` starts by clearing `build/` so that a release can never mix
// output from two builds. The removal is done with Node instead of a shell
// command so that the same script works on every platform.
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const buildDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'build');

rmSync(buildDirectory, { recursive: true, force: true });

console.log('Removed build/');
