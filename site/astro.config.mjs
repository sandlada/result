import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://result.sandlada.com',
    trailingSlash: 'always',
    output: 'static',
    devToolbar: { enabled: false },
    integrations: [
        starlight({
            title: '@sandlada/result',
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/sandlada/result' },
            ],
        }),
        mdx(),
        sitemap(),
    ],
});
