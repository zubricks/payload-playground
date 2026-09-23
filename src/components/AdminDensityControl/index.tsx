'use client'

import { Button, PopupList } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import './index.css'

type Density = 'comfortable' | 'compact'

const storageKey = 'payload-demo-density'
const densityChangeEvent = 'payload-demo-density-change'

function isDensity(value: null | string): value is Density {
  return value === 'compact' || value === 'comfortable'
}

function useAdminDensity() {
  const [density, setDensity] = useState<Density>('comfortable')

  useEffect(() => {
    const syncDensity = () => {
      const savedDensity = window.localStorage.getItem(storageKey)

      if (isDensity(savedDensity)) {
        setDensity(savedDensity)
        document.documentElement.dataset.density = savedDensity
      }
    }

    const syncStoredDensity = (event: StorageEvent) => {
      if (event.key === storageKey) syncDensity()
    }

    syncDensity()
    window.addEventListener(densityChangeEvent, syncDensity)
    window.addEventListener('storage', syncStoredDensity)

    return () => {
      window.removeEventListener(densityChangeEvent, syncDensity)
      window.removeEventListener('storage', syncStoredDensity)
    }
  }, [])

  const updateDensity = (nextDensity: Density) => {
    setDensity(nextDensity)
    document.documentElement.dataset.density = nextDensity
    window.localStorage.setItem(storageKey, nextDensity)
    window.dispatchEvent(new Event(densityChangeEvent))
  }

  return { density, updateDensity }
}

export function AdminDensityControl() {
  const { density, updateDensity } = useAdminDensity()

  return (
    <div className="admin-density" role="group" aria-label="Interface density">
      <span>Density</span>
      <Button
        aria-pressed={density === 'comfortable'}
        buttonStyle={density === 'comfortable' ? 'primary' : 'secondary'}
        margin={false}
        onClick={() => updateDensity('comfortable')}
      >
        Comfortable
      </Button>
      <Button
        aria-pressed={density === 'compact'}
        buttonStyle={density === 'compact' ? 'primary' : 'secondary'}
        margin={false}
        onClick={() => updateDensity('compact')}
      >
        Compact
      </Button>
    </div>
  )
}

export function DensityMenuSetting() {
  const { density, updateDensity } = useAdminDensity()

  return (
    <div data-popup-prevent-close>
      <PopupList.RadioGroup>
        <PopupList.RadioGroupItem
          active={density === 'comfortable'}
          onClick={() => updateDensity('comfortable')}
        >
          Comfortable
        </PopupList.RadioGroupItem>
        <PopupList.RadioGroupItem
          active={density === 'compact'}
          onClick={() => updateDensity('compact')}
        >
          Compact
        </PopupList.RadioGroupItem>
      </PopupList.RadioGroup>
    </div>
  )
}
