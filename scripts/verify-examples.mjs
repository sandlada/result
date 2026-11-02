// Compiles every JSDoc `@example` block in `src/` and every fenced `` ```ts `` block
// in the repository root `README.md` so published snippets cannot drift from the API.
//
// Each example is written to `.examples/` (gitignored, wiped on every run) and
// checked with `tsc --noEmit -p tsconfig.examples.json`, which maps
// `@sandlada/result/*` to the source barrels. `npm run build` runs this check
// as part of `verify:build`.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = join(repositoryRoot, 'src');
const examplesRoot = join(repositoryRoot, '.examples');
const tsconfig = join(repositoryRoot, 'tsconfig.examples.json');

rmSync(examplesRoot, { recursive: true, force: true });
mkdirSync(examplesRoot, { recursive: true });

const files = collect(sourceRoot);
const generated = [];
const problems = [];
// Every public example under src/ must show an input and a following step.
const enforcedRoots = [];

for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const examples = extractExamples(text);

    const relativeFile = relative(repositoryRoot, file).replaceAll('\\', '/');
    if (enforced(relativeFile)) {
        examples.forEach((example, index) => {
            const problem = exampleShapeProblem(example);
            if (problem) problems.push(`${relativeFile} example ${index + 1}: ${problem}`);
        });
    }

    examples.forEach((example, index) => {
        const name = `${relative(repositoryRoot, file).replace(/^src[\\/]/, '').replace(/[\\/]/g, '-').replace(/\.ts$/, '')}-${index + 1}.ts`;
        const header = `// Generated from ${relative(repositoryRoot, file).replaceAll('\\', '/')} — do not edit.\n\n`;
        writeFileSync(join(examplesRoot, name), `${header}${example.trimEnd()}\n\nexport {};\n`);
        generated.push({ name, source: relative(repositoryRoot, file).replaceAll('\\', '/') });
    });
}

const rootReadmePath = join(repositoryRoot, 'README.md');
const rootReadmeText = readFileSync(rootReadmePath, 'utf8');
const readmeExamples = extractMarkdownTsFences(rootReadmeText);

if (readmeExamples.length === 0) {
    problems.push('README.md: no ```ts fenced blocks found — add compile-checked snippets or fix the extractor.');
}

readmeExamples.forEach((example, index) => {
    const name = `readme-${index + 1}.ts`;
    const header = `// Generated from README.md block ${index + 1} — do not edit.\n\n`;
    writeFileSync(join(examplesRoot, name), `${header}${example.trimEnd()}\n\nexport {};\n`);
    generated.push({ name, source: 'README.md' });
});

if (problems.length > 0) {
    console.error('Example verification failed:\n');
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
}

if (generated.length === 0) {
    console.error('No @example blocks found under src/ — the extractor is broken.');
    process.exit(1);
}

try {
    execFileSync(process.execPath, [
        join(repositoryRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
        '--noEmit',
        '--project',
        tsconfig,
    ], {
        cwd: repositoryRoot,
        stdio: 'pipe',
    });
} catch (error) {
    const output = [error.stdout, error.stderr]
        .map((buffer) => (buffer ? buffer.toString() : ''))
        .join('\n')
        .trim();
    console.error('Example snippets do not compile:\n');
    console.error(output);
    console.error(`\nRegenerate with \`node scripts/verify-examples.mjs\`; sources: ${generated.length} examples.`);
    process.exit(1);
}

const jsdocCount = generated.length - readmeExamples.length;
console.log(
    `Verified ${jsdocCount} JSDoc examples from ${files.length} source files and ${readmeExamples.length} README.md snippet(s).`,
);

function enforced(relativeFile) {
    if (enforcedRoots.length === 0) return relativeFile.startsWith('src/');
    return enforcedRoots.some((root) => relativeFile.startsWith(root));
}

function exampleShapeProblem(example) {
    if (!/^\s*import\s/m.test(example)) return 'missing import';
    const statements = example
        .split('\n')
        .filter((line) => {
            const trimmed = line.trim();
            return trimmed !== '' && !trimmed.startsWith('//') && !trimmed.startsWith('import ');
        });
    if (statements.length < 2) return 'only a single call remains after imports';
    if (!/\b(?:ok|err|ofSome|ofNone|asyncOk|asyncErr|fromPromise|fromSafePromise|tryCatch|tryCatchAsync|fromThrowable|fromPredicate|Promise\.|const )\b/.test(example)) {
        return 'missing an input value';
    }
    return null;
}

function collect(directory) {
    const files = [];
    for (const entry of readdirSync(directory)) {
        const path = join(directory, entry);
        if (statSync(path).isDirectory()) {
            if (entry === 'tests') continue;
            files.push(...collect(path));
            continue;
        }
        if (!entry.endsWith('.ts')) continue;
        if (/\.(spec|type-spec|bench)\.ts$/.test(entry)) continue;
        if (entry === 'globals.d.ts' || !existsSync(path)) continue;
        files.push(path);
    }
    return files;
}

/** Extracts the `ts` fenced blocks that follow an `@example` tag. */
function extractExamples(text) {
    const examples = [];

    for (const comment of text.matchAll(/\/\*\*[\s\S]*?\*\//g)) {
        const lines = comment[0].split(/\r?\n/);

        for (let i = 0; i < lines.length; i++) {
            if (!/^\s*\*\s*@example\b/.test(lines[i])) continue;

            let cursor = i + 1;
            while (cursor < lines.length && !/^\s*\*\s*```/.test(lines[cursor])) cursor++;
            if (cursor >= lines.length) continue;

            const opener = lines[cursor];
            const body = [];
            cursor++;
            while (cursor < lines.length && !/^\s*\*\s*```\s*$/.test(lines[cursor])) {
                body.push(lines[cursor].replace(/^\s*\*\s?/, ''));
                cursor++;
            }

            if (/```\s*ts\b/.test(opener) && body.some((line) => line.trim() !== '')) {
                examples.push(body.join('\n'));
            }
            i = cursor;
        }
    }

    return examples;
}

/** Extracts every `` ```ts `` fenced block from Markdown (repository root README). */
function extractMarkdownTsFences(text) {
    const examples = [];

    for (const match of text.matchAll(/```ts\s*\n([\s\S]*?)```/g)) {
        const body = match[1].trimEnd();
        if (body.trim() !== '') examples.push(body);
    }

    return examples;
}
