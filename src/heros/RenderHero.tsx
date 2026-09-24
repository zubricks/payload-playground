import React from 'react'

import type { Page } from '@/payload-types'

import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'
import type { ThemeHeroImage } from '@/BrandTheme/types'
import type { BrandTheme } from '@/brandThemes'

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
}

type RenderHeroProps = Page['hero'] & {
  brandTheme?: BrandTheme
  themeHero?: ThemeHeroImage
}

export const RenderHero: React.FC<RenderHeroProps> = (props) => {
  const { brandTheme, themeHero, type } = props || {}

  if (!type || type === 'none') return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  if (type === 'highImpact') {
    return <HighImpactHero {...props} brandTheme={brandTheme} themeHero={themeHero} />
  }

  return <HeroToRender {...props} />
}
