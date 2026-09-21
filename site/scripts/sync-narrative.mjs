// Copies repository-level narrative documents into the Starlight content tree.
//
// The canonical files stay in the repository (docs/ and each module's
// README.md) so that readers of the source tree and readers of the published
// site see the same text. The generated copies are gitignored and rewritten on
// every dev/build run, which keeps them from drifting.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { modules, specDescriptions } from '../modules.mjs';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(siteRoot, '..');
const repositorySlug = 'sandlada/result';
const repositoryFileURL = (file) => `https://github.com/${repositorySlug}/blob/main/${file}`;

const specDocuments = modules.map((module) => {
    const description = specDescriptions[module];

    if (!description) {
        throw new Error(
            `Missing spec description for module '${module}' in site/modules.mjs. ` +
                'Add an entry so the synced /specs/ page has search metadata.',
        );
    }

    return {
        source: `src/${module}/README.md`,
        target: `src/content/docs/specs/${module}.md`,
        description,
    };
});

/** Narrative documents to publish, in sidebar order. */
const documents = [
    {
        source: 'docs/behavior-modes.md',
        target: 'src/content/docs/behavior-modes.md',
        description:
            "The library's single source of truth for error handling: terminology and the throw / failure / empty-input table for every API.",
    },
    ...specDocuments,
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
        }) + rewriteRepositoryLinks(withoutHeading.trimStart(), sourcePath),
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

// Repository-relative links do not resolve inside the published site. Resolve
// each target against the source file's directory and map it:
//   - synced documents (behavior-modes, sibling module specs) stay internal;
//   - every other repository file points at its GitHub page.
// Fragments are kept; GitHub and Starlight resolve the anchor themselves.
function rewriteRepositoryLinks(markdown, sourcePath) {
    const sourceDirectory = dirname(sourcePath);

    return markdown.replaceAll(/\]\(([^)\s]+)\)/g, (match, target) => {
        if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) {
            return match;
        }

        const [path, ...fragments] = target.split('#');
        const fragment = fragments.length > 0 ? `#${fragments.join('#')}` : '';
        const resolved = relative(repositoryRoot, resolve(sourceDirectory, path)).replaceAll('\\', '/');

        return `](${mapRepositoryTarget(resolved)}${fragment})`;
    });
}

function mapRepositoryTarget(file) {
    if (file === 'docs/behavior-modes.md') {
        return '/behavior-modes/';
    }

    const spec = file.match(/^src\/([a-z-]+)\/README\.md$/);

    if (spec) {
        return `/specs/${spec[1]}/`;
    }

    return repositoryFileURL(file);
}
