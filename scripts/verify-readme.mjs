// Verifies that the module READMEs are the single, in-sync API index.
//
// Each `src/<module>/README.md` is the spec for `@sandlada/result/<module>`.
// README drift used to be invisible (the old root API index fell behind the
// barrels); this script turns it into a build failure. `npm run build` runs it
// as part of `verify:build`.
//
// Checks:
//   1. every `src/<module>/index.ts` re-export (value + type + `default`)
//      appears exactly once in the README's `## API` tables, and vice versa;
//      a barrel that is not a pure re-export list fails here as well;
//   2. every module directory has a README, and the root README names its
//      subpath;
//   3. the AGENTS.md module map and package.json `exports` agree with the
//      module directories;
//   4. every repository-relative link in a module README resolves.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(repositoryRoot, 'src');
const manifest = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8'));
const agents = readFileSync(join(repositoryRoot, 'AGENTS.md'), 'utf8');
const rootReadme = readFileSync(join(repositoryRoot, 'README.md'), 'utf8');

const problems = [];
const checksRun = [];

// --- Module discovery -------------------------------------------------------

const modules = readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'tests')
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(sourceRoot, name, 'index.ts')))
    .sort();

// The root barrel mirrors `types`; both are verified against the same README.
const barrelsByModule = new Map(
    modules.map((name) => [name, [join(sourceRoot, name, 'index.ts')]]),
);
barrelsByModule.get('types').push(join(sourceRoot, 'index.ts'));

// --- Barrels ----------------------------------------------------------------

const EXPORT_FROM = /export\s+(type\s+)?\{([\s\S]*?)\}\s*from\s*['"][^'"]+['"];?/g;
const EXPORT_DEFAULT = /export\s+default\b/g;

/** @param {string} file */
function parseBarrel(file) {
    const source = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const runtime = new Set();
    const types = new Set();

    const remaining = source
        .replace(EXPORT_FROM, (_match, typeOnly, body) => {
            for (const raw of body.split(',')) {
                const spec = raw.trim();
                if (!spec) continue;
                const isType = Boolean(typeOnly) || spec.startsWith('type ');
                const name = spec.replace(/^type\s+/, '').split(/\s+as\s+/).pop().trim();
                (isType ? types : runtime).add(name);
            }
            return '';
        })
        .replace(EXPORT_DEFAULT, () => {
            runtime.add('default');
            return '';
        });

    // A barrel is a pure re-export list; any surviving `export` declaration
    // would let README coverage drift silently, so it fails here.
    const violation = remaining.match(/^\s*export\b/m);

    if (violation) {
        problems.push(
            `${relative(repositoryRoot, file).replaceAll('\\', '/')}: barrel declares an export other than a re-export (${violation[0].trim()})`,
        );
    }

    return { runtime, types };
}

// --- READMEs ----------------------------------------------------------------

const HEADING = /^##\s+/;
const API_HEADING = /^##\s+API\s*$/;
const TABLE_ROW = /^\|(.+)\|\s*$/;
const SEPARATOR_CELL = /^\s*:?-+:?\s*$/;

/** @param {string} file */
function parseReadme(file) {
    if (!existsSync(file)) return null;

    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    const start = lines.findIndex((line) => API_HEADING.test(line));

    if (start < 0) {
        problems.push(
            `${relative(repositoryRoot, file).replaceAll('\\', '/')}: missing a \`## API\` section`,
        );
        return { runtime: new Set(), types: new Set(), duplicates: [] };
    }

    const runtime = new Set();
    const types = new Set();
    const duplicates = [];

    for (const line of lines.slice(start + 1)) {
        if (HEADING.test(line)) break;

        const row = line.match(TABLE_ROW);
        if (!row) continue;

        const firstCell = row[1].split('|')[0].trim();
        if (firstCell === 'Export' || SEPARATOR_CELL.test(firstCell)) continue;

        const isTypeRow = firstCell.includes('(type)');
        const names = [...firstCell.matchAll(/`([A-Za-z_$][\w$]*)`/g)].map((match) => match[1]);
        const target = isTypeRow ? types : runtime;

        for (const name of names) {
            if (target.has(name)) duplicates.push(name);
            target.add(name);
        }
    }

    return { runtime, types, duplicates };
}

