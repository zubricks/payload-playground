import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isSiteAdmin, siteAdmins, siteAdminsOrSelf } from '../../access/siteAdmins'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: siteAdmins,
    delete: siteAdmins,
    read: authenticated,
    update: siteAdminsOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      access: {
        create: ({ req: { user } }) => !user || isSiteAdmin(user),
        update: ({ req: { user } }) => isSiteAdmin(user),
      },
      admin: {
        description: 'Site Admins can manage the shared brand theme and other project settings.',
        position: 'sidebar',
      },
      defaultValue: 'site-admin',
      options: [
        {
          label: 'Site Admin',
          value: 'site-admin',
        },
        {
          label: 'Content Editor',
          value: 'content-editor',
        },
      ],
      required: true,
      saveToJWT: true,
    },
  ],
  timestamps: true,
  versions: false,
}
