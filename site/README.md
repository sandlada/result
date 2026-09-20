# Documentation site

The published documentation for `@sandlada/result` lives at <https://result.sandlada.com>. It is an
[Astro Starlight](https://starlight.astro.build) project in this directory, kept out of the library
build on purpose: `../tsconfig.json`, `../rolldown.config.ts` and `../vitest.config.ts` all scope
themselves to `../src`, so nothing here can leak into the published package.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server. Copies the narrative pages first. |
| `npm run build` | Build to `dist/`. Runs the narrative copy, TypeDoc generation and link validation. |
| `npm run check` | `astro check` — type-checks `.astro` files and page frontmatter. |
| `npm run check:snippets` | Type-checks the examples in `src/snippets/` against `../src`. Requires no library build. |
| `npm run version:new -- <slug> [label]` | Archives the current documentation as a new version. |

## How the content is produced

- **API reference** — `starlight-typedoc` runs TypeDoc over the entry points listed in
  `astro.config.mjs`, one per published subpath export, and writes `src/content/docs/api/`.
  That directory is generated, so it is gitignored. `entryFileName` is `index` so that `/api/`
  lists every module.
- **Behavior modes** — `scripts/sync-narrative.mjs` copies `../docs/behavior-modes.md` into
  `src/content/docs/behavior-modes.md` before every dev/build run. The repository file stays the
  single source of truth; the copy is gitignored and rewritten, so it cannot drift. Links that
  point at repository files are rewritten to GitHub URLs.
- **Hand-written pages** — `src/content/docs/*.md` are edited directly.

`sanitizeComments` is enabled for TypeDoc because JSDoc prose such as `Promise<boolean>` is not
valid MDX, and `starlight-versions` parses every page with `remark-mdx` when it archives a version.

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

## Deployment

Cloudflare Pages builds this directory through its Git integration — there is no deployment job in
`.github/workflows`, where `docs.yml` only verifies the build.

One-time setup in the Cloudflare dashboard:

| Setting | Value |
| --- | --- |
| Root directory | `site` |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION=26` (Astro requires Node >= 22.12) |
| Custom domain | `result.sandlada.com` |

Cloudflare checks out the whole repository, so TypeDoc can read `../src` and `../tsconfig.json`
even though the build runs inside `site/`.

Do not add a version to `versions.json` without running `npm run version:new`, because the next
build would then create the archive itself and the deployed site would describe a version that is
not in the repository. The `Verify the build left the working tree clean` step in `docs.yml` fails
in that situation.
