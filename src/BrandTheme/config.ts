import type { GlobalConfig } from 'payload'

import { siteAdmins } from '@/access/siteAdmins'
import { brandThemeOptions, defaultBrandTheme } from '@/brandThemes'
import { revalidateBrandTheme } from './hooks/revalidateBrandTheme'

export const BrandTheme: GlobalConfig = {
  slug: 'brand-theme',
  label: 'Theme',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
    update: siteAdmins,
  },
  fields: [
    {
      name: 'preset',
      type: 'radio',
      admin: {
        components: {
          Field: '@/components/BrandThemeSelector',
        },
        description:
          'Choose the project-wide brand theme. It is applied to both the website and the Payload Admin UI.',
      },
      defaultValue: defaultBrandTheme,
      options: [...brandThemeOptions],
      required: true,
    },
  ],
  hooks: {
    afterChange: [revalidateBrandTheme],
  },
  versions: false,
}
