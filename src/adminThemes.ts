export type AdminTheme = 'light-cream' | 'stock'
export type AdminThemeRole = 'content-editor' | 'site-admin'

type AdminThemeDefinition = {
  description: string
  label: string
  value: AdminTheme
}

type AdminThemeEnforcement = {
  /** Omit roles to enforce the theme for every Admin user. */
  roles?: AdminThemeRole[]
  theme: AdminTheme
}

type AdminThemeConfig = {
  defaultTheme: AdminTheme
  enforcement: AdminThemeEnforcement | null
}

export const adminThemes: readonly AdminThemeDefinition[] = [
  {
    description: 'Payload’s default Admin UI styling.',
    label: 'Stock',
    value: 'stock',
  },
  {
    description: 'The warm cream and green interface created for this starter.',
    label: 'Light Cream',
    value: 'light-cream',
  },
] as const

/**
 * Set `enforcement` to `{ theme: 'light-cream' }` to enforce a theme for everyone, or add
 * `roles: ['content-editor']` to enforce it only for selected roles.
 */
export const adminThemeConfig: AdminThemeConfig = {
  defaultTheme: 'light-cream',
  enforcement: null,
}

export function isAdminTheme(value: unknown): value is AdminTheme {
  return value === 'stock' || value === 'light-cream'
}

export function getEnforcedAdminTheme(role: unknown): AdminTheme | null {
  const enforcement = adminThemeConfig.enforcement as AdminThemeEnforcement | null
  if (!enforcement) return null
  if (!enforcement.roles?.length) return enforcement.theme

  return enforcement.roles.includes(role as AdminThemeRole) ? enforcement.theme : null
}
