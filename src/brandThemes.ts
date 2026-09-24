import type { ThemeHeroImage } from '@/BrandTheme/types'

export type BrandTheme = 'northstar' | 'payload'

type BrandThemeDefinition = {
  description: string
  heroImage: null | ThemeHeroImage
  label: string
  previewImage: string
  value: BrandTheme
}

export const brandThemes: readonly BrandThemeDefinition[] = [
  {
    description: 'A clean, neutral foundation that keeps the focus on your content.',
    heroImage: null,
    label: 'Payload',
    previewImage: '/theme-previews/payload-home.jpg',
    value: 'payload',
  },
  {
    description: 'A warm, approachable theme for polished client-facing websites and apps.',
    // Add a hand-picked asset here, for example:
    // heroImage: { alt: '...', url: '/theme-heroes/northstar.webp' },
    heroImage: {
      alt: 'Cream Home Hero',
      url: '/theme-heroes/allison-saeng-1T3Cwc75Nrs-unsplash.jpg',
    },
    label: 'Northstar Cream',
    previewImage: '/theme-previews/northstar-home.jpg',
    value: 'northstar',
  },
] as const

export const brandThemeOptions = brandThemes.map(({ label, value }) => ({ label, value }))

export const defaultBrandTheme: BrandTheme = 'northstar'

export function isBrandTheme(value: unknown): value is BrandTheme {
  return value === 'payload' || value === 'northstar'
}
