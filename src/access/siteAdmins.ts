import type { Access } from 'payload'

type UserWithRole = {
  id?: number | string
  role?: 'content-editor' | 'site-admin' | null
}

export function isSiteAdmin(user: unknown): boolean {
  if (!user) return false

  const { role } = user as UserWithRole

  // Existing users created before roles were introduced remain Site Admins.
  return !role || role === 'site-admin'
}

export const siteAdmins: Access = ({ req: { user } }) => isSiteAdmin(user)

export const siteAdminsOrSelf: Access = ({ req: { user } }) => {
  if (isSiteAdmin(user)) return true
  if (!user) return false

  const { id } = user as UserWithRole
  if (id === undefined) return false

  return {
    id: {
      equals: id,
    },
  }
}
