# Payload v4 Admin Starter

An opinionated Payload starter for building polished, client-facing Admin experiences. It combines
the official website template with a modular dashboard, custom views, reusable `@payloadcms/ui`
components, semantic theming, realistic seed data, and practical Payload v3 → v4 migration examples.

> [!IMPORTANT]
> This project currently uses Payload `4.0.0-canary.34`. Canary releases are useful for exploring
> v4, but pin and test the version carefully before using this starter in production.

## Who this is for

### Starting a new Payload project

Use the included patterns to learn how to:

- Register modular dashboard widgets that users can add, remove, resize, and reorder.
- Query Payload safely from server-rendered widgets.
- Add client-side interaction only where it is needed.
- Build custom views and fields with components from `@payloadcms/ui`.
- Brand the Admin UI with semantic design tokens instead of internal selectors.
- Seed realistic pages, posts, media, forms, and submissions.

Start with [Admin patterns](docs/ADMIN-PATTERNS.md).

### Upgrading from Payload v3

Use the project as a working migration reference for:

- Replacing elevation-based variables with semantic color roles.
- Replacing implementation-specific CSS selectors with supported component props and shared tokens.
- Moving custom inputs onto v4's shared form primitives.
- Rebuilding a bespoke dashboard as configurable widgets.
- Comparing representative v3 and v4 styling directly inside the Admin UI.

Start with the [official Payload 3.0 → 4.0 migration guide](docs/v4.mdx), copied verbatim from the
Payload documentation repository until the published guide is available to link directly.

## What the starter demonstrates

| Area              | What to explore                                                        | Source                                                                             |
| ----------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Modular dashboard | Default layout, widget registration, width constraints                 | [`src/payload.config.ts`](src/payload.config.ts)                                   |
| Dashboard widgets | Permission-aware server queries and reusable Payload components        | [`src/components/ContentStudioDashboard`](src/components/ContentStudioDashboard)   |
| v3/v4 comparison  | Native tooltip, dialog, tabs, buttons, pills, and code comparison      | [`StyleComparison.tsx`](src/components/ContentStudioDashboard/StyleComparison.tsx) |
| UI Lab            | Custom Admin view using fields, cards, drawers, banners, and buttons   | [`src/components/UILab`](src/components/UILab)                                     |
| Custom text field | A large `TextInput` with validation state and a search preview         | [`src/components/HeadlineWorkbench`](src/components/HeadlineWorkbench)             |
| Admin theme       | Brand, surface, typography, spacing, radius, and control tokens        | [`src/app/(payload)/custom.css`](<src/app/(payload)/custom.css>)                   |
| v3 reference      | Dormant show-and-tell CSS illustrating the old selector-heavy approach | [`custom.v3-reference.css`](<src/app/(payload)/custom.v3-reference.css>)           |
| Demo content      | Posts, pages, media, forms, submissions, and useful widget states      | [`src/endpoints/seed`](src/endpoints/seed)                                         |

## Quick start

### Requirements

- Node.js `24.15.0` or newer
- pnpm 9, 10, or 11
- MongoDB available locally or through a hosted connection string

### Run locally

1. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

2. Set at least `DATABASE_URL` and `PAYLOAD_SECRET` in `.env`.

3. Install dependencies and start the development server:

   ```bash
   pnpm install
   pnpm dev
   ```

4. Open [http://localhost:3000/admin](http://localhost:3000/admin) and create the first user.

5. Seed the demo content if you are working with an empty or disposable database:

   ```bash
   pnpm seed
   ```

6. Return to the Admin dashboard to explore the populated widgets.

## Seeding

`pnpm seed` creates the content needed to demonstrate every dashboard state, including published and
draft posts, pages with incomplete SEO, recent media, and form submissions.

> [!CAUTION]
> Seeding is destructive. It clears the template's content collections and globals before recreating
> them. Never run it against a database containing content you need to keep.

The seeded demonstration user is:

- Email: `demo-author@example.com`
- Password: `password`

The seed implementation lives in [`src/endpoints/seed/index.ts`](src/endpoints/seed/index.ts), and the
dashboard-specific fixtures live in
[`src/endpoints/seed/dashboard-demo.ts`](src/endpoints/seed/dashboard-demo.ts).

## Suggested learning path

1. Open the dashboard and resize or reorder its widgets.
2. Open **Compare v3 → v4** in the welcome widget.
3. Open **UI Lab** to see Payload components used in a fully custom view.
4. Edit a Page or Post title to use the custom Headline Workbench field.
5. Change the brand and surface values in `custom.css` and watch the Admin components update together.
6. Read the widget registration and server/client composition examples in
   [Admin patterns](docs/ADMIN-PATTERNS.md).

## Foundation versus demo material

The project intentionally separates reusable architecture from explanatory material.

### Good foundations to keep

- Permission-aware Local API queries in dashboard widgets
- Server components with small client-component islands
- Semantic theme tokens and Payload spacing/type primitives
- Widget registration and width constraints
- Custom fields composed from `@payloadcms/ui`
- The standard website features: drafts, live preview, SEO, search, forms, and redirects

### Customize for each project

- Widget names, queries, and default layout
- Brand colors, typography, radii, and density
- Collections, access rules, and seeded content
- Dashboard copy and quick actions
- The UI Lab examples that are relevant to your team

### Optional demo material to remove before delivery

- `StyleComparison.tsx` and the **Compare v3 → v4** launcher
- `custom.v3-reference.css`
- UI Lab, if the client does not need an internal component reference
- Dashboard-specific seed fixtures
- Demo credentials and instructional copy

## Common scripts

| Command                   | Purpose                                                      |
| ------------------------- | ------------------------------------------------------------ |
| `pnpm dev`                | Start Payload and Next.js in development mode                |
| `pnpm seed`               | Destructively replace content with the complete demo dataset |
| `pnpm build`              | Generate Payload artifacts and create a production build     |
| `pnpm start`              | Run the production build                                     |
| `pnpm lint`               | Run ESLint                                                   |
| `pnpm test:int`           | Run integration tests                                        |
| `pnpm test:e2e`           | Run Playwright tests                                         |
| `pnpm generate:types`     | Regenerate Payload TypeScript types manually                 |
| `pnpm generate:importmap` | Regenerate the Admin import map manually                     |

Payload normally regenerates types and the import map during development and builds, so the manual
commands are escape hatches rather than routine steps.

## Website features retained from the official template

This starter still includes the production-oriented website foundation:

- Pages and posts with drafts, autosave, scheduled publishing, preview, and live preview
- Layout-building blocks and Lexical rich text
- Media, nested categories, forms, redirects, search, and SEO
- Header and footer globals
- Authenticated authoring and published-content access rules
- Next.js frontend routes, on-demand revalidation, sitemap generation, and deployment support

## Production checklist

- Replace all demo credentials and secrets.
- Choose and pin a Payload version appropriate for production.
- Review every access rule and Local API call.
- Remove migration/demo UI that clients should not see.
- Replace the destructive demo seed workflow with project-specific fixtures or migrations.
- Verify light and dark themes, keyboard navigation, and responsive widget widths.
- Run `pnpm lint`, `pnpm test`, and `pnpm build` under the required Node.js version.

## Further reading

- [Admin patterns](docs/ADMIN-PATTERNS.md)
- [Official Payload 3.0 → 4.0 migration guide](docs/v4.mdx)
- [Payload documentation](https://payloadcms.com/docs)
