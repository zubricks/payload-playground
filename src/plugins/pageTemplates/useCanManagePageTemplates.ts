'use client'

import { useAuth } from '@payloadcms/ui'

import type { User } from '@/payload-types'

export const useCanManagePageTemplates = (): boolean => {
  const { permissions, user } = useAuth<User>()
  const pageTemplatePermissions = permissions?.collections?.['page-templates']

  if (pageTemplatePermissions) {
    return pageTemplatePermissions.create === true
  }

  // Permissions are briefly unavailable while the Admin auth provider initializes.
  return Boolean(user && user.role !== 'content-editor')
}
