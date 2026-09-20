// Checks the artifact that `npm run build` is supposed to produce.
//
// `build/` is the only published directory, so a missing declaration file, a
// dangling relative import, or a published test helper silently breaks
// consumers without failing the build. `npm run build` runs this check last.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const buildDirectory = join(repositoryRoot, 'build');
const manifest = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8'));

const problems = [];
const runtimeFiles = [];
const declarationFiles = [];

/** @param {string} subpath @param {string} condition @param {string} file */
function collectArtifacts(subpath, condition, file) {
    const path = resolve(repositoryRoot, file);

    if (!existsSync(path)) {
        problems.push(`${subpath} (${condition}): missing ${file}`);

        return;
    }

    if (condition === 'types') {
        declarationFiles.push(file);

        // Declaration maps are emitted unconditionally by `tsc`, so their absence
        // means `build:types` did not produce the file that is being verified.
        if (!existsSync(`${path}.map`)) {
            problems.push(`${subpath} (${condition}): missing ${file}.map`);
        }
    }

    if (condition === 'default') {
        runtimeFiles.push(file);

        // Re-export barrels carry no local mappings, so Rolldown emits a sourcemap
        // only for modules with code of their own. When a pointer exists, the file
        // it points at has to exist.
        const pointer = readFileSync(path, 'utf8').match(/\/\/# sourceMappingURL=(\S+)/)?.[1];

        if (pointer !== undefined && !existsSync(resolve(dirname(path), pointer))) {
            problems.push(`${subpath} (${condition}): ${file} points at a missing ${pointer}`);
        }
    }
}

for (const [subpath, entry] of Object.entries(manifest.exports)) {
    const conditions = typeof entry === 'string' ? { default: entry } : entry;

    for (const [condition, file] of Object.entries(conditions)) {
        collectArtifacts(subpath, condition, file);
    }
}

// The root entry exports an empty default object so that Rolldown materializes
// the package entry together with a sourcemap; losing either one is a
// regression.
for (const file of Object.values(manifest.exports['.'] ?? {})) {
    const path = resolve(repositoryRoot, file);

    if (existsSync(path) && !existsSync(`${path}.map`)) {
        problems.push(`${file}: missing ${file}.map`);
    }
}

// Declaration files keep the JSDoc of the source because editors and the
// documentation site read them.
for (const file of declarationFiles) {
    const path = resolve(repositoryRoot, file);

    if (existsSync(path) && !readFileSync(path, 'utf8').includes('/**')) {
        problems.push(`${file}: no JSDoc comments found in the declaration file`);
    }
}

// Test infrastructure is never importable through `exports` and must not ship.
for (const file of listFiles(buildDirectory)) {
    const name = relative(buildDirectory, file).replaceAll('\\', '/');

    if (name.startsWith('tests/') || /\.(spec|bench|type-spec)\.(js|js\.map|d\.ts|d\.ts\.map)$/.test(name)) {
        problems.push(`build/${name}: test artifact was published`);
    }
}

// Every published entry has to load as ESM; `preserveModules` output resolves its
// siblings at runtime, so this catches dangling relative imports.
for (const file of new Set(runtimeFiles)) {
    try {
        await import(pathToFileURL(resolve(repositoryRoot, file)).href);
    } catch (error) {
        problems.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

if (problems.length > 0) {
    console.error('The build output is not publishable:');

    for (const problem of problems) {
        console.error(`  - ${problem}`);
    }

    process.exit(1);
}

console.log(
    `Verified ${runtimeFiles.length} runtime entries, ${declarationFiles.length} declaration entries and the entry sourcemaps.`,
);

function listFiles(directory) {
    const files = [];

    if (!existsSync(directory)) {
        return files;
    }

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...listFiles(path));
        } else {
            files.push(path);
        }
    }

    return files;
}
