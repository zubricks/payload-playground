import { ChevronDownIcon } from 'lucide-react'
import React from 'react'

import type { Header } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

type NavItemData = NonNullable<Header['navItems']>[number]

type Props = {
  appearance?: 'inline' | 'link'
  className?: string
  item: NavItemData
  mobile?: boolean
}

export const HeaderNavItem: React.FC<Props> = ({
  appearance = 'inline',
  className,
  item,
  mobile = false,
}) => {
  const dropdownItems = item.dropdownItems || []

  if (item.kind === 'dropdown' && item.dropdownLabel && dropdownItems.length > 0) {
    return (
      <details className={cn('header-dropdown', mobile && 'header-dropdown--mobile')}>
        <summary>
          {item.dropdownLabel}
          <ChevronDownIcon aria-hidden="true" className="header-dropdown__icon" />
        </summary>
        <div className="header-dropdown__menu">
          {dropdownItems.map(({ link }, index) => (
            <CMSLink appearance={appearance} key={index} {...link} />
          ))}
        </div>
      </details>
    )
  }

  return <CMSLink appearance={appearance} className={className} {...item.link} />
}
