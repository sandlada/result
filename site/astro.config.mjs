import { readFileSync } from 'node:fs';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightLinksValidator from 'starlight-links-validator';
import starlightTypeDoc from 'starlight-typedoc';
import starlightVersions from 'starlight-versions';

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

export default defineConfig({
    site: 'https://result.sandlada.com',
    trailingSlash: 'always',
    output: 'static',
    devToolbar: { enabled: false },
    integrations: [
        starlight({
            title: '@sandlada/result',
            description: 'Type-safe Result Pattern and Railway Oriented Programming for TypeScript.',
            lastUpdated: true,
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
                starlightVersions({ versions }),
                starlightLinksValidator(),
            ],
            sidebar: [
                { label: 'Start Here', items: ['getting-started'] },
                { label: 'Reference', items: ['behavior-modes'] },
                apiSidebarGroup,
            ],
        }),
        mdx(),
        sitemap(),
    ],
});
