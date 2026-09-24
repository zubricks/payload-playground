'use client'

import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'

import { defaultBrandTheme, isBrandTheme, type BrandTheme } from '@/brandThemes'

const cachedBrandThemeKey = 'payload-demo-brand-theme-cache'

function getCachedBrandTheme(): BrandTheme {
  if (typeof window === 'undefined') return defaultBrandTheme

  const cachedTheme = window.localStorage.getItem(cachedBrandThemeKey)
  return isBrandTheme(cachedTheme) ? cachedTheme : defaultBrandTheme
}

export function AdminBrandThemeProvider({ children }: { children?: React.ReactNode }) {
  const [brandTheme, setBrandTheme] = useState<BrandTheme>(getCachedBrandTheme)

  const refreshBrandTheme = useCallback(async () => {
    try {
      const response = await fetch('/api/globals/brand-theme?depth=0', {
        credentials: 'same-origin',
      })

      if (!response.ok) return

      const data = (await response.json()) as { preset?: unknown }
      if (!isBrandTheme(data.preset)) return

      window.localStorage.setItem(cachedBrandThemeKey, data.preset)
      setBrandTheme(data.preset)
    } catch {
      // Keep the last known project theme if the Admin API is temporarily unavailable.
    }
  }, [])

  useLayoutEffect(() => {
    document.documentElement.dataset.brandTheme = brandTheme
  }, [brandTheme])

  useEffect(() => {
    void refreshBrandTheme()

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshBrandTheme()
    }

    window.addEventListener('focus', refreshBrandTheme)
    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      window.removeEventListener('focus', refreshBrandTheme)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [refreshBrandTheme])

  return children
}
