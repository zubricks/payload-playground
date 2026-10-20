# Payload v4 Admin UI Starter

This project starts with Payload's website template, then replaces the generic dashboard experience
with configurable widgets, custom views, project-owned Admin styling, and components from
`@payloadcms/ui`. It is both a usable starter and a side-by-side demonstration of the Admin UI
patterns that changed between v3 and v4.

> [!IMPORTANT]
> This project currently uses Payload
> [`4.0.0-beta.3`](https://github.com/payloadcms/payload/releases/tag/v4.0.0-beta.3). Pin the version
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

### Project-owned Admin styling

[`custom.css`](<src/app/(payload)/custom.css>) defines the Light Cream Admin treatment: larger type
and controls, cream surfaces, green brand roles, shared radii, and explicit light and dark values.
The file is divided by responsibility so it can be used as a starting point for another brand.

This is intentionally normal project CSS, not a runtime theme selector or an installable theme
package. Every editor receives the same branded Admin treatment while Payload's light/dark color-mode
preference remains available.

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

Requirements:

- Node.js `24.15.0` or newer
- pnpm 9, 10, or 11
- MongoDB locally or through a hosted connection string

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Set `DATABASE_URL` and `PAYLOAD_SECRET` in `.env`, then open
[http://localhost:3000/admin](http://localhost:3000/admin) and create the first user.

To populate every dashboard state:

```bash
pnpm seed
```

> [!CAUTION]
> The seed is destructive. It clears the template's content collections and globals before
> recreating them. Never run it against a database containing content you need to keep.

The seed creates pages, published and draft posts, media, incomplete SEO states, forms, submissions,
header navigation, and a demonstration author:

- Email: `demo-author@example.com`
- Password: `password`

See [`src/endpoints/seed`](src/endpoints/seed) for the implementation.

## Using this in an existing project

Treat the repository as a set of patterns, not an all-or-nothing template.

The most reusable pieces are:

- Semantic Admin variables from [`custom.css`](<src/app/(payload)/custom.css>)
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
