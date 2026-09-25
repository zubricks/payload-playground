'use client'

import { PopupList, useAuth } from '@payloadcms/ui'
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'

import {
  adminThemeConfig,
  adminThemes,
  getEnforcedAdminTheme,
  isAdminTheme,
  type AdminTheme,
} from '@/adminThemes'

const storageKeyPrefix = 'payload-demo-admin-theme'
const adminThemeChangeEvent = 'payload-demo-admin-theme-change'

const getStorageKey = (userID: unknown): string =>
  `${storageKeyPrefix}:${typeof userID === 'string' || typeof userID === 'number' ? userID : 'guest'}`

function useAdminTheme() {
  const { user } = useAuth()
  const userID = user?.id
  const role = 'role' in (user || {}) ? user?.role : undefined
  const enforcedTheme = getEnforcedAdminTheme(role)
  const storageKey = useMemo(() => getStorageKey(userID), [userID])
  const [preference, setPreference] = useState<AdminTheme>(adminThemeConfig.defaultTheme)
  const theme = enforcedTheme || preference

  useEffect(() => {
    const syncPreference = () => {
      const savedTheme = window.localStorage.getItem(storageKey)
      setPreference(isAdminTheme(savedTheme) ? savedTheme : adminThemeConfig.defaultTheme)
    }
    const syncStoredPreference = (event: StorageEvent) => {
      if (event.key === storageKey) syncPreference()
    }

    syncPreference()
    window.addEventListener(adminThemeChangeEvent, syncPreference)
    window.addEventListener('storage', syncStoredPreference)

    return () => {
      window.removeEventListener(adminThemeChangeEvent, syncPreference)
      window.removeEventListener('storage', syncStoredPreference)
    }
  }, [storageKey])

  useLayoutEffect(() => {
    document.documentElement.dataset.adminTheme = theme
  }, [theme])

  const updateTheme = (nextTheme: AdminTheme) => {
    if (enforcedTheme) return

    setPreference(nextTheme)
    document.documentElement.dataset.adminTheme = nextTheme
    window.localStorage.setItem(storageKey, nextTheme)
    window.dispatchEvent(new Event(adminThemeChangeEvent))
  }

  return { enforcedTheme, theme, updateTheme }
}

export function AdminThemeProvider({ children }: { children?: React.ReactNode }) {
  useAdminTheme()
  return children
}

export function AdminThemeMenuSetting() {
  const { enforcedTheme, theme, updateTheme } = useAdminTheme()

  return (
    <div data-popup-prevent-close>
      <PopupList.RadioGroup>
        {adminThemes.map((option) => (
          <PopupList.RadioGroupItem
            active={theme === option.value}
            disabled={Boolean(enforcedTheme)}
            key={option.value}
            onClick={() => updateTheme(option.value)}
          >
            {option.label}
          </PopupList.RadioGroupItem>
        ))}
      </PopupList.RadioGroup>
    </div>
  )
}
