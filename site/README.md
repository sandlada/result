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
- **Hand-written pages** — `src/content/docs/*.md` are edited directly.

`sanitizeComments` is enabled for TypeDoc because JSDoc prose such as `Promise<boolean>` is not
valid MDX, and `starlight-versions` parses every page with `remark-mdx` when it archives a version.

TypeDoc pins each "Defined in" reference to the commit it was built from. GitHub can only serve a
commit once it reaches the remote, so `astro.config.mjs` falls back to the default branch while the
current commit is still local. An already pushed revision is used verbatim, which is what makes an
archived version point at the code it shipped with.

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
| Production branch | `main` |
| Custom domain | `result.sandlada.com` |

`.node-version` pins the same Node version inside the build root, so the version travels with the
repository even if the environment variable is ever missing.

Cloudflare checks out the whole repository, so TypeDoc can read `../src` and `../tsconfig.json`
even though the build runs inside `site/`.

Every push to `main` rebuilds the project by default. Build watch paths can narrow that down to the
files this site actually reads: `site/**`, `src/**`, `docs/**`, `tsconfig.json` and `package.json`.

Do not add a version to `versions.json` without running `npm run version:new`, because the next
build would then create the archive itself and the deployed site would describe a version that is
not in the repository. The `Verify the build left the working tree clean` step in `docs.yml` fails
in that situation.
