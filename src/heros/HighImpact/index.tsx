'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { ThemeHeroImage } from '@/BrandTheme/types'
import type { BrandTheme } from '@/brandThemes'
import { cn } from '@/utilities/ui'

type HighImpactHeroProps = Page['hero'] & {
  brandTheme?: BrandTheme
  themeHero?: ThemeHeroImage
}

export const HighImpactHero: React.FC<HighImpactHeroProps> = ({
  brandTheme,
  links,
  media,
  richText,
  themeHero,
}) => {
  const { setHeaderTheme } = useHeaderTheme()
  const isNorthstar = brandTheme === 'northstar'

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className={cn(
        'relative -mt-[10.4rem] flex min-h-[80vh] items-center justify-center text-white',
        isNorthstar && 'northstar-hero min-h-[92vh] items-end',
      )}
      data-theme="dark"
    >
      <div
        className={cn(
          'container mb-8 z-10 relative flex items-center justify-center',
          isNorthstar && 'northstar-hero__content justify-start',
        )}
      >
        <div className={cn('max-w-[36.5rem] md:text-center', isNorthstar && 'max-w-[52rem]')}>
          {isNorthstar ? (
            <span className="northstar-kicker">Design · Content · Technology</span>
          ) : null}
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className={cn('flex gap-4', !isNorthstar && 'md:justify-center')}>
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        {isNorthstar ? <span className="northstar-hero__index">Est. 2026 — 01</span> : null}
      </div>
      <div className="absolute inset-0 z-0 select-none">
        {themeHero?.url ? (
          // Theme images live in the repository and are served directly from public/theme-heroes.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={themeHero.alt || 'Homepage hero'}
            className="h-full w-full object-cover"
            src={themeHero.url}
          />
        ) : media && typeof media === 'object' ? (
          <Media fill imgClassName="object-cover" priority resource={media} />
        ) : null}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 bg-black/35 mix-blend-multiply',
            isNorthstar && 'northstar-hero__overlay',
          )}
        />
      </div>
    </div>
  )
}
