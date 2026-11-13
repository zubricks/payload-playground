# Payload v4 Admin UI Starter

This project starts with Payload's website template, then replaces the generic dashboard experience
with configurable widgets, custom views, a Light Cream Admin theme, and components from
`@payloadcms/ui`. It is both a usable starter and a side-by-side demonstration of the Admin UI
patterns that changed between v3 and v4.

**Here for the Hierarchies demo?** Follow the [first-time setup](#run-the-reference-project),
then run `pnpm seed:hierarchy`. The shared-folder configuration is already included in this repo.

> [!IMPORTANT]
> This project currently uses Payload
> [`4.0.0-beta.8`](https://github.com/payloadcms/payload/releases/tag/v4.0.0-beta.8). Pin the version
> and test the full upgrade path before applying these patterns to a production project.

Payload v3 could be customized extensively, but deep Admin styling often meant targeting internal
class names and reproducing states component by component. That CSS was difficult to reason about,
especially across light and dark modes, and could be fragile during upgrades.

Payload v4 provides a better foundation:

- Semantic design roles can change a family of components from one shared value.
- Components from `@payloadcms/ui` can be used in project-owned views and widgets.
- Dashboard widgets can be registered, resized, reordered, added, and removed by users.
- Custom experiences can retain Payload's interaction, validation, accessibility, and color-mode
  behavior instead of rebuilding it.

The result here is deliberately more than a reskin. It demonstrates how native Payload components
and custom product UI can operate as one system.

## What is implemented

### Configurable dashboard

The primary dashboard uses Payload's widget system rather than a single hard-coded custom view.
Editors can personalize the layout while the project supplies a useful default arrangement.

The included widgets demonstrate:

- Permission-aware Local API queries
- Server-rendered data with small client-component boundaries
- Width-aware layouts for small, medium, and full-width placements
- Native Payload buttons, pills, tabs, thumbnails, tooltips, and dialogs
- Recent content, editorial priorities, SEO health, forms, quick access, and media states

See [`src/components/ContentStudioDashboard`](src/components/ContentStudioDashboard) and the widget
registration in [`src/payload.config.ts`](src/payload.config.ts).

### Light Cream Admin theme

The app uses the published `@zubricks/payload-admin-ui-themes` package with **Light Cream** as its
only registered Admin theme. It is installed under the `payload-admin-ui-themes` npm alias to match
the component paths in version `0.1.0`. Its density control remains available in each user's Settings menu,
and Payload's light/dark color-mode preference continues to work within Light Cream.

Theme CSS comes from the installed package. [`custom.css`](<src/app/(payload)/custom.css>) remains
in the repository as the standalone v4 styling reference used by the migration comparison.

### Custom views and fields

[`UI Lab`](src/components/UILab) is a custom Admin route built from `@payloadcms/ui` components. It
acts as a reference surface for fields, actions, validation, banners, drawers, and other primitives
outside Payload's standard document views.

[`HeadlineWorkbench`](src/components/HeadlineWorkbench) shows the same approach at field level: a
native text input, Payload form state, validation feedback, and a project-specific preview composed
into one editing experience.

### Website foundation

The public site retains the website template's pages, posts, drafts, live preview, layout blocks,
forms, search, redirects, SEO, header, and footer. It also includes project-level website presets and
repository-owned hero imagery. Website presentation remains separate from the Admin UI treatment.

## Run the reference project

### 1. Clone and install

Requirements: Node.js **24.22.1+**, pnpm **9, 10, or 11**, Git, and a running MongoDB instance
(local or hosted). Use a separate development database for this demo.

```bash
git clone https://github.com/zubricks/payload-playground.git
cd payload-playground
pnpm install
cp .env.example .env
```

Light Cream is installed from npm with the other dependencies; no sibling theme repositories or
separate theme builds are needed. If you already cloned the repo, start with `pnpm install` and
only copy `.env.example` if you do not already have an `.env` file.

### 2. Configure the database and secrets

Edit `.env` before starting the app. The checked-in config uses the MongoDB adapter, so set
`DATABASE_URL` to a MongoDB connection string:

```dotenv
DATABASE_URL=mongodb://127.0.0.1:27017/payload-hierarchy-demo
PAYLOAD_SECRET=replace-with-a-random-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
CRON_SECRET=replace-with-another-random-secret
PREVIEW_SECRET=replace-with-another-random-secret
```

Generate each secret with `openssl rand -hex 32`. For hosted MongoDB, use your connection string
and ensure your database allows connections from your machine. Never commit `.env`.

### 3. Start the app and create your Admin user

```bash
pnpm dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin) and create the first user using your
own email and password. This user is your Site Admin; keep these credentials for signing back in.
**Create this user before running the hierarchy seed**, which uses the oldest existing user as
the author of its demo posts.

### 4. Seed the hierarchy demo

Leave the dev server running. In a second terminal, from `payload-playground`, run:

```bash
pnpm seed:hierarchy
```

This adds **15 folders, 28 media items, 7 pages, and 12 posts**. Images are bundled with the repo,
so this command does not download external photographs. It preserves existing content, navigation,
and edits; rerunning it skips fixtures that already exist. On the first run, the final log reports
the number of documents created. On an unchanged rerun, all four counts are zero.

Refresh the Admin, select the **Folders** sidebar tab, and open
**Exhibitions → The Quiet Spectrum**. Select **Grid** to see its page, three posts, and eight images
together. You are ready to follow along with the video.

If the command says `Create the first Admin user`, complete step 3 using the same `.env` and database.
If the tree is empty, confirm the seed finished successfully and refresh the browser.

### Optional: seed the entire starter

For the full website, dashboard, forms, and hierarchy fixtures, use the full seed instead:

> [!CAUTION]
> `pnpm seed` clears and recreates the content collections, including folders, resets navigation,
> and resets the website theme. Use it only with a disposable demo database. Use
> `pnpm seed:hierarchy` to add the hierarchy fixtures while preserving existing content.

```bash
pnpm seed
```

The full seed also creates published and draft content, incomplete SEO states, forms, submissions,
and a demonstration Content Editor (`demo-author@example.com` / `password`). Continue using your
own Site Admin account for the walkthrough. The hierarchy-only seed does not create this demo user.
The full seed downloads some website-template images and needs an internet connection.

See [`src/endpoints/seed`](src/endpoints/seed) for the implementation.

## Explore the Payload 4 hierarchy demo

After completing the [first-time setup](#run-the-reference-project), the museum demo is ready to
explore. To add it to another configured development database, create its first Admin user and run
`pnpm seed:hierarchy` from the app directory.

In the Admin sidebar, select **Folders → Exhibitions → The Quiet Spectrum**. This folder brings
together one exhibition page, three related posts (including a draft), and eight distinct images.
Use the native grouped **Pages / Posts / Media** sections, **Type** filter, grid/table views,
breadcrumbs, and folder picker to explore the same content across collections. Move a document
into **Permanent Collection → Sculpture & Objects** to demonstrate reorganising content without
changing its website URL.

The complete fixture contains **15 folders, 28 media items, 7 pages, and 12 posts**:

- **Exhibitions:** The Quiet Spectrum, Material Memory, and Open Sky, each with related content.
- **Archives & Records → Exhibition records → 2026:** a deeper branch for breadcrumb navigation.
- **Permanent Collection:** Modern & Contemporary, plus an empty Sculpture & Objects branch for live demos.
- **Public Programs:** Studio workshops and an empty Artist talks branch for creating new content.
- **Conservation → Works on paper:** a page, draft story, and material references.

Pages, posts, and media share `createFolderField({ relationTo: 'folders' })`; the `folders`
collection uses Payload's native `folders: true` hierarchy preset. Folder management requires a
signed-in user. The fixtures use bundled reference photographs, so the additive seed requires no
external image downloads. Exhibition names and editorial stories are fictional; image provenance
is recorded in [`hierarchy-media/README.md`](src/endpoints/seed/hierarchy-media/README.md).

## How shared folders are enabled

This repo already includes both configuration steps below. Installing the beta in another project
provides the APIs; register a folder collection and connect the collections you want to organise.

First, register a collection with `folders: true` in your Payload config's `collections` array.
This is the folder hierarchy itself. The example uses the project's `authenticated` access helper:

```ts
import type { CollectionConfig } from 'payload'
import { authenticated } from './access/authenticated'

const Folders: CollectionConfig = {
  slug: 'folders',
  folders: true,
  admin: { useAsTitle: 'name' },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [{ name: 'name', type: 'text', required: true }],
}
```

Then add a folder relationship to the `fields` array of each participating collection. This project
adds it to **Pages**, **Posts**, and **Media**:

```ts
import { createFolderField } from 'payload'

// Inside each collection's fields array:
createFolderField({ relationTo: 'folders' })
```

Restart the dev server after changing the config. Payload provides the folder sidebar, nested
navigation, and folder picker; seeding supplies the example folders and documents. Folder placement
organises these documents in the Admin. This project's public routes still use each page/post's slug.

See the actual configuration in [`payload.config.ts`](src/payload.config.ts),
[`Pages`](src/collections/Pages/index.ts), [`Posts`](src/collections/Posts/index.ts), and
[`Media`](src/collections/Media.ts). Other hierarchy models, such as tags and self-nested documents,
have their own configuration; this walkthrough focuses on shared folders.

## Using this in an existing project

Treat the repository as a set of patterns, not an all-or-nothing template.

The most reusable pieces are:

- Theme registration in [`payload.config.ts`](src/payload.config.ts)
- Semantic Admin variables demonstrated in [`custom.css`](<src/app/(payload)/custom.css>)
- Widget registration and width constraints from [`payload.config.ts`](src/payload.config.ts)
- Server/client composition from
  [`ContentStudioDashboard`](src/components/ContentStudioDashboard)
- Native component composition from [`UI Lab`](src/components/UILab)
- Custom field integration from [`HeadlineWorkbench`](src/components/HeadlineWorkbench)

Expect to replace widget queries, copy, permissions, collection slugs, brand values, and seed data
with project-specific equivalents. Keep access checks close to every Local API query and verify each
widget at every width you register.

The following pieces exist primarily for evaluation and can be removed from a client delivery:

- The **Compare v3 → v4** dashboard action and `StyleComparison.tsx`
- `custom.v3-reference.css`
- UI Lab, unless the team wants to retain an internal component reference
- Dashboard-specific seed fixtures and demo credentials
