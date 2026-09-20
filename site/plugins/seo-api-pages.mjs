// Applies the curated search metadata to the generated TypeDoc pages.
//
// `starlight-typedoc` rewrites `src/content/docs/api/` during its own
// `config:setup` hook and hardcodes the bare module name as the frontmatter
// title, without a description. This plugin is configured after it in the
// Starlight `plugins` array, so its `config:setup` runs once the pages exist
// and before content collections are loaded, and replaces those fields with
// the values registered in `seo-metadata.mjs`.
//
// A generated page without a registry entry fails the build: adding a subpath
// to the TypeDoc entry points must not silently ship a page that falls back to
// the site-wide description.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiPages } from '../seo-metadata.mjs';

const apiDirectory = fileURLToPath(new URL('../src/content/docs/api', import.meta.url));

const seoApiPages = {
    name: 'seo-api-pages',
    hooks: {
        'config:setup'({ logger }) {
            const pages = readdirSync(apiDirectory)
                .filter((file) => file.endsWith('.md'))
                .sort();
            const missing = pages
                .map((file) => file.slice(0, -'.md'.length))
                .filter((module) => !(module in apiPages));

            if (missing.length > 0) {
                throw new Error(
                    `Generated API pages without curated search metadata: ${missing.join(', ')}. ` +
                        'Add an entry to site/seo-metadata.mjs (module name -> title and description).',
                );
            }

            for (const file of pages) {
                const module = file.slice(0, -'.md'.length);
                const { title, description } = apiPages[module];
                const path = join(apiDirectory, file);
                const contents = readFileSync(path, 'utf8');

                writeFileSync(path, applyMetadata(contents, module, title, description));
            }

            logger.info(`Applied curated search metadata to ${pages.length} generated API pages.`);
        },
    },
};

/**
 * Replaces the `title` and `description` frontmatter fields of a generated
 * page, keeping every other field and the body untouched. `JSON.stringify`
 * produces a YAML double-quoted scalar, which is valid for both fields.
 */
function applyMetadata(contents, module, title, description) {
    const frontmatter = contents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);

    if (!frontmatter) {
        throw new Error(`Generated API page ${module}.md has no frontmatter to update.`);
    }

    const kept = frontmatter[1]
        .split(/\r?\n/)
        .filter((line) => !/^(title|description):/.test(line));
    const fields = [
        `title: ${JSON.stringify(title)}`,
        `description: ${JSON.stringify(description)}`,
        ...kept,
    ];

    return `---\n${fields.join('\n')}\n---\n${contents.slice(frontmatter[0].length)}`;
}

export default seoApiPages;
