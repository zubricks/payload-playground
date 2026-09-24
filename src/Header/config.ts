import type { ArrayFieldValidation, GlobalConfig, TextFieldValidation } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

type NavItemSiblingData = {
  kind?: 'dropdown' | 'link'
}

const validateDropdownLabel: TextFieldValidation = (value, { siblingData }) =>
  (siblingData as NavItemSiblingData | undefined)?.kind !== 'dropdown' ||
  Boolean(value) ||
  'Add a label for this dropdown.'

const validateDropdownItems: ArrayFieldValidation = (value, { siblingData }) =>
  (siblingData as NavItemSiblingData | undefined)?.kind !== 'dropdown' ||
  (Array.isArray(value) && value.length > 0) ||
  'Add at least one link to this dropdown.'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        {
          name: 'kind',
          type: 'radio',
          admin: {
            layout: 'horizontal',
          },
          defaultValue: 'link',
          options: [
            {
              label: 'Link',
              value: 'link',
            },
            {
              label: 'Dropdown',
              value: 'dropdown',
            },
          ],
        },
        link({
          appearances: false,
          overrides: {
            admin: {
              condition: (_, siblingData) => siblingData?.kind !== 'dropdown',
            },
          },
        }),
        {
          name: 'dropdownLabel',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.kind === 'dropdown',
          },
          label: 'Dropdown label',
          validate: validateDropdownLabel,
        },
        {
          name: 'dropdownItems',
          type: 'array',
          admin: {
            condition: (_, siblingData) => siblingData?.kind === 'dropdown',
            initCollapsed: true,
          },
          fields: [
            link({
              appearances: false,
            }),
          ],
          label: 'Dropdown links',
          maxRows: 8,
          minRows: 1,
          validate: validateDropdownItems,
        },
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
  versions: false,
}
