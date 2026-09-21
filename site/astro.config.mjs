import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightLinksValidator from 'starlight-links-validator';
import starlightTypeDoc from 'starlight-typedoc';
import starlightVersions from 'starlight-versions';
import seoApiPages from './plugins/seo-api-pages.mjs';
import { modules } from './modules.mjs';
import { packageName, siteDescription, siteUrl } from './seo-metadata.mjs';

// The TypeScript entry points documented in the API reference. Each one mirrors a
// published subpath export of `@sandlada/result`. The root barrel is not listed
// because it re-exports the same type contracts as `/types` without adding a
// runtime API.
const entryPoints = [
    '../src/types/index.ts',
    '../src/factories/index.ts',
    '../src/operators/index.ts',
    '../src/option/index.ts',
    '../src/async-result/index.ts',
    '../src/async-option/index.ts',
    '../src/promise-result/index.ts',
    '../src/promise-option/index.ts',
    '../src/composition/index.ts',
    '../src/adapters/index.ts',
    '../src/combine/index.ts',
    '../src/reliability/index.ts',
    '../src/observability/index.ts',
    '../src/primitives/index.ts',
];

const { versions } = JSON.parse(readFileSync(new URL('./versions.json', import.meta.url), 'utf8'));

// TypeDoc links every "Defined in" reference to the commit it was built from. GitHub can
// only serve that commit once it reaches the remote, so a preview of unpushed work would
// point every reference at a page that does not exist. Revisions that already exist on
// the remote are kept, which is what makes an archived version point at the code it
// shipped with.
function resolveSourceRevision() {
    const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
    const git = (args) => execFileSync('git', args, { cwd: repositoryRoot, encoding: 'utf8' }).trim();

    try {
        const revision = git(['rev-parse', 'HEAD']);

        return git(['branch', '--remotes', '--contains', revision]).length > 0 ? revision : 'main';
    } catch {
        return 'main';
    }
}

const sourceRevision = resolveSourceRevision();

// starlight-typedoc only fills its sidebar group for the default per-member file
// layout: it turns each kind group ("Functions", "Interfaces", …) into an
// `autogenerate` entry over a directory that only exists in that layout. With
// `outputFileStrategy: 'modules'` every module is a single page, so the group it
// generates for a module contains nothing. The group is built here instead, from the
// same entry point list that drives generation, which also means every entry is a
// link the link validator checks.
const apiSidebarGroup = {
    label: 'API Reference',
    items: entryPoints.map((entryPoint) => {
        const module = entryPoint.split('/').at(-2);

        return { label: module, link: `/api/${module}/` };
    }),
};

// Search-engine ownership checks are supplied by the build environment, so the
// tokens stay out of the repository. Set them on the Workers Builds project.
const verificationMeta = (name, token) =>
    token ? [{ tag: 'meta', attrs: { name, content: token } }] : [];

// Tags every page needs. Route-dependent metadata (robots, JSON-LD, og:type on
// the home page) is added by `src/starlightRouteData.ts`.
const head = [
    { tag: 'meta', attrs: { property: 'og:image', content: `${siteUrl}/og.png` } },
    { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
    { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
    {
        tag: 'meta',
        attrs: {
            property: 'og:image:alt',
            content: `${packageName}: ${siteDescription}`,
        },
    },
    { tag: 'meta', attrs: { name: 'twitter:image', content: `${siteUrl}/og.png` } },
    { tag: 'meta', attrs: { name: 'theme-color', content: '#00531f' } },
    { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
    ...verificationMeta('google-site-verification', process.env.GOOGLE_SITE_VERIFICATION),
    ...verificationMeta('msvalidate.01', process.env.BING_SITE_VERIFICATION),
];

export default defineConfig({
    site: siteUrl,
    trailingSlash: 'always',
    output: 'static',
    devToolbar: { enabled: false },
    integrations: [
        starlight({
            title: '@sandlada/result',
            description: siteDescription,
            customCss: ['./src/styles/custom.css'],
            lastUpdated: true,
            head,
            routeMiddleware: ['./src/starlightRouteData.ts'],
            editLink: {
                baseUrl: 'https://github.com/sandlada/result/edit/main/site/',
            },
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/sandlada/result' },
            ],
            plugins: [
                starlightTypeDoc({
                    entryPoints,
                    tsconfig: '../tsconfig.json',
                    output: 'api',
                    typeDoc: {
                        outputFileStrategy: 'modules',
                        entryFileName: 'index',
                        useHTMLEncodedBrackets: true,
                        // Keeps every "Defined in" reference resolvable; see resolveSourceRevision.
                        gitRevision: sourceRevision,
                        // The project name becomes the title of the generated module index,
                        // so it reads "API Reference" instead of repeating the site title.
                        name: 'API Reference',
                        // JSDoc prose such as `Promise<boolean>` is invalid MDX, and
                        // starlight-versions parses every page with remark-mdx when it
                        // archives a version. Sanitising the comments keeps generated
                        // pages parseable without constraining how JSDoc is written.
                        sanitizeComments: true,
                    },
                }),
                // Runs after starlightTypeDoc regenerated the API pages and before
                // starlightVersions archives them, so curated metadata is what gets
                // archived as well.
                seoApiPages,
                starlightVersions({ versions }),
                starlightLinksValidator(),
            ],
            sidebar: [
                { label: 'Start Here', items: ['getting-started'] },
                { label: 'Reference', items: ['behavior-modes'] },
                { label: 'Module specs', items: modules.map((module) => `specs/${module}`) },
                apiSidebarGroup,
            ],
        }),
        mdx(),
        sitemap({
            // Archived versions stay reachable but are kept out of the index:
            // they duplicate the current pages and carry a `noindex` robots tag.
            filter: (page) =>
                !versions.some((version) => new URL(page).pathname.startsWith(`/${version.slug}/`)),
        }),
    ],
});
