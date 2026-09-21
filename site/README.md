# Documentation site

The published documentation for `@sandlada/result` lives at <https://result.sandlada.com>. It is an
[Astro Starlight](https://starlight.astro.build) project in this directory, kept out of the library
build on purpose: `../tsconfig.json`, `../rolldown.config.ts` and `../vitest.config.ts` all scope
themselves to `../src`, so nothing here can leak into the published package.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server. Copies the narrative pages first. |
| `npm run build` | Build to `dist/`. Runs the narrative copy, TypeDoc generation, link validation and `verify:seo`. |
| `npm run check` | `astro check` — type-checks `.astro` files and page frontmatter. |
| `npm run check:snippets` | Type-checks the examples in `src/snippets/` against `../src`. Requires no library build. |
| `npm run verify:seo` | Checks the built pages for the search-metadata invariants (titles, descriptions, canonicals, JSON-LD, indexability, sitemap). |
| `npm run generate:icons` | Renders `public/og.png` and `public/apple-touch-icon.png` from their SVG sources. Only needed after editing those sources. |
| `npm run version:new -- <slug> [label]` | Archives the current documentation as a new version. |

## How the content is produced

- **API reference** — `starlight-typedoc` runs TypeDoc over the entry points listed in
  `astro.config.mjs`, one per published subpath export, and writes `src/content/docs/api/`.
  That directory is generated, so it is gitignored. `entryFileName` is `index` so that `/api/`
  lists every module.

  The plugin also ships a `typeDocSidebarGroup`, but it is not used here. It fills its group by
  turning each kind group ("Functions", "Interfaces", …) into an `autogenerate` entry over a
  directory that only exists in the default per-member file layout; with
  `outputFileStrategy: 'modules'` a module is a single page, so that group comes out empty and
  the module labels end up as groups with no links. The sidebar group is built from the same
  `entryPoints` list instead, one link per module, which keeps it in step with generation and
  lets the link validator check every entry.
- **Behavior modes** — `scripts/sync-narrative.mjs` copies `../docs/behavior-modes.md` into
  `src/content/docs/behavior-modes.md` before every dev/build run. The repository file stays the
  single source of truth; the copy is gitignored and rewritten, so it cannot drift. Links that
  point at repository files are rewritten to GitHub URLs.
- **Module specs** — the same sync copies every `../src/<module>/README.md` into
  `src/content/docs/specs/<module>.md`. The module list and the per-page search descriptions live
  in `modules.mjs`, shared with the sidebar so the two cannot drift; a module without a
  description fails the sync. Repository links are resolved against the source file: sibling specs
  and `behavior-modes` stay internal, everything else points at GitHub.
- **Hand-written pages** — `src/content/docs/*.md` are edited directly.
- **API search metadata** — `plugins/seo-api-pages.mjs` runs after `starlight-typedoc` in the
  Starlight `plugins` array and replaces the `title` and `description` frontmatter of every
  generated API page with the curated values from `seo-metadata.mjs`. The generated pages only
  carry the bare module name and no description, so without this step every API page would fall
  back to the site-wide description. A generated page that is missing from the registry fails the
  build; a registry entry that no longer matches a generated page fails `verify:seo`.

`sanitizeComments` is enabled for TypeDoc because JSDoc prose such as `Promise<boolean>` is not
valid MDX, and `starlight-versions` parses every page with `remark-mdx` when it archives a version.

TypeDoc pins each "Defined in" reference to the commit it was built from. GitHub can only serve a
commit once it reaches the remote, so `astro.config.mjs` falls back to the default branch while the
current commit is still local. An already pushed revision is used verbatim, which is what makes an
archived version point at the code it shipped with.

## Styling

`src/styles/custom.css` mirrors Starlight's CSS custom properties — colors, typography, layout,
shadows and z-index — and is registered through the `customCss` option in `astro.config.mjs`.
It starts out identical to the stock theme, so editing a value is what changes the appearance;
deleting a declaration falls back to the Starlight default, while keeping it freezes that value
against Starlight upgrades. The stylesheet is global and unlayered, so it applies to the archived
versions and to the generated API pages as well.

## Versions

Archived versions live in `src/content/docs/<slug>/` and are committed. `versions.json` lists them
and drives the version selector; the newest entry is the most recent release.

```bash
npm run version:new -- 0.20260811        # slug only, label defaults to v0.20260811
npm run version:new -- 0.20260811 v0.20260811
git add src/content/docs/0.20260811 src/content/versions src/versions.json
```

The script refuses to run when the slug is already configured or its directory already exists, and
it verifies afterwards that an API reference was archived. Archiving is performed by
`starlight-versions` during the build, which is why the script always builds.

Unlike the current version, an archive keeps its own copy of `src/content/docs/api/`. The API
reference of a published version therefore stays frozen even as the library evolves.

Archived versions stay reachable for readers, but they are kept out of the index: the route
middleware marks every page under a `versions.json` slug as `noindex`, and the sitemap integration
filters those URLs out. Both read `versions.json`, so a newly archived version is covered
automatically.

## Search metadata

Every page needs metadata that page frontmatter cannot provide, so it is split across three places:

- **`astro.config.mjs`** adds the tags every page shares: `og:image` (the committed
  `public/og.png`), the Twitter image, the theme color, the apple touch icon, and the
  `google-site-verification` / `msvalidate.01` tags when `GOOGLE_SITE_VERIFICATION` /
  `BING_SITE_VERIFICATION` are set in the build environment. The raw robots policy is not set
  here.
- **`src/starlightRouteData.ts`** is Starlight route middleware (registered through the
  `routeMiddleware` config key; the file must not be called `src/middleware.ts`, a path Starlight
  rejects because Astro reserves it). It sets the `robots` policy for every page — `noindex` for
  archived versions and the 404 page, `index, follow, max-image-preview:large` everywhere else —
  switches the home page to `og:type: website`, and injects the JSON-LD blocks (`WebSite` and
  `SoftwareSourceCode` on the home page, `TechArticle` plus `BreadcrumbList` elsewhere).
- **`seo-metadata.mjs`** holds the curated titles and descriptions of the generated API pages;
  see "How the content is produced".

`public/robots.txt` points crawlers at `sitemap-index.xml`. `scripts/verify-seo.mjs` runs as part
of `npm run build` and fails when a page loses its title, description, canonical, social image,
JSON-LD, robots policy, or when the sitemap and the built pages disagree. Editing `assets/og.svg`
or `public/favicon.svg` requires `npm run generate:icons` so the committed PNGs match.

## Deployment

The site is deployed as a Cloudflare Worker that serves static assets. `wrangler.jsonc` in this
directory defines it: the Worker has no script, it uploads `dist/` and serves the generated
`404.html` for unknown paths. Cloudflare builds the project through Workers Builds, which is what
the dashboard offers when a repository is connected; there is no deployment job in
`.github/workflows`, where `docs.yml` only verifies the build.

| Setting | Value |
| --- | --- |
| Project name | `result` (must match `name` in `wrangler.jsonc`) |
| Production branch | `main` |
| Build command | `cd site && npm ci && npm run build` |
| Deploy command | `cd site && npx wrangler deploy` |
| Environment variable | `NODE_VERSION=26` (Astro requires Node >= 22.12) |
| Custom domain | `result.sandlada.com` |

The `cd site` prefix in both commands keeps them independent of any root-directory setting. If the
project is instead configured with `site` as its root directory, drop the prefix.

`npx wrangler deploy --dry-run --config site/wrangler.jsonc` validates the configuration locally
without authenticating, including that the assets directory resolves.

`.node-version` pins the same Node version inside the build root, so the version travels with the
repository even if the environment variable is ever missing.

Cloudflare checks out the whole repository, so TypeDoc can read `../src` and `../tsconfig.json`
even though the build runs inside `site/`.

Workers Builds rebuilds on every change in the repository; unlike Pages it has no build watch
paths, so unrelated commits also trigger a build.

Do not add a version to `versions.json` without running `npm run version:new`, because the next
build would then create the archive itself and the deployed site would describe a version that is
not in the repository. The `Verify the build left the working tree clean` step in `docs.yml` fails
in that situation.