/** @param {string} markdown */
function* relativeLinks(markdown) {
    for (const match of markdown.matchAll(/\]\(([^)\s]+)\)/g)) {
        yield match[1];
    }
}

/** @param {string} file @param {string} markdown */
function checkLinks(file, markdown) {
    for (const target of relativeLinks(markdown)) {
        if (target.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;

        const path = decodeURIComponent(target.split('#')[0]);

        if (path.length === 0) continue;

        if (!existsSync(resolve(dirname(file), path))) {
            problems.push(
                `${relative(repositoryRoot, file).replaceAll('\\', '/')}: link target does not exist: ${target}`,
            );
        }
    }
}

// --- Per-module verification ------------------------------------------------

for (const name of modules) {
    const readmeFile = join(sourceRoot, name, 'README.md');
    const relativeReadme = `src/${name}/README.md`;
    const readme = parseReadme(readmeFile);

    if (readme === null) {
        problems.push(`${relativeReadme}: missing module README`);
        continue;
    }

    for (const duplicate of readme.duplicates) {
        problems.push(`${relativeReadme}: \`${duplicate}\` is listed more than once`);
    }

    for (const [barrelFile, barrel] of barrelsByModule.get(name).map((file) => [file, parseBarrel(file)])) {
        const barrelName = relative(repositoryRoot, barrelFile).replaceAll('\\', '/');

        for (const exported of barrel.runtime) {
            if (!readme.runtime.has(exported)) {
                problems.push(`${barrelName}: runtime export \`${exported}\` is not documented in ${relativeReadme}`);
            }
        }

        for (const documented of readme.runtime) {
            if (!barrel.runtime.has(documented)) {
                problems.push(`${relativeReadme}: \`${documented}\` is not a runtime export of ${barrelName}`);
            }
        }

        for (const exported of barrel.types) {
            if (!readme.types.has(exported)) {
                problems.push(`${barrelName}: type export \`${exported}\` is not documented in ${relativeReadme}`);
            }
        }

        for (const documented of readme.types) {
            if (!barrel.types.has(documented)) {
                problems.push(`${relativeReadme}: \`${documented}\` is not a type export of ${barrelName}`);
            }
        }
    }

    const markdown = readFileSync(readmeFile, 'utf8');

    // Every module except `types` defers its throw policy to the canonical matrix.
    if (name !== 'types' && !markdown.includes('docs/behavior-modes.md')) {
        problems.push(`${relativeReadme}: missing a link to docs/behavior-modes.md`);
    }

    if (!agents.includes(relativeReadme)) {
        problems.push(`AGENTS.md: module map is missing ${relativeReadme}`);
    }

    if (name !== 'types' && !(`./${name}` in manifest.exports)) {
        problems.push(`package.json: \`exports\` is missing "./${name}"`);
    }

    if (!rootReadme.includes(`@sandlada/result/${name}`)) {
        problems.push(`README.md: API overview is missing @sandlada/result/${name}`);
    }

    checkLinks(readmeFile, markdown);
    checksRun.push(name);
}

// --- package.json exports must not define unknown modules -------------------

for (const subpath of Object.keys(manifest.exports)) {
    if (subpath === '.') continue;

    const name = subpath.replace(/^\.\//, '');

    if (!modules.includes(name)) {
        problems.push(`package.json: \`exports\` defines "${subpath}" but src/${name}/index.ts does not exist`);
    }
}

checkLinks(join(repositoryRoot, 'README.md'), rootReadme);
checkLinks(join(repositoryRoot, 'AGENTS.md'), agents);

if (problems.length > 0) {
    console.error('The module READMEs are not in sync with the source:');

    for (const problem of problems) {
        console.error(`  - ${problem}`);
    }

    process.exit(1);
}

console.log(
    `Verified ${checksRun.length} module READMEs against their barrels, the AGENTS.md module map and package.json exports.`,
);
