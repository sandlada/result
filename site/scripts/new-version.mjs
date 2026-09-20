// Archives the current documentation as a versioned snapshot.
//
// starlight-versions archives the current docs into `src/content/docs/<slug>/`
// during `astro build` whenever a configured version has no directory yet. It
// runs after starlight-typedoc inside the same build, so the snapshot contains
// the API reference generated from the current source.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const versionsFile = resolve(siteRoot, 'versions.json');
const docsDir = resolve(siteRoot, 'src/content/docs');
const slug = process.argv[2];
const label = process.argv[3] ?? `v${slug}`;

if (!slug || slug.includes('/') || slug.includes('\\')) {
    console.error('Usage: node scripts/new-version.mjs <slug> [label]');
    console.error('Example: node scripts/new-version.mjs 0.20260811');
    process.exit(1);
}

const versions = JSON.parse(readFileSync(versionsFile, 'utf8')).versions;

if (versions.some((version) => version.slug === slug)) {
    console.error(`Version '${slug}' is already configured.`);
    process.exit(1);
}

if (existsSync(resolve(docsDir, slug))) {
    console.error(`Version directory 'src/content/docs/${slug}/' already exists.`);
    process.exit(1);
}

writeVersions([{ slug, label }, ...versions]);
console.log(`Configured version '${slug}' (${label}) in site/versions.json.`);

console.log('Archiving the current documentation...');
runBuild();

if (!existsSync(resolve(docsDir, slug))) {
    console.error(`Expected 'src/content/docs/${slug}/' to be created, but it is missing.`);
    process.exit(1);
}

if (!existsSync(resolve(docsDir, slug, 'api'))) {
    console.error(`Expected 'src/content/docs/${slug}/api/' to be archived, but it is missing.`);
    process.exit(1);
}

console.log(`
Archived the current documentation as '${slug}'.

Next steps:
  git add site/src/content/docs/${slug} site/src/content/versions/${slug}.json site/versions.json
  git commit -m "docs(site): archive documentation for ${label}"
`);

function writeVersions(next) {
    writeFileSync(versionsFile, `${JSON.stringify({ versions: next }, null, 4)}\n`);
}

function runBuild() {
    execFileSync('npm', ['run', 'build'], {
        cwd: siteRoot,
        shell: process.platform === 'win32',
        stdio: 'inherit',
    });
}
