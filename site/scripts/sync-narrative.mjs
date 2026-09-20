// Copies repository-level narrative documents into the Starlight content tree.
//
// The canonical files stay in the repository root (docs/, ARCH.md, SPEC.md) so
// that readers of the source tree and readers of the published site see the same
// text. The generated copies are gitignored and rewritten on every dev/build
// run, which keeps them from drifting.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(siteRoot, '..');
const repositorySlug = 'sandlada/result';
const repositoryFileURL = (file) => `https://github.com/${repositorySlug}/blob/main/${file}`;

/** Narrative documents to publish, in sidebar order. */
const documents = [
    {
        source: 'docs/behavior-modes.md',
        target: 'src/content/docs/behavior-modes.md',
        description:
            "The library's single source of truth for error handling: terminology and the throw / failure / empty-input table for every API.",
    },
];

for (const document of documents) {
    const sourcePath = resolve(repositoryRoot, document.source);
    const targetPath = resolve(siteRoot, document.target);
    const { frontmatter, body } = splitFrontmatter(readFileSync(sourcePath, 'utf8'));
    const heading = body.match(/^#\s+(.+)$/m);
    const title = frontmatter.title ?? (heading ? heading[1].trim() : document.source);

    // The source file's own H1 becomes the Starlight page title, so drop it from
    // the body to avoid rendering two top-level headings.
    const withoutHeading = heading ? body.replace(heading[0], '') : body;

    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(
        targetPath,
        renderFrontmatter({
            title,
            description: frontmatter.description ?? document.description,
        }) + rewriteRepositoryLinks(withoutHeading.trimStart()),
    );
    console.log(`Synced ${document.source} -> site/${document.target}`);
}

function splitFrontmatter(markdown) {
    const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

    if (!match) {
        return { frontmatter: {}, body: markdown };
    }

    const frontmatter = {};

    for (const line of match[1].split(/\r?\n/)) {
        const entry = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);

        if (entry) {
            frontmatter[entry[1]] = entry[2].replace(/^['"]|['"]$/g, '');
        }
    }

    return { frontmatter, body: markdown.slice(match[0].length) };
}

function renderFrontmatter(values) {
    const lines = Object.entries(values).map(([key, value]) => `${key}: ${JSON.stringify(value)}`);

    return `---\n${lines.join('\n')}\n---\n\n`;
}

// Repository-relative links such as `../SPEC.md` or `../src/factories/ok.ts`
// do not resolve inside the published site, so point them at the file in the
// repository instead. Fragments are kept; GitHub resolves the file itself.
function rewriteRepositoryLinks(markdown) {
    return markdown.replaceAll(/\]\((?:\.\.\/)+([^)\s]+)\)/g, (_match, target) => `](${repositoryFileURL(target)})`);
}
