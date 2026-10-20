# Admin patterns

This guide maps the starter's Admin UI examples to reusable implementation patterns. The examples are
small enough to copy, but complete enough to demonstrate the server/client boundary, permissions,
component reuse, and theming.

## 1. Register a modular dashboard widget

Widgets are registered in `admin.dashboard.widgets`, while `defaultLayout` controls the initial set,
order, and width. Once rendered, users can customize their own layout.

```ts
admin: {
  dashboard: {
    defaultLayout: [
      {
        widgetSlug: 'editorial-focus',
        width: 'medium',
      },
    ],
    widgets: [
      {
        slug: 'editorial-focus',
        Component: '@/components/ContentStudioDashboard#EditorialFocusWidget',
        label: 'Editorial focus',
        minWidth: 'small',
        maxWidth: 'large',
      },
    ],
  },
}
```

Use `minWidth` and `maxWidth` to protect the usable range of the design. Treat `defaultLayout` as a
starting point, not a permanent user preference.

## 2. Fetch widget data on the server

Dashboard widgets receive `WidgetServerProps`. Query with the current user and explicitly disable the
Local API's default access override whenever the widget represents that user's permissions.

```tsx
import type { WidgetServerProps } from 'payload'

export async function ExampleWidget({ req }: WidgetServerProps) {
  const { payload, user } = req

  if (!user) return null

  const posts = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 5,
    overrideAccess: false,
    sort: '-updatedAt',
    user,
  })

  return <section>{posts.docs.map((post) => <p key={post.id}>{post.title}</p>)}</section>
}
```

This keeps data fetching, access checks, and serialization on the server.

## 3. Add a small client island

Keep the widget itself server-rendered and extract only the interactive portion into a client
component. This starter uses that pattern for recent-content tabs and the v3/v4 comparison dialog.

```tsx
// Server widget
export async function RecentContentWidget({ req }: WidgetServerProps) {
  const recent = await getRecentContent(req)
  const drafts = await getDraftContent(req)

  return <RecentContentTabs drafts={drafts} recent={recent} />
}
```

```tsx
'use client'

export function RecentContentTabs({ drafts, recent }: Props) {
  // Local UI state belongs here.
}
```

Pass the smallest serializable data shape the client component needs.

## 4. Use Payload UI components before rebuilding them

The dashboard imports components directly from `@payloadcms/ui`:

```tsx
import { Button, Pill, Thumbnail } from '@payloadcms/ui'

<Button buttonStyle="ghost" el="link" margin={false} to={postsURL}>
  View all content
</Button>

<Pill pillStyle="warning" rounded>
  5 to review
</Pill>
```

This preserves native interaction, focus, disabled, loading, and theme behavior. Use custom markup for
the product-specific layout around the primitive—not for rebuilding the primitive itself.

## 5. Style the Admin with semantic roles

The project-level `custom.css` changes Payload's supported semantic roles rather than targeting
individual component classes. Light Cream starts with a comfortable type scale and control size,
then changes shared color and shape roles:

```css
html {
  --ramp-blue-500: #83bf78;
  --color-bg: #faf7ed;
  --color-text-onbrand: #fff;
  --button-radius: 0.625rem;
  --field-min-height-large: 2.75rem;
}

html[data-theme='dark'],
html [data-theme='dark'] {
  --color-bg: #171a16;
  --color-text-brand: #add6a5;
}
```

Widget-specific CSS should continue using Payload's semantic tokens:

```css
.content-studio__panel {
  padding: var(--spacer-4);
  border: var(--stroke-width-small) solid var(--color-border);
  border-radius: var(--radius-large);
  background: var(--color-bg);
}
```

This lets custom surfaces respond to the same styling and color-mode changes as Payload components.
Define project-wide defaults on `html`, then add light and dark selectors for roles whose contrast
changes. Payload applies theme attributes to some portaled UI, so the color-mode selector supports
nested scopes as well as the root.

This styling is intentionally project-owned. It demonstrates how to brand one Payload Admin in v4
without introducing a runtime theme selector or additional theme packages.

`BrandThemeSelector` replaces the small default radio group with selectable homepage cards. Each
card contains a real homepage screenshot, a short description, and a native radio input wrapped by
the full card label. This makes the entire thumbnail keyboard- and pointer-selectable while keeping
the field connected to Payload's form state and validation.

### Keep website and Admin themes independent

`BrandTheme` is a Payload Global because it is project configuration, not a personal browser
preference. The frontend layout reads it on the server and renders `data-brand-theme`
on the root element, so there is no hydration-time brand flash:

```tsx
const brandTheme = await getCachedGlobal('brand-theme', 0)()

<html data-brand-theme={brandTheme.preset}>{children}</html>
```

Frontend components keep using semantic roles such as `bg-background`, `text-foreground`, and
`bg-primary`. The preset only remaps those roles. Light/dark mode remains a separate `data-theme`
attribute, allowing either brand preset to support both modes.

The website theme is project content and only Site Admins can change it. The standalone Admin
styling is code-owned and applies consistently to every editor. Light/dark mode remains an
independent accessibility preference without changing the website theme.

## 6. Respond to widget width

Payload exposes the selected width on the modular widget wrapper. When content needs a different
composition at a specific assigned width, scope the rule to the widget instance prefix:

```css
.widget[data-slug^='collection-shortcuts-'][data-width='medium']
  .content-studio__collections {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
```

Use this for widget configuration, and media/container queries for viewport or content constraints.

## 7. Create a custom Admin view

UI Lab demonstrates the server wrapper expected by Payload's `DefaultTemplate` and a client component
that renders the interactive examples. Register the view in `admin.components.views`:

```ts
views: {
  uiLab: {
    Component: '@/components/UILab',
    path: '/ui-lab',
    meta: {
      title: 'UI Lab',
    },
  },
}
```

Build URLs with `formatAdminURL` so the view continues to work if the Admin route changes.

## 8. Compose a custom field from Payload primitives

`HeadlineWorkbench` uses `useField` for form state and `TextInput` for the actual control. Pages and
Posts register it as their title field component:

```ts
{
  name: 'title',
  type: 'text',
  admin: {
    components: {
      Field: '@/components/HeadlineWorkbench',
    },
  },
}
```

The custom preview and character guidance are project-specific. Input behavior and styling remain
native to Payload.

## Adding another example

Before adding a new demo, make sure it teaches at least one reusable pattern:

- A server/client boundary
- Permission-aware data access
- A supported `@payloadcms/ui` component
- A semantic theme role
- A custom view or field extension point
- Responsive modular-widget behavior

If it only adds visual decoration, it probably belongs in the existing UI Lab rather than a new
dashboard widget.
